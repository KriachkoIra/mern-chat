import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sharp from "sharp";
import path from "path";

import { wss } from "../index.js";

const __dirname = path.resolve();

export function getUserData(req) {
  const token = req.cookies?.token;
  let data;

  if (token) {
    jwt.verify(token, process.env.JWT_KEY, {}, (err, decoded) => {
      if (err) return;
      data = decoded;
    });
  }

  return data;
}

export async function changeAvatar(req, res) {
  const userId = getUserData(req)?.id;
  const { data: fileData, fileName } = req.body;

  if (!userId) return res.status(400).json("Invalid user.");
  if (!fileData || !fileName) return res.status(400).json("Invalid file.");

  try {
    const user = await User.findById(userId);

    const data = fileData.split(",");
    const formattedData = data[data.length - 1];

    const splitted = fileName.split(".");
    const extension = splitted[splitted.length - 1];
    const newFileName = Date.now() + "." + extension;
    const bufferData = Buffer.from(formattedData, "base64");

    await sharp(bufferData)
      .webp({ quality: 20 })
      .toFile(__dirname + "/uploads/avatars/" + newFileName);

    (await User.find()).forEach((u) => {
      u.contacts
        ?.filter((c) => c.id.equals(user._id))
        .forEach(async (c) => {
          u.contacts = [
            ...u.contacts.filter((cont) => !cont.id.equals(user._id)),
            { id: user._id, username: user.username, avatar: newFileName },
          ];
          await u.save();
        });
    });

    user.avatar = newFileName;
    await user.save();

    res.json({ avatar: newFileName });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}

export async function getAvatar(req, res) {
  const userId = getUserData(req)?.id;

  if (!userId) return res.status(400).json("Invalid user.");

  try {
    const user = await User.findById(userId);
    res.json({ avatar: user.avatar });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}

export async function changeUsername(req, res) {
  const userId = getUserData(req)?.id;
  const { username } = req.body;

  if (!userId) return res.status(400).json("Invalid user.");
  if (!username) return res.status(400).json("Invalid username.");

  try {
    const user = await User.findById(userId);

    (await User.find()).forEach((u) => {
      u.contacts
        ?.filter((c) => c.id.equals(user._id))
        .forEach(async (c) => {
          u.contacts = [
            ...u.contacts.filter((cont) => !cont.id.equals(user._id)),
            { id: user._id, username, avatar: user.avatar },
          ];
          await u.save();
        });
    });

    [...wss.clients]
      .filter((cl) => cl.id === user._id)
      .forEach((cl) => (cl.username = user.username));

    user.username = username;
    await user.save();

    res.status(200).json("ok");
  } catch (err) {
    console.log(err);
    res.status(400);
  }
}
