// ============================================================
// ChatRequest Service
// ============================================================

import ChatRequest from "../../models/ChatRequest.js";
import Room from "../../models/Room.js";
import ApiError from "../../utils/ApiError.js";
import mongoose from "mongoose";
import {
  CHAT_REQUEST_STATUS,
  ROOM_TYPES,
} from "../../../../shared/constants.js";

// ── Send a chat request ──────────────────────────────────────
export const sendRequest = async (fromUserId, toUserId, message) => {
  // Can't send request to yourself
  if (fromUserId.toString() === toUserId.toString()) {
    throw new ApiError(400, "Cannot send a chat request to yourself");
  }

  // Check if a private room already exists between these two users
  const existingRoom = await Room.findOne({
    type: ROOM_TYPES.PRIVATE,
    members: { $all: [fromUserId, toUserId] },
    isActive: true,
  });

  if (existingRoom) {
    throw new ApiError(400, "You already have a private chat with this user");
  }

  // Check for existing pending request (either direction)
  const existingRequest = await ChatRequest.findOne({
    $or: [
      { from: fromUserId, to: toUserId, status: CHAT_REQUEST_STATUS.PENDING },
      { from: toUserId, to: fromUserId, status: CHAT_REQUEST_STATUS.PENDING },
    ],
  });

  if (existingRequest) {
    throw new ApiError(400, "A pending request already exists between you two");
  }

  const request = await ChatRequest.create({
    from: fromUserId,
    to: toUserId,
    message: message || "",
  });

  // Populate the 'from' user info so the receiver knows who sent it
  await request.populate("from", "username displayName avatar");

  return request;
};

// ── Get pending requests for a user ──────────────────────────
export const getMyRequests = async (userId) => {
  // Ensure userId is an ObjectId for proper query matching
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const received = await ChatRequest.find({
    to: userObjectId,
    status: CHAT_REQUEST_STATUS.PENDING,
  }).populate("from", "username displayName avatar");

  const sent = await ChatRequest.find({
    from: userObjectId,
    status: CHAT_REQUEST_STATUS.PENDING,
  }).populate("to", "username displayName avatar");

  return { received, sent };
};

// ── Accept a chat request (creates private room) ─────────────
export const acceptRequest = async (requestId, userId) => {
  const request = await ChatRequest.findById(requestId);

  if (!request) throw new ApiError(404, "Chat request not found");
  if (request.to.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the receiver can accept a request");
  }
  if (request.status !== CHAT_REQUEST_STATUS.PENDING) {
    throw new ApiError(400, "This request is no longer pending");
  }

  // Create the private room
  const room = await Room.create({
    name: `DM`, // will be displayed as the other user's name on client
    type: ROOM_TYPES.PRIVATE,
    members: [request.from, request.to],
    createdBy: request.to, // accepter creates the room
  });

  // Update the request
  request.status = CHAT_REQUEST_STATUS.ACCEPTED;
  request.room = room._id;
  await request.save();

  // Populate for the response
  await request.populate("from", "username displayName avatar");
  await request.populate("to", "username displayName avatar");

  return { request, room };
};

// ── Reject a chat request ────────────────────────────────────
export const rejectRequest = async (requestId, userId) => {
  const request = await ChatRequest.findById(requestId);

  if (!request) throw new ApiError(404, "Chat request not found");
  if (request.to.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the receiver can reject a request");
  }
  if (request.status !== CHAT_REQUEST_STATUS.PENDING) {
    throw new ApiError(400, "This request is no longer pending");
  }

  request.status = CHAT_REQUEST_STATUS.REJECTED;
  await request.save();

  return request;
};
