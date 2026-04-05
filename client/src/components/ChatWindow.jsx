import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import "../styles/chatwindow.css";

const ChatWindow = ({ room }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
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

  // Listen for new real-time messages + typing
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit("join_room", { roomId: room._id });

    const handleNewMessage = (message) => {
      if (message.room === room._id) {
        setMessages((prev) => [...prev, message]);
        // Remove from typing when they send a message
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== message.sender?._id),
        );
      }
    };

    const handleTyping = ({ userId, username, isTyping, roomId }) => {
      if (roomId !== room._id) return;
      if (userId === user?._id) return; // ignore own typing

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

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
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

  if (!room) {
    return (
      <div className="chat-window empty-state">
        <div className="empty-icon">💬</div>
        <h2>Welcome to CampusMesh</h2>
        <p>Select a room to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Room Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-room-icon">
            {room.type === "group" ? "🏠" : "🔒"}
          </span>
          <div>
            <h2>{room.name}</h2>
            <span className="chat-members">
              {room.members?.length || 0} members
            </span>
          </div>
        </div>
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
            const isOwn = msg.sender?._id?.toString() === user?._id?.toString();

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
            // Emit typing events
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
