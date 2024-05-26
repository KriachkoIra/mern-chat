import mongoose from "mongoose";

const KeySchema = new mongoose.Schema({
  prime: { type: String, required: true },
  generator: { type: String, required: true },
  publicKey: { type: String, required: true },
});

const Key = mongoose.model("Key", KeySchema);

export default Key;
