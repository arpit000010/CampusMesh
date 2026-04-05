import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import CreateRoom from "./CreateRoom";
import ExploreRooms from "./ExploreRooms";
import ChatRequests from "./ChatRequests";
import "../styles/sidebar.css";

const Sidebar = ({ activeRoom, onSelectRoom }) => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");
        setRooms(res.data.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Fetch pending request count on mount
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get("/chat-requests");
        setPendingCount(res.data.data.received?.length || 0);
      } catch (err) {
        console.error("Failed to fetch pending count:", err);
      }
    };
    fetchPendingCount();
  }, []);

  // Listen for real-time chat request events (always mounted)
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => {
      // Increment badge count when a new request arrives
      setPendingCount((prev) => prev + 1);
    };

    const handleRequestAccepted = (data) => {
      // When someone accepts OUR request, add the new room
      if (data.room) {
        setRooms((prev) => [data.room, ...prev]);
      }
    };

    socket.on("chat_request_sent", handleNewRequest);
    socket.on("chat_request_accepted", handleRequestAccepted);

    return () => {
      socket.off("chat_request_sent", handleNewRequest);
      socket.off("chat_request_accepted", handleRequestAccepted);
    };
  }, [socket]);

  const getRoomDisplayName = (room) => {
    if (room.type === "group") return room.name;
    const otherUser = room.members?.find((m) => m._id !== user._id);
    return otherUser?.displayName || otherUser?.username || "Private Chat";
  };

  const handleRoomCreated = (room) => {
    setRooms((prev) => [room, ...prev]);
    onSelectRoom(room);
  };

  const handleRoomJoined = (room) => {
    setRooms((prev) => [room, ...prev]);
    onSelectRoom(room);
  };

  const handleRequestAccepted = ({ room }) => {
    if (room) {
      setRooms((prev) => [room, ...prev]);
      onSelectRoom(room);
    }
    setShowRequests(false);
  };

  const handleOpenRequests = () => {
    setPendingCount(0); // Clear badge when opening
    setShowRequests(true);
  };

  return (
    <div className="sidebar">
      {/* User Header */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "?"}
          </div>
          <div className="user-details">
            <span className="user-name">
              {user?.displayName || user?.username}
            </span>
            <span className="user-status">🟢 Online</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          ⏻
        </button>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-actions">
        <button
          className="action-btn create"
          onClick={() => setShowCreate(true)}
        >
          + New Room
        </button>
        <button
          className="action-btn explore"
          onClick={() => setShowExplore(true)}
        >
          🔍 Explore
        </button>
      </div>
      <div className="sidebar-actions">
        <button
          className="action-btn explore"
          onClick={handleOpenRequests}
        >
          🤝 Chat Requests
          {pendingCount > 0 && (
            <span className="badge">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Room List */}
      <div className="room-list">
        <div className="room-list-header">
          <h3>Chats</h3>
        </div>

        {loading ? (
          <div className="rooms-loading">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="rooms-empty">No rooms yet. Create or join one!</div>
        ) : (
          rooms.map((room) => (
            <div
              key={room._id}
              className={`room-item ${activeRoom?._id === room._id ? "active" : ""}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-icon">
                {room.type === "group" ? "🏠" : "🔒"}
              </div>
              <div className="room-info">
                <span className="room-name">{getRoomDisplayName(room)}</span>
                <span className="room-preview">
                  {room.lastMessage ? "Last message..." : "No messages yet"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateRoom
          onClose={() => setShowCreate(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
      {showExplore && (
        <ExploreRooms
          onClose={() => setShowExplore(false)}
          onRoomJoined={handleRoomJoined}
        />
      )}
      {showRequests && (
        <ChatRequests
          onClose={() => setShowRequests(false)}
          onRequestAccepted={handleRequestAccepted}
        />
      )}
    </div>
  );
};

export default Sidebar;
