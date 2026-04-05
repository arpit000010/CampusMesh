import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/sidebar.css";

const Sidebar = ({ activeRoom, onSelectRoom }) => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Get display name for a room
  const getRoomDisplayName = (room) => {
    if (room.type === "group") return room.name;
    // For private rooms, show the other person's name
    const otherUser = room.members?.find((m) => m._id !== user._id);
    return otherUser?.displayName || otherUser?.username || "Private Chat";
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
    </div>
  );
};

export default Sidebar;
