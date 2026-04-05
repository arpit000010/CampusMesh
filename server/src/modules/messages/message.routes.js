import { Router } from "express";
import { getRoomMessages } from "./message.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// GET /api/messages/:roomId — get messages for a room
router.get("/:roomId", getRoomMessages);

export default router;
