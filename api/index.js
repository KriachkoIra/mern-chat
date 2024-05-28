import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import "dotenv/config";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import bodyParser from "body-parser";
import https from "https";

const __dirname = path.resolve();

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import messageRouter from "./routes/message.js";
import encryptRouter from "./routes/encryption.js";

import { addMessage } from "./controllers/messages.controller.js";
import { addNewMessageIndicator } from "./controllers/contacts.controller.js";
import { checkUserImage } from "./controllers/auth.controller.js";

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
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  "/uploads",
  checkUserImage,
  express.static(path.join(__dirname, "uploads"))
);
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
app.use("/encrypt", encryptRouter);

app.get("/", (req, res) => {
  res.json("ok");
});

const server = https.createServer(
  {
    pfx: fs.readFileSync("./certificate.pfx"),
    passphrase: process.env.PASSPHRASE,
  },
  app
);

server.listen(3001, () => {
  console.log("Server is running on port 3001.");
});

export const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  // terminate previous connections
  connection.checkIsAlive = setInterval(() => {
    connection.ping();
    connection.terminateTimer = setTimeout(() => {
      clearInterval(connection.checkIsAlive);
      connection.terminate();
    }, 1000);
  }, 5000);

  connection.on("pong", () => clearTimeout(connection.terminateTimer));

  const cookie = req.headers.cookie
    ?.split(";")
    .map((str) => str.trim())
    .find((str) => str.startsWith("token"));

  if (!cookie) return;

  const token = cookie.split("=")[1];

  jwt.verify(token, process.env.JWT_KEY, {}, (err, decoded) => {
    if (err) throw err;
    const { id, username } = decoded;

    connection.id = id;
    connection.username = username;
  });

  // receive message
  connection.on("message", async (messageUnparsed) => {
    const { message, to, fileName, fileData, isImage, iv } = JSON.parse(
      messageUnparsed.toString()
    );

    let newFileName = null;
    if (fileName) {
      const data = fileData.split(",");
      const formattedData = data[data.length - 1];

      const splitted = fileName.split(".");
      const extension = splitted[splitted.length - 1];
      newFileName = Date.now() + "." + extension;
      const bufferData = Buffer.from(formattedData, "base64");

      if (isImage) {
        newFileName = "min-" + newFileName;
        await sharp(bufferData)
          .webp({ quality: 20 })
          .toFile(__dirname + "/uploads/" + newFileName);
      } else {
        fs.writeFileSync(
          __dirname + "/uploads/" + newFileName,
          bufferData,
          (err) => err && console.error(err)
        );
      }
    }

    try {
      const savedMessage = await addMessage(
        message,
        connection.id,
        to,
        fileName,
        newFileName,
        isImage,
        iv
      );

      addNewMessageIndicator(to, connection.id);

      savedMessage &&
        [...wss.clients]
          .filter((cl) => cl.id === to)
          .forEach((cl) =>
            cl.send(
              JSON.stringify({
                message,
                from: connection.id,
                msgId: savedMessage._id,
                fileName,
                filePath: newFileName,
                createdAt: savedMessage.createdAt,
                iv,
              })
            )
          );
    } catch (err) {
      console.log(err);
    }
  });

  // get users online
  setInterval(() => {
    const usersOnline = [...wss.clients].map((user) => {
      return {
        id: user.id,
        username: user.username,
      };
    });

    [...wss.clients].forEach((client) =>
      client.send(JSON.stringify({ usersOnline }))
    );
  }, 3000);
});
