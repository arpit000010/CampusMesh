// ============================================================
// Message Model
// ============================================================
// A message belongs to a Room and was sent by a User.
// The same model works for group messages AND private DMs
// because both are just rooms.
//
// EXTENSIBILITY:
// - type: "text" now, but "image", "file", "system" later
// - metadata: for reactions, threads, link previews
// - readBy: for read receipts (future)
// ============================================================

import mongoose from "mongoose";
import { MESSAGE_TYPES } from "../../../shared/constants.js";

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
      index: true, // fast lookup: "get all messages in this room"
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [5000, "Message must be at most 5000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPES), // ["text", "system", "image"]
      default: MESSAGE_TYPES.TEXT,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: get messages in a room, sorted by time
messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
