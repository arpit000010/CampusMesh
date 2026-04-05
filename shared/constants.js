// ============================================================
// Shared Constants
// ============================================================
// These constants are shared between client and server to ensure
// both sides use the exact same event names and enum values.
//
// WHY share constants?
// ────────────────────
// If the server emits "new_message" but the client listens for
// "newMessage", nothing works and there's no error — just silence.
// By importing from the same file, typos become impossible.
// ============================================================

// ── Socket Event Names ─────────────────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECTION_ACK: "connection_ack",

  // Room events
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",

  // Message events
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  USER_TYPING: "user_typing",

  // Chat request events
  CHAT_REQUEST_SENT: "chat_request_sent",
  CHAT_REQUEST_ACCEPTED: "chat_request_accepted",
  CHAT_REQUEST_REJECTED: "chat_request_rejected",

  // Presence events
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  ONLINE_USERS: "online_users",
};

// ── Room Types ─────────────────────────────────────────────
export const ROOM_TYPES = {
  GROUP: "group",
  PRIVATE: "private",
};

// ── Chat Request Status ────────────────────────────────────
export const CHAT_REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// ── Message Types ──────────────────────────────────────────
export const MESSAGE_TYPES = {
  TEXT: "text",
  SYSTEM: "system",
  IMAGE: "image",
};
