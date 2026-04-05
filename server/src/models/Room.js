// ============================================================
// Room Model — The universal chat container
// ============================================================
// Both group chats and private DMs are "rooms". This means:
// - All messaging code works the same for both
// - Adding new room types (geo, ephemeral) = just a new enum value
// - No special-case code for DMs vs groups
//
// FIELDS EXPLAINED:
// - type: "group" (many members) or "private" (exactly 2)
// - members: array of user IDs who can see this room
// - admins: who can manage the room (groups only)
// - tags: for future filtering (e.g., ["cse", "2024", "hostel-a"])
// - metadata: generic extensibility (e.g., { expiresAt, location })
// - lastMessage: for showing preview in room list sidebar
// ============================================================

import mongoose from "mongoose";
import { ROOM_TYPES } from "../../../shared/constants.js";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: [100, "Room name must be at most 100 characters"],
    },
    type: {
      type: String,
      enum: Object.values(ROOM_TYPES), // ["group", "private"]
      required: true,
      default: ROOM_TYPES.GROUP,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description must be at most 500 characters"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes for fast queries ──────────────────────────────
// "Find all rooms where this user is a member" is the most
// common query — this index makes it fast.
roomSchema.index({ members: 1 });
roomSchema.index({ type: 1 });

export default mongoose.model("Room", roomSchema);
