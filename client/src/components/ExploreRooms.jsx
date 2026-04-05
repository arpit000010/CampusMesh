import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/modal.css";

const ExploreRooms = ({ onClose, onRoomJoined }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/available");
        setRooms(res.data.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleJoin = async (roomId) => {
    setJoining(roomId);
    try {
      const res = await api.post(`/rooms/${roomId}/join`);
      onRoomJoined(res.data.data.room);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Explore Rooms</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="explore-list">
          {loading ? (
            <div className="explore-loading">Discovering rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="explore-empty">No rooms available. Create one!</div>
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="explore-room">
                <div className="explore-room-info">
                  <div className="explore-room-icon">🏠</div>
                  <div>
                    <h3>{room.name}</h3>
                    <p>{room.description || "No description"}</p>
                    <div className="explore-room-meta">
                      <span>👥 {room.members?.length || 0} members</span>
                      {room.tags?.length > 0 && (
                        <span className="explore-tags">
                          {room.tags.map((tag) => (
                            <span key={tag} className="tag">
                              #{tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="explore-join-btn"
                  onClick={() => handleJoin(room._id)}
                  disabled={joining === room._id}
                >
                  {joining === room._id ? "Joining..." : "Join"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;
