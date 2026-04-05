// ============================================================
// Auth Controller — HTTP Layer
// ============================================================
// This file is a THIN WRAPPER around auth.service.
// Its only job:
// 1. Extract data from req.body / req.user
// 2. Call the service function
// 3. Send the HTTP response (with proper status code)
// 4. Pass errors to next() (caught by global error handler)
//
// PATTERN:
//   try { call service → res.status().json() }
//   catch { next(error) }
//
// Notice how the controller has ZERO business logic.
// It doesn't hash passwords, check duplicates, or sign JWTs.
// That's all in the service.
// ============================================================

import * as authService from "./auth.service.js";

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    const { user, token } = await authService.registerUser({
      username,
      email,
      password,
      displayName,
    });

    // 201 = "Created" — the resource (user) was successfully created
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user, token },
    });
  } catch (error) {
    next(error); // → global error handler
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (protected — requires auth middleware)
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware.js (already verified JWT)
    const user = await authService.getCurrentUser(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
