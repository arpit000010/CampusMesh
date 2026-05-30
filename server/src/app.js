// ============================================================
// app.js — The Express application
// ============================================================
// This file is ONLY about HTTP/REST — it configures:
// 1. Global middleware (CORS, JSON parsing, cookies)
// 2. API routes (mounted under /api)
// 3. Global error handler (catches anything thrown in routes)
//
// SEPARATION OF CONCERNS:
// ───────────────────────
// app.js  → handles HTTP requests (REST API)
// server.js → creates the server and attaches Socket.io
// sockets/ → handles WebSocket events (real-time)
//
// This separation means you can test Express routes without
// starting Socket.io, and vice versa.
// ============================================================

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// ── Global Middleware ──────────────────────────────────────
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allows cookies to be sent cross-origin
  }),
);
app.use(express.json()); // parse JSON request bodies

// ── API Routes ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "CampusMesh API",
    version: "1.0.0",
    status: "running",
    docs: "/api",
  });
});
app.use("/api", routes);

// ── Global Error Handler (must be last) ────────────────────
app.use(errorHandler);

export default app;
