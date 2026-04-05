// ChatRequest Model — will be implemented in Phase 8
import mongoose from "mongoose";

const chatRequestSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model("ChatRequest", chatRequestSchema);
