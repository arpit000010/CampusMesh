// Room Model — will be implemented in Phase 4
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
