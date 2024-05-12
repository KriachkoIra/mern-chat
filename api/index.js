import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import "dotenv/config";

const uri = `mongodb+srv://kriachkoira:${process.env.DATABASE_PASS}@mern-chat.ch5jhfu.mongodb.net/?retryWrites=true&w=majority&appName=mern-chat`;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

try {
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  const User = new mongoose.model("User", { name: String });
  const testUser = new User({ name: "test user" });
  await testUser.save();
} finally {
  await mongoose.disconnect();
}

const app = express();

app.get("/test", (req, res) => {
  res.json("test ok.");
});

app.use("/auth", authRouter);

app.listen(3001, () => {
  console.log(`Server is running on port 3001.`);
});
