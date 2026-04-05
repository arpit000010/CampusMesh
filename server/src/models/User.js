// User Model — will be implemented in Phase 3
// Placeholder so imports don't crash during scaffolding
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model("User", userSchema);
