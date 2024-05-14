import mongoose from "mongoose";
import User from "./User.js";

const MessageSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: User },
    from: { type: mongoose.Schema.Types.ObjectId, ref: User },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
