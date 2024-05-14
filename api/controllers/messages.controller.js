import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { getUserData } from "./user.controller.js";

const getMessages = async function (req, res) {
  const userId = req.params.id;
  const contactName = req.params.contactName;

  // console.log(getUserData(req));

  try {
    const contact = await User.findOne({ username: contactName });
    if (!contact) throw "No contact found.";

    const contactId = contact._id;

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

    // console.log(messages);

    const messages2 = await Message.find();

    // console.log(messages2);

    res.json({ messages });
  } catch (err) {
    console.log(err);
  }
};

export { getMessages };
