// ============================================================
// Auth Routes
// ============================================================
// Maps HTTP endpoints to controller functions.
//
// PUBLIC routes (no token needed):
//   POST /api/auth/register  → register a new account
//   POST /api/auth/login     → login with email + password
//
// PROTECTED routes (token required):
//   GET  /api/auth/me        → get current user profile
//
// The "authenticate" middleware runs BEFORE getMe and verifies
// the JWT. If valid, it sets req.user. If not, it throws 401.
// ============================================================

import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getMe);

export default router;
