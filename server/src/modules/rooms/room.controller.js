// ============================================================
// Room Controller — HTTP layer for room operations
// ============================================================

import * as roomService from "./room.service.js";

// POST /api/rooms — create a new group room
export const createRoom = async (req, res, next) => {
  try {
    const { name, description, tags } = req.body;
    const room = await roomService.createRoom({
      name,
      description,
      tags,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Room created",
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms — get all rooms the user is in
export const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getUserRooms(req.user._id);
    res.status(200).json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms/available — discover group rooms to join
export const getAvailableRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getAvailableRooms();
    res.status(200).json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms/:id — get single room details
export const getRoom = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/rooms/:id/join — join a group room
export const joinRoom = async (req, res, next) => {
  try {
    const room = await roomService.joinRoom(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};
