// ============================================================
// MongoDB Connection
// ============================================================
// Connects to MongoDB using the URI from .env
// Called once in server.js before starting the HTTP server.
//
// WHY connect before starting the server?
// ──────────────────────────────────────
// This is the "fail-fast" principle. If MongoDB is unreachable,
// we want to know immediately — not after a user tries to register
// and gets a cryptic error. The server simply won't start if the
// DB connection fails.
// ============================================================

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // exit with failure — PM2/Docker will restart
  }
};

export default connectDB;
