// ============================================================
// Room Handler — join/leave room socket events
// ============================================================
// When a user opens a chat room in the UI, their socket needs
// to "join" that Socket.io room to receive messages.
//
// Auto-join (on connection) handles existing rooms, but this
// handler covers:
// - Joining a NEW room after the socket is already connected
// - Leaving a room (e.g., user navigates away)
// - Notifying other members about join/leave
// ============================================================

import { SOCKET_EVENTS } from "../../../shared/constants.js";
import Room from "../models/Room.js";

export const registerRoomHandlers = (io, socket) => {
  // ── Join a room ────────────────────────────────────────────
  // Client emits this when they open a chat room in the UI.
  // We verify membership in MongoDB first — you can't just
  // join any room by sending its ID.
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async ({ roomId }) => {
    try {
      // Verify the user is actually a member of this room
      const room = await Room.findById(roomId);
      if (!room) return;

      const isMember = room.members.some(
        (id) => id.toString() === socket.user._id.toString(),
      );
      if (!isMember) return;

      // Join the Socket.io room
      socket.join(roomId);

      // Notify others in the room (not the joiner)
      socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, {
        userId: socket.user._id,
        username: socket.user.username,
        roomId,
      });

      console.log(`   ${socket.user.username} joined room ${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error.message);
    }
  });

  // ── Leave a room ───────────────────────────────────────────
  // Client emits this when they close/navigate away from a room.
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, ({ roomId }) => {
    socket.leave(roomId);

    // Notify others in the room
    socket.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, {
      userId: socket.user._id,
      username: socket.user.username,
      roomId,
    });

    console.log(`   ${socket.user.username} left room ${roomId}`);
  });
};
