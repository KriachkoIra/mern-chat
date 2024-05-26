import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { getUserData } from "./user.controller.js";
import { wss } from "../index.js";

const getMessages = async function (req, res) {
  const userId = getUserData(req)?.id;
  const contactId = req.params.contactId;

  const page = req.query.page || 1;

  if (!userId || !contactId)
    return res.status(400).json("Invalid user or contact.");

  try {
    const contact = await User.findById(contactId);
    if (!contact) throw "No contact found.";

    const messages = await Message.find({
      $or: [
        {
          $and: [{ to: contactId }, { from: userId }],
        },
        {
          $and: [{ to: userId }, { from: contactId }],
        },
      ],
    });

    const part = messages.slice(
      Math.max(0, messages.length - page * 30),
      messages.length
    );

    res.json({
      messages: part,
      isLast: messages.length - page * 30 <= 0,
    });
  } catch (err) {
    // console.log(err);
  }
};

const addMessage = async function (
  text,
  from,
  to,
  fileName,
  newFileName,
  isImage,
  iv
) {
  const fromUser = await User.findById(from);
  const toUser = await User.findById(to);

  const isInContacts = toUser.contacts.find((c) => c.id.equals(fromUser._id));

  if (!isInContacts) {
    toUser.contacts.push({
      username: fromUser.username,
      id: fromUser._id,
      avatar: fromUser.avatar,
      isNewMessage: true,
    });
    await toUser.save();
  }

  if (toUser) {
    const dbMessage = new Message({
      text,
      to,
      from,
      filePath: newFileName || null,
      fileName: fileName || null,
      isImage: isImage || null,
      iv,
    });

    const savedMessage = await dbMessage.save();
    return savedMessage;
  }

  return null;
};

const deleteMessage = async function (req, res) {
  const userId = getUserData(req)?.id;
  const msgId = req.params.msgId;

  if (!userId || !msgId)
    return res.status(400).json("Invalid user or message.");

  try {
    const message = await Message.findById(msgId);
    if (!message) throw "No message found.";
    if (!message.from.equals(userId)) throw "Message does not belong to user.";

    const to = message.to;

    await Message.findOneAndDelete({ _id: msgId });

    [...wss.clients]
      .filter((cl) => cl.id === to || to.equals(cl.id))
      .forEach((cl) => {
        cl.send(
          JSON.stringify({
            from: userId,
            deleted: msgId,
          })
        );
      });

    res.status(200).json("deleted");
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const editMessage = async function (req, res) {
  const userId = getUserData(req)?.id;
  const msgId = req.params.msgId;
  const newText = req.body.text;
  const iv = req.body.iv;

  if (!userId || !msgId || !newText)
    return res.status(400).json("Invalid user or message.");

  try {
    const message = await Message.findById(msgId);
    if (!message) throw "No message found.";
    if (!message.from.equals(userId)) throw "Message does not belong to user.";

    message.text = newText;
    message.iv = iv;
    await message.save();

    [...wss.clients]
      .filter((cl) => cl.id === message.to || message.to.equals(cl.id))
      .forEach((cl) => {
        cl.send(
          JSON.stringify({
            from: userId,
            updated: msgId,
            newText,
          })
        );
      });

    res.json("edited");
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export { getMessages, addMessage, deleteMessage, editMessage };
