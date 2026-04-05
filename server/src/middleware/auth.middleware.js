// ============================================================
// Auth Middleware — JWT verification for REST routes
// ============================================================
// This middleware sits in front of protected routes and:
// 1. Extracts the JWT from the Authorization header
// 2. Verifies it's valid and not expired
// 3. Attaches the decoded user data to req.user
// 4. Calls next() to let the request continue
//
// If the token is missing or invalid, it throws a 401 error.
//
// NOTE: Socket.io has its OWN auth middleware (in sockets/index.js)
// because socket connections don't use HTTP headers the same way.
// Socket auth reads from socket.handshake.auth.token instead.
// ============================================================

import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB (exclude password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new ApiError(401, "User not found. Token may be invalid.");
    }

    // Attach user to request object — available in all subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
