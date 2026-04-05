// ============================================================
// User Model
// ============================================================
// Represents a campus user. Fields are designed for:
// 1. Authentication (email, password, JWT)
// 2. Display (username, displayName, avatar)
// 3. Campus context (college, department, year, hostel)
// 4. Future features (metadata for smart routing, geo-chat)
//
// SECURITY NOTES:
// ───────────────
// - Password is hashed with bcryptjs BEFORE saving (pre-save hook)
// - Password is NEVER returned in queries (select: false)
// - comparePassword() method for login verification
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ── Auth fields ──────────────────────────────────────────
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      lowercase: true, // "ArpitYadav" → "arpityadav"
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // NEVER include password in queries by default
      // To include it: User.findById(id).select("+password")
    },

    // ── Display fields ───────────────────────────────────────
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, "Display name must be at most 50 characters"],
    },
    avatar: {
      type: String,
      default: "", // URL to avatar image
    },

    // ── Campus context ───────────────────────────────────────
    // These fields enable future features like:
    // - Smart routing (auto-join department room)
    // - Geo-based chat (hostel proximity)
    // - Filtered user search
    college: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
    },
    hostel: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Extensibility ────────────────────────────────────────
    // Generic metadata field for future features without
    // changing the schema (e.g., preferences, badges, streak)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
  },
);

// ── Pre-save Hook: Hash Password ─────────────────────────────
// This runs BEFORE every save(). It checks if the password field
// was modified (new user or password change) and hashes it.
//
// WHY "pre-save" and not in the controller?
// Because password hashing is a MODEL concern — wherever you
// create or update a user (registration, password reset, admin
// update), the hash happens automatically. You can't forget it.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Method: Compare Password ────────────────────────
// Used during login to verify the plaintext password against
// the stored hash. Returns true/false.
//
// WHY an instance method and not a standalone function?
// Because it needs access to `this.password` — the hashed
// password of THIS specific user document.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Transform: Clean JSON Output ─────────────────────────────
// When a user doc is converted to JSON (e.g., sent in API response),
// remove the password field and __v (Mongoose version key).
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export default mongoose.model("User", userSchema);
