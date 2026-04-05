// ============================================================
// Global Error Handler Middleware
// ============================================================
// Express calls this when any route/middleware calls next(error)
// or when an async error is thrown.
//
// It checks if the error is our custom ApiError (has statusCode)
// or a generic Error (defaults to 500).
//
// IMPORTANT: This middleware has 4 parameters (err, req, res, next).
// Express identifies error handlers by this 4-param signature.
// Remove any parameter and Express won't recognize it as an
// error handler.
// ============================================================

import ApiError from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  // Log the full error in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  }

  // If it's our custom ApiError, use its statusCode
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose validation error → 400
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose duplicate key error → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Everything else → 500
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
