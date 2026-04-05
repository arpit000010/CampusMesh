// Message Model — will be implemented in Phase 4
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
