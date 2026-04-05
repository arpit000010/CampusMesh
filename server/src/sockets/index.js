// ============================================================
// Socket.io Initialization — SKELETON (Phase 5 will flesh this out)
// ============================================================
// For now, this is a no-op so that server.js can import it
// without crashing. In Phase 5, we'll:
// 1. Create the Socket.io server instance
// 2. Add JWT authentication middleware for sockets
// 3. Register event handlers (chat, presence, rooms)
//
// SOCKET.IO vs PLAIN WEBSOCKETS:
// ─────────────────────────────
// Plain WebSockets give you a raw pipe — you send bytes back
// and forth. Socket.io adds:
// - Automatic reconnection (if WiFi drops, it reconnects)
// - Event-based API (emit/on instead of raw message parsing)
// - Rooms (broadcast to a group without managing arrays)
// - Fallback to HTTP long-polling (works behind strict firewalls)
// - Binary support, acknowledgements, middleware...
//
// Think of it like: WebSocket is TCP, Socket.io is HTTP.
// Both work, but Socket.io gives you structure.
// ============================================================

let io; // will hold the Socket.io server instance

export const initializeSocket = (httpServer) => {
  // Phase 5: Socket.io setup will go here
  console.log("🔌 Socket.io: placeholder initialized (Phase 5)");
};

// Export io so other parts of the app can emit events
// e.g., when a REST endpoint needs to notify a user in real-time
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized — call initializeSocket first");
  }
  return io;
};
