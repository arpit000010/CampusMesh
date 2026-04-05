import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import roomRoutes from "../modules/rooms/room.routes.js";
import messageRoutes from "../modules/messages/message.routes.js";
import chatRequestRoutes from "../modules/chatRequests/chatRequest.routes.js";
import userRoutes from "../modules/users/user.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "CampusMesh API v1", status: "healthy" });
});

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/messages", messageRoutes);
router.use("/chat-requests", chatRequestRoutes);
router.use("/users", userRoutes);

export default router;
