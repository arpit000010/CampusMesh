// ============================================================
// server.js — The entry point of CampusMesh
// ============================================================
// This file does 4 things in order:
// 1. Load environment variables (dotenv)
// 2. Connect to MongoDB
// 3. Create an HTTP server (NOT app.listen — explained below)
// 4. Attach Socket.io to that HTTP server
// 5. Start listening on the port
//
// WHY createServer(app) instead of app.listen()?
// ───────────────────────────────────────────────
// Express's app.listen() internally calls createServer(app) and
// returns the server. But Socket.io needs a reference to that
// HTTP server to intercept WebSocket upgrade requests.
// If we let Express create it internally, we can't access it.
// So we create it ourselves and pass it to both Express (via
// createServer) and Socket.io (via initializeSocket).
// ============================================================

import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./sockets/index.js";

const PORT = process.env.PORT || 5000;

// Step 1: Connect to MongoDB first (fail-fast principle)
// If DB is down, there's no point starting the server
connectDB().then(() => {
  // Step 2: Create the HTTP server with Express as the handler
  const httpServer = createServer(app);

  // Step 3: Attach Socket.io to the HTTP server
  // (we'll implement this in Phase 5, for now it's a no-op)
  initializeSocket(httpServer);

  // Step 4: Start listening
  httpServer.listen(PORT, () => {
    console.log(`⚡ CampusMesh server running on port ${PORT}`);
    console.log(`🌐 REST API:   http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io:  ws://localhost:${PORT}`);
  });
});
