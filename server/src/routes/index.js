// ============================================================
// Route Aggregator
// ============================================================
// This file imports all module routes and mounts them under
// their respective paths. app.js just does:
//   app.use("/api", routes);
//
// This keeps app.js clean and makes it easy to add new modules.
// Each module owns its own route file — this just wires them in.
// ============================================================

import { Router } from "express";

const router = Router();

// Health check
router.get("/", (req, res) => {
  res.json({ message: "CampusMesh API v1", status: "healthy" });
});

// ── Module routes will be added here as we build them ──────
// import authRoutes from "../modules/auth/auth.routes.js";
// router.use("/auth", authRoutes);

// import roomRoutes from "../modules/rooms/room.routes.js";
// router.use("/rooms", roomRoutes);

// import messageRoutes from "../modules/messages/message.routes.js";
// router.use("/messages", messageRoutes);

// import chatRequestRoutes from "../modules/chatRequests/chatRequest.routes.js";
// router.use("/chat-requests", chatRequestRoutes);

export default router;
