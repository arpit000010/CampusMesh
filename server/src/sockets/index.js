// ============================================================
// Socket.io Initialization
// ============================================================
// This file does 3 things:
// 1. Creates the Socket.io server and attaches it to HTTP server
// 2. Adds JWT authentication middleware (verifies every connection)
// 3. Registers event handlers when a client connects
//
// SOCKET AUTH vs REST AUTH:
// ────────────────────────
// REST: token comes in the Authorization header of each request
// Socket: token comes ONCE during the initial handshake
//         (socket.handshake.auth.token)
//
// After the handshake, the socket stays connected — no need to
// send the token again. The user info is stored on the socket
// object (socket.user) for the lifetime of the connection.
// ============================================================

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Room from "../models/Room.js";
import { SOCKET_EVENTS } from "../../../shared/constants.js";
import { registerChatHandlers } from "./chatHandler.js";
import { registerRoomHandlers } from "./roomHandler.js";
import { registerPresenceHandlers } from "./presenceHandler.js";

let io;

export const initializeSocket = (httpServer) => {
  // ── Step 1: Create Socket.io server ────────────────────────
  // The Server() constructor takes the HTTP server and options.
  // cors: same as Express cors — which origins can connect
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // ── Step 2: Authentication Middleware ───────────────────────
  // This runs BEFORE any "connection" event fires.
  // If the token is invalid, the client gets disconnected
  // immediately and never reaches the event handlers.
  //
  // Think of it like a bouncer at a club — you show your ID
  // (JWT) at the door. If it's fake, you don't get in.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify JWT (same secret as REST API)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user to socket — available in ALL event handlers
      // This is like req.user in Express, but for sockets
      socket.user = user;
      next(); // allow connection
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // ── Step 3: Handle Connections ─────────────────────────────
  // This fires for every authenticated client that connects.
  // Inside here, we:
  // 1. Auto-join the user to their DB rooms
  // 2. Register event handlers
  // 3. Send back an acknowledgment
  io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
    console.log(`🟢 User connected: ${socket.user.username} (${socket.id})`);

    // Join a personal room (named after userId) for direct notifications
    // This lets us emit events to a specific user (e.g., chat requests)
    // even though we don't know their socket ID
    socket.join(socket.user._id.toString());

    // ── Auto-join user to all their rooms ──────────────────
    // Find all rooms in MongoDB where this user is a member,
    // then call socket.join() for each one.
    // This means they'll instantly receive messages from ALL
    // their rooms without manually joining each one.
    try {
      const userRooms = await Room.find({
        members: socket.user._id,
        isActive: true,
      }).select("_id");

      userRooms.forEach((room) => {
        socket.join(room._id.toString());
      });

      console.log(`   Joined ${userRooms.length} rooms`);
    } catch (error) {
      console.error("Error joining rooms:", error.message);
    }

    // ── Send acknowledgment to client ──────────────────────
    // Let the client know the connection was successful
    // and who the server thinks they are
    socket.emit(SOCKET_EVENTS.CONNECTION_ACK, {
      userId: socket.user._id,
      username: socket.user.username,
      message: "Connected to CampusMesh",
    });

    // ── Register event handlers ────────────────────────────
    // Each handler file registers its own events on this socket.
    // We pass both `io` (for broadcasting) and `socket` (for
    // this specific connection).
    registerChatHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    // ── Handle disconnect ──────────────────────────────────
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`🔴 User disconnected: ${socket.user.username} (${reason})`);
    });
  });

  console.log("🔌 Socket.io: initialized with JWT auth");
};

// Export io so REST endpoints can emit events too
// e.g., when a chat request is accepted via REST API,
// we can notify the other user in real-time
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
