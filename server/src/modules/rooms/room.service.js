// ============================================================
// Room Service — Business logic for room operations
// ============================================================

import Room from "../../models/Room.js";
import ApiError from "../../utils/ApiError.js";
import { ROOM_TYPES } from "../../../../shared/constants.js";

// ── Create a group room ──────────────────────────────────────
export const createRoom = async ({ name, description, tags, createdBy }) => {
  const room = await Room.create({
    name,
    description,
    tags,
    type: ROOM_TYPES.GROUP,
    members: [createdBy], // creator is first member
    admins: [createdBy], // creator is first admin
    createdBy,
  });

  return room;
};

// ── Get all rooms for a user ─────────────────────────────────
export const getUserRooms = async (userId) => {
  const rooms = await Room.find({ members: userId, isActive: true })
    .populate("members", "username displayName avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 }); // most recent activity first

  return rooms;
};

// ── Get single room by ID ────────────────────────────────────
export const getRoomById = async (roomId, userId) => {
  const room = await Room.findById(roomId)
    .populate("members", "username displayName avatar")
    .populate("admins", "username displayName avatar")
    .populate("createdBy", "username displayName avatar");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  // Check if user is a member
  const isMember = room.members.some(
    (member) => member._id.toString() === userId.toString(),
  );
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this room");
  }

  return room;
};

// ── Join a room ──────────────────────────────────────────────
export const joinRoom = async (roomId, userId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }
  if (room.type === ROOM_TYPES.PRIVATE) {
    throw new ApiError(403, "Cannot join private rooms directly");
  }

  // Check if already a member
  const isMember = room.members.some(
    (id) => id.toString() === userId.toString(),
  );
  if (isMember) {
    throw new ApiError(400, "Already a member of this room");
  }

  room.members.push(userId);
  await room.save();

  return room;
};

// ── List all available group rooms (for discovery) ───────────
export const getAvailableRooms = async () => {
  const rooms = await Room.find({
    type: ROOM_TYPES.GROUP,
    isActive: true,
  })
    .populate("createdBy", "username displayName")
    .select("name description members tags createdAt")
    .sort({ createdAt: -1 });

  return rooms;
};
