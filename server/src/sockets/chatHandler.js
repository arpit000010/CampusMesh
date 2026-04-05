// ============================================================
// Chat Handler — message sending and typing indicators
// ============================================================
// This is where the real-time magic happens.
//
// FLOW:
// 1. Client emits "send_message" with { roomId, content }
// 2. Server validates (is user a member? is content valid?)
// 3. Server saves message to MongoDB
// 4. Server updates room's lastMessage
// 5. Server broadcasts "new_message" to the entire room
//
// WHY save to MongoDB AND broadcast?
// ──────────────────────────────────
// Broadcasting is instant but ephemeral — if a user is offline,
// they miss it. MongoDB is permanent — when they come back,
// they can fetch chat history via the REST API.
// So we do BOTH: persist for history, broadcast for real-time.
// ============================================================

import { SOCKET_EVENTS, MESSAGE_TYPES } from "../../../shared/constants.js";
import Message from "../models/Message.js";
import Room from "../models/Room.js";

export const registerChatHandlers = (io, socket) => {
  // ── Send a message ─────────────────────────────────────────
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async ({ roomId, content, type }) => {
    try {
      // Validate
      if (!roomId || !content || !content.trim()) return;

      // Verify user is a member of this room
      const room = await Room.findById(roomId);
      if (!room) return;

      const isMember = room.members.some(
        (id) => id.toString() === socket.user._id.toString(),
      );
      if (!isMember) return;

      // Save message to MongoDB
      const message = await Message.create({
        room: roomId,
        sender: socket.user._id,
        content: content.trim(),
        type: type || MESSAGE_TYPES.TEXT,
      });

      // Update room's lastMessage (for room list preview)
      room.lastMessage = message._id;
      await room.save();

      // Populate sender info before broadcasting
      await message.populate("sender", "username displayName avatar");

      // Broadcast to EVERYONE in the room (including sender)
      // The sender needs it too — to confirm the message was saved
      // and to get the server-generated _id and timestamp
      io.to(roomId).emit(SOCKET_EVENTS.NEW_MESSAGE, {
        _id: message._id,
        room: message.room,
        sender: message.sender,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  });

  // ── Typing indicators ──────────────────────────────────────
  // These are NOT saved to DB — they're ephemeral real-time only.
  // We use socket.to() (not io.to()) so the SENDER doesn't
  // receive their own typing event.
  socket.on(SOCKET_EVENTS.TYPING_START, ({ roomId }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.user._id,
      username: socket.user.username,
      roomId,
      isTyping: true,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, ({ roomId }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.user._id,
      username: socket.user.username,
      roomId,
      isTyping: false,
    });
  });
};
