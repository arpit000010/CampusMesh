// ============================================================
// Presence Service — In-memory online user tracking
// ============================================================
// Uses a Map where:
//   key = userId (string)
//   value = Set of socketIds (a user can have multiple tabs)
//
// A user is "online" if their Set has ≥1 socket.
// A user is "offline" when their Set becomes empty.
//
// SCALING NOTE:
// ─────────────
// This works for a SINGLE server instance. If you scale to
// multiple servers (load balancing), each server has its own
// Map — they can't see each other's online users.
// Fix: swap this Map with Redis pub/sub. The API stays the same.
// ============================================================

// userId → Set<socketId>
const onlineUsers = new Map();

// ── Add a socket for a user ──────────────────────────────────
// Returns true if this is the user's FIRST socket (they just came online)
export const addUser = (userId, socketId) => {
  const userIdStr = userId.toString();

  if (!onlineUsers.has(userIdStr)) {
    onlineUsers.set(userIdStr, new Set());
  }

  const wasOffline = onlineUsers.get(userIdStr).size === 0;
  onlineUsers.get(userIdStr).add(socketId);

  return wasOffline; // true = just came online, false = had other tabs
};

// ── Remove a socket for a user ───────────────────────────────
// Returns true if this was the user's LAST socket (they went offline)
export const removeUser = (userId, socketId) => {
  const userIdStr = userId.toString();

  if (!onlineUsers.has(userIdStr)) return false;

  onlineUsers.get(userIdStr).delete(socketId);

  if (onlineUsers.get(userIdStr).size === 0) {
    onlineUsers.delete(userIdStr);
    return true; // went fully offline
  }

  return false; // still has other tabs open
};

// ── Check if a user is online ────────────────────────────────
export const isUserOnline = (userId) => {
  const userIdStr = userId.toString();
  return onlineUsers.has(userIdStr) && onlineUsers.get(userIdStr).size > 0;
};

// ── Get all online user IDs ──────────────────────────────────
export const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

// ── Get online users from a list (e.g., room members) ────────
export const getOnlineUsersFromList = (userIds) => {
  return userIds.filter((id) => isUserOnline(id));
};
