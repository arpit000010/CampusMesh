import { useState } from "react";
import api from "../services/api";
import "../styles/modal.css";

const CreateRoom = ({ onClose, onRoomCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Room name is required");

    setLoading(true);
    setError("");
    try {
      const res = await api.post("/rooms", {
        name: name.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onRoomCreated(res.data.data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a Room</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}

          <div className="modal-field">
            <label>Room Name</label>
            <input
              type="text"
              placeholder="e.g., CS Department"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Description</label>
            <input
              type="text"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="cse, 2024, department"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
