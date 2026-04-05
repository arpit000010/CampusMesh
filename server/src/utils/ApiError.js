// ============================================================
// ApiError — Custom error class for consistent error handling
// ============================================================
// Instead of throwing plain Error objects, we throw ApiError
// with a statusCode. The global error handler in error.middleware.js
// catches these and sends a clean JSON response.
//
// Usage:
//   throw new ApiError(404, "Room not found");
//   throw new ApiError(401, "Invalid credentials");
//
// WHY a custom class?
// ──────────────────
// Express doesn't know about HTTP status codes when you throw.
// By attaching statusCode to the error object, our error handler
// can send the right HTTP status instead of always sending 500.
// ============================================================

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export default ApiError;
