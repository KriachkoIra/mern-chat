import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import WebSocket, { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import messageRouter from "./routes/message.js";

import Message from "./models/Message.js";
import User from "./models/User.js";

const uri = `mongodb+srv://kriachkoira:${process.env.DATABASE_PASS}@mern-chat.ch5jhfu.mongodb.net/?retryWrites=true&w=majority&appName=mern-chat`;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

try {
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} catch (err) {
  console.log(err);
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok.");
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/messages", messageRouter);

const server = app.listen(3001, () => {
  console.log(`Server is running on port 3001.`);
});

const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  // console.log("connected");

  const cookie = req.headers.cookie
    ?.split(";")
    .map((str) => str.trim())
    .find((str) => str.startsWith("token"));

  const token = cookie.split("=")[1];

  jwt.verify(token, process.env.JWT_KEY, {}, (err, decoded) => {
    if (err) throw err;
    const { id, username } = decoded;

    connection.userId = id;
    connection.username = username;
  });

  connection.on("message", async (messageUnparsed) => {
    const { message, to } = JSON.parse(messageUnparsed.toString());

    try {
      const toUser = await User.findOne({ username: to });

      if (toUser) {
        const dbMessage = new Message({
          text: message,
          to: toUser._id,
          from: connection.userId,
        });

        const savedMessage = await dbMessage.save();

        [...wss.clients]
          .filter((cl) => cl.username === to)
          .forEach((cl) =>
            cl.send(
              JSON.stringify({
                message,
                from: connection.username,
                msgId: savedMessage._id,
              })
            )
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  // console.log(token);

  const usersOnline = [...wss.clients].map((user) => {
    return {
      userId: user.userId,
      username: user.username,
    };
  });

  // console.log(usersOnline);

  [...wss.clients].forEach((client) =>
    client.send(JSON.stringify({ usersOnline }))
  );
});
