// ============================================================
// ChatRequest Controller
// ============================================================
// Uses getIO() to emit real-time events when requests are
// sent/accepted/rejected. This is the bridge between REST
// and Socket.io — a REST endpoint triggers a socket event.
// ============================================================

import * as chatRequestService from "./chatRequest.service.js";
import { getIO } from "../../sockets/index.js";
import { SOCKET_EVENTS } from "../../../../shared/constants.js";

// POST /api/chat-requests
export const sendRequest = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    const request = await chatRequestService.sendRequest(
      req.user._id,
      to,
      message,
    );

    // Notify the receiver in real-time via Socket.io
    // getIO() gives us the Socket.io server instance
    // We emit to the receiver's userId (they join a room
    // named after their own userId on connection — we'll add this)
    const io = getIO();
    io.to(to).emit(SOCKET_EVENTS.CHAT_REQUEST_SENT, {
      requestId: request._id,
      from: request.from,
      message: request.message,
    });

    res.status(201).json({
      success: true,
      message: "Chat request sent",
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat-requests
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await chatRequestService.getMyRequests(req.user._id);
    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/chat-requests/:id/accept
export const acceptRequest = async (req, res, next) => {
  try {
    const { request, room } = await chatRequestService.acceptRequest(
      req.params.id,
      req.user._id,
    );

    // Notify the original sender that their request was accepted
    const io = getIO();
    io.to(request.from._id.toString()).emit(
      SOCKET_EVENTS.CHAT_REQUEST_ACCEPTED,
      {
        requestId: request._id,
        roomId: room._id,
        with: request.to,
      },
    );

    res.status(200).json({
      success: true,
      message: "Chat request accepted. Private room created!",
      data: { request, room },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/chat-requests/:id/reject
export const rejectRequest = async (req, res, next) => {
  try {
    const request = await chatRequestService.rejectRequest(
      req.params.id,
      req.user._id,
    );

    // Notify the sender
    const io = getIO();
    io.to(request.from.toString()).emit(SOCKET_EVENTS.CHAT_REQUEST_REJECTED, {
      requestId: request._id,
    });

    res.status(200).json({
      success: true,
      message: "Chat request rejected",
    });
  } catch (error) {
    next(error);
  }
};
