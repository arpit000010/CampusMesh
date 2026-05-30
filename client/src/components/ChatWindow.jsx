import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import "../styles/chatWindow.css";

const ChatWindow = ({ room }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch message history when room changes
  useEffect(() => {
    if (!room) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${room._id}`);
        setMessages(res.data.data.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    setNewMessage("");
    inputRef.current?.focus();
  }, [room]);

  // Listen for real-time messages + typing + presence
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit("join_room", { roomId: room._id });

    const handleNewMessage = (message) => {
      if (message.room === room._id) {
        setMessages((prev) => [...prev, message]);
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== message.sender?._id)
        );
      }
    };

    const handleTyping = ({ userId, username, isTyping, roomId }) => {
      if (roomId !== room._id) return;
      if (userId === user?._id) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find((u) => u.userId === userId)) {
            return [...prev, { userId, username }];
          }
          return prev;
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleOnlineList = ({ userIds }) => {
      setOnlineUsers(new Set(userIds));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("online_users", handleOnlineList);

    // Request current online users for this room
    socket.emit("get_online_users", { roomId: room._id });

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("online_users", handleOnlineList);
      socket.emit("leave_room", { roomId: room._id });
      setTypingUsers([]);
    };
  }, [socket, room]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !room) return;

    socket.emit("send_message", {
      roomId: room._id,
      content: newMessage.trim(),
    });

    setNewMessage("");
    inputRef.current?.focus();
  };

  // Format timestamp
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get display name for the room
  const getRoomDisplayName = () => {
    if (!room) return "";
    if (room.type === "group") return room.name;
    const otherUser = room.members?.find(
      (m) => m._id?.toString() !== user?._id?.toString()
    );
    return otherUser?.displayName || otherUser?.username || room.name;
  };

  // Get online count (excluding self)
  const getOnlineCount = () => {
    let count = 0;
    onlineUsers.forEach((id) => {
      if (id !== user?._id) count++;
    });
    return count;
  };

  if (!room) {
    return (
      <div className="chat-window empty-state">
        <div className="empty-icon">💬</div>
        <h2>Welcome to CampusMesh</h2>
        <p>Select a room to start chatting</p>
      </div>
    );
  }

  const onlineCount = getOnlineCount();

  return (
    <div className="chat-window">
      {/* Room Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-room-icon">
            {room.type === "group" ? "🏠" : "🔒"}
          </span>
          <div>
            <h2>{getRoomDisplayName()}</h2>
            <span className="chat-members">
              {room.members?.length || 0} members
              {onlineCount > 0 && (
                <span className="online-count">
                  {" "}
                  · {onlineCount} online
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Online Avatars */}
        {room.members && room.members.length > 0 && (
          <div className="online-avatars">
            {room.members
              .filter((m) => m._id?.toString() !== user?._id?.toString())
              .slice(0, 5)
              .map((member) => (
                <div
                  key={member._id}
                  className={`mini-avatar ${
                    onlineUsers.has(member._id) ? "is-online" : ""
                  }`}
                  title={`${member.displayName || member.username}${
                    onlineUsers.has(member._id) ? " (online)" : " (offline)"
                  }`}
                >
                  {member.displayName?.charAt(0) ||
                    member.username?.charAt(0) ||
                    "?"}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn =
              msg.sender?._id?.toString() === user?._id?.toString();

            return (
              <div
                key={msg._id}
                className={`message ${isOwn ? "own" : "other"}`}
              >
                {!isOwn && (
                  <div className="message-avatar">
                    {msg.sender?.displayName?.charAt(0) ||
                      msg.sender?.username?.charAt(0) ||
                      "?"}
                  </div>
                )}
                <div className="message-content">
                  {!isOwn && (
                    <span className="message-sender">
                      {msg.sender?.displayName || msg.sender?.username}
                    </span>
                  )}
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            {typingUsers.map((u) => u.username).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (socket && room) {
              socket.emit("typing_start", { roomId: room._id });
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing_stop", { roomId: room._id });
              }, 2000);
            }
          }}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
