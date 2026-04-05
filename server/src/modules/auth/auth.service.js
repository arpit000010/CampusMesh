// ============================================================
// Auth Service — Business Logic Layer
// ============================================================
// This file contains the PURE BUSINESS LOGIC for authentication.
// It does NOT know about HTTP requests, responses, or status codes.
// It receives plain data, does its job, and returns results or
// throws errors.
//
// WHY separate Service from Controller?
// ─────────────────────────────────────
// 1. Reusability: The service can be called from REST controllers,
//    Socket.io handlers, CLI scripts, or tests — all without
//    duplicating logic.
// 2. Testability: You can unit test the service without mocking
//    HTTP req/res objects.
// 3. Single responsibility: Controller handles HTTP, Service
//    handles business rules.
//
// EXAMPLE:
//   Controller says: "I got a POST request with this body"
//   Service says: "I'll validate, hash, save, and give you a token"
//   Controller says: "I'll send that token back as a 201 response"
// ============================================================

import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import ApiError from "../../utils/ApiError.js";

// ── Helper: Generate JWT ─────────────────────────────────────
// Creates a signed token containing the userId.
// The token is valid for JWT_EXPIRES_IN (default 7 days).
//
// WHAT'S INSIDE A JWT?
// A JWT has 3 parts: header.payload.signature
// - Header: algorithm + type ({"alg":"HS256","typ":"JWT"})
// - Payload: your data ({"userId":"abc123","iat":...,"exp":...})
// - Signature: HMAC(header + payload, JWT_SECRET)
//
// Anyone can READ the payload (it's base64, not encrypted).
// But only the server can VERIFY the signature (needs the secret).
// So never put passwords or secrets in the JWT payload.
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ── Register ─────────────────────────────────────────────────
export const registerUser = async ({ username, email, password, displayName }) => {
  // Check if user already exists (email or username)
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, "Email already registered");
    }
    throw new ApiError(409, "Username already taken");
  }

  // Create user (password is auto-hashed by pre-save hook)
  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username,
  });

  // Generate JWT
  const token = generateToken(user._id);

  return { user, token };
};

// ── Login ────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // Find user by email AND include password (normally excluded)
  // .select("+password") overrides the schema's select: false
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
    // We don't say "email not found" — that would let attackers
    // enumerate valid emails. Always use a generic message.
  }

  // Compare plaintext password with stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Generate JWT
  const token = generateToken(user._id);

  return { user, token };
};

// ── Get Current User ─────────────────────────────────────────
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
