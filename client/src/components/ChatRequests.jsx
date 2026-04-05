import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import "../styles/modal.css";

const ChatRequests = ({ onClose, onRequestAccepted }) => {
  const socket = useSocket();
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("received");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => fetchRequests();
    const handleAccepted = (data) => {
      onRequestAccepted(data);
      fetchRequests();
    };

    socket.on("chat_request_sent", handleNewRequest);
    socket.on("chat_request_accepted", handleAccepted);

    return () => {
      socket.off("chat_request_sent", handleNewRequest);
      socket.off("chat_request_accepted", handleAccepted);
    };
  }, [socket]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/users/search?q=${searchQuery.trim()}`);
        setSearchResults(res.data.data.users);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/chat-requests");
      setRequests(res.data.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedUser) return;
    setSending(true);
    setError("");
    try {
      await api.post("/chat-requests", {
        to: selectedUser._id,
        message: message.trim(),
      });
      setSelectedUser(null);
      setSearchQuery("");
      setMessage("");
      setTab("sent");
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await api.patch(`/chat-requests/${requestId}/accept`);
      onRequestAccepted({
        roomId: res.data.data.room._id,
        room: res.data.data.room,
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.patch(`/chat-requests/${requestId}/reject`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chat Requests</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="cr-tabs">
          <button
            className={`cr-tab ${tab === "received" ? "active" : ""}`}
            onClick={() => setTab("received")}
          >
            Received{" "}
            {requests.received.length > 0 && `(${requests.received.length})`}
          </button>
          <button
            className={`cr-tab ${tab === "sent" ? "active" : ""}`}
            onClick={() => setTab("sent")}
          >
            Sent
          </button>
          <button
            className={`cr-tab ${tab === "new" ? "active" : ""}`}
            onClick={() => setTab("new")}
          >
            + New
          </button>
        </div>

        {/* NEW REQUEST TAB — with user search */}
        {tab === "new" && (
          <div className="cr-new-form">
            {error && <div className="modal-error">{error}</div>}

            {/* Selected User */}
            {selectedUser ? (
              <div className="cr-selected-user">
                <div className="cr-item-info">
                  <div className="cr-avatar">
                    {selectedUser.displayName?.charAt(0) ||
                      selectedUser.username?.charAt(0)}
                  </div>
                  <div>
                    <h4>
                      {selectedUser.displayName || selectedUser.username}
                    </h4>
                    <span style={{ fontSize: "0.7rem", color: "#888" }}>
                      @{selectedUser.username}
                    </span>
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setSelectedUser(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="modal-field">
                <label>Search User</label>
                <input
                  type="text"
                  placeholder="Type a username or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {/* Search Results */}
            {!selectedUser && searchQuery.trim().length >= 2 && (
              <div className="cr-search-results">
                {searching ? (
                  <div className="explore-loading">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="explore-empty">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="cr-item cr-item-clickable"
                      onClick={() => {
                        setSelectedUser(u);
                        setSearchQuery("");
                      }}
                    >
                      <div className="cr-item-info">
                        <div className="cr-avatar">
                          {u.displayName?.charAt(0) || u.username?.charAt(0)}
                        </div>
                        <div>
                          <h4>{u.displayName || u.username}</h4>
                          <span style={{ fontSize: "0.7rem", color: "#888" }}>
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Message + Send */}
            {selectedUser && (
              <>
                <div className="modal-field" style={{ marginTop: "0.75rem" }}>
                  <label>Message (optional)</label>
                  <input
                    type="text"
                    placeholder="Hey, want to chat?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button
                  className="modal-submit"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Request"}
                </button>
              </>
            )}
          </div>
        )}

        {/* RECEIVED TAB */}
        {tab === "received" && (
          <div className="cr-list">
            {loading ? (
              <div className="explore-loading">Loading...</div>
            ) : requests.received.length === 0 ? (
              <div className="explore-empty">No pending requests</div>
            ) : (
              requests.received.map((req) => (
                <div key={req._id} className="cr-item">
                  <div className="cr-item-info">
                    <div className="cr-avatar">
                      {req.from?.displayName?.charAt(0) ||
                        req.from?.username?.charAt(0)}
                    </div>
                    <div>
                      <h4>{req.from?.displayName || req.from?.username}</h4>
                      {req.message && <p>"{req.message}"</p>}
                    </div>
                  </div>
                  <div className="cr-actions">
                    <button
                      className="cr-accept"
                      onClick={() => handleAccept(req._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="cr-reject"
                      onClick={() => handleReject(req._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SENT TAB */}
        {tab === "sent" && (
          <div className="cr-list">
            {requests.sent.length === 0 ? (
              <div className="explore-empty">No sent requests</div>
            ) : (
              requests.sent.map((req) => (
                <div key={req._id} className="cr-item">
                  <div className="cr-item-info">
                    <div className="cr-avatar">
                      {req.to?.displayName?.charAt(0) ||
                        req.to?.username?.charAt(0)}
                    </div>
                    <div>
                      <h4>{req.to?.displayName || req.to?.username}</h4>
                      <span className="cr-status">⏳ Pending</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRequests;
