// ============================================================
// Message Service — Business logic for messages
// ============================================================

import Message from "../../models/Message.js";
import Room from "../../models/Room.js";
import ApiError from "../../utils/ApiError.js";

// ── Get messages for a room (paginated) ──────────────────────
export const getRoomMessages = async (
  roomId,
  userId,
  { page = 1, limit = 50 },
) => {
  // Verify user is a member of this room
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const isMember = room.members.some(
    (id) => id.toString() === userId.toString(),
  );
  if (!isMember) throw new ApiError(403, "Not a member of this room");

  const messages = await Message.find({ room: roomId })
    .populate("sender", "username displayName avatar")
    .sort({ createdAt: -1 }) // newest first
    .skip((page - 1) * limit)
    .limit(limit);

  // Return in chronological order (oldest first) for display
  return messages.reverse();
};
