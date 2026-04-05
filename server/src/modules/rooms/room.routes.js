// ============================================================
// Room Routes
// ============================================================
// All room routes are protected (require auth token).
//
// POST   /api/rooms           → create a group room
// GET    /api/rooms           → list my rooms
// GET    /api/rooms/available → discover rooms to join
// GET    /api/rooms/:id       → get room details
// POST   /api/rooms/:id/join  → join a group room
// ============================================================

import { Router } from "express";
import {
  createRoom,
  getMyRooms,
  getAvailableRooms,
  getRoom,
  joinRoom,
} from "./room.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", createRoom);
router.get("/", getMyRooms);
router.get("/available", getAvailableRooms);
router.get("/:id", getRoom);
router.post("/:id/join", joinRoom);

export default router;
