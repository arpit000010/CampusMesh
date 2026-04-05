// ============================================================
// ChatRequest Model
// ============================================================
// Tracks the lifecycle of a private chat request:
//   pending → accepted (creates room) OR rejected
//
// WHY a separate model instead of just creating rooms?
// ────────────────────────────────────────────────────
// Because consent matters. In a campus app, you don't want
// anyone to just DM you. The receiver must explicitly accept.
// This model tracks that consent flow.
// ============================================================

import mongoose from "mongoose";
import { CHAT_REQUEST_STATUS } from "../../../shared/constants.js";

const chatRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CHAT_REQUEST_STATUS),
      default: CHAT_REQUEST_STATUS.PENDING,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, "Request message must be at most 200 characters"],
      default: "",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null, // only set after acceptance
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate pending requests
chatRequestSchema.index(
  { from: 1, to: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  },
);

export default mongoose.model("ChatRequest", chatRequestSchema);
