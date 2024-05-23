import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getUserData } from "./user.controller.js";

const getContacts = async function (req, res) {
  const userId = getUserData(req)?.id;

  if (!userId) return res.status(400).json({ message: "Invalid user." });

  try {
    const user = await User.findById(userId);
    const contacts = user.contacts || [];

    res.json({ contacts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const searchContacts = async function (req, res) {
  const userId = getUserData(req)?.id;
  const usernameSearch = req.query.usernameSearch?.toLowerCase();

  if (!userId || !usernameSearch)
    return res.status(400).json({ message: "Invalid user or contact." });

  try {
    const curUser = await User.findById(userId);
    const contacts = curUser.contacts || [];
    const contactNames = contacts.map((contact) => contact.username);

    const users = await User.find({
      username: { $regex: new RegExp(usernameSearch, "i") },
    });

    const resUsers =
      users.filter(
        (user) =>
          !contactNames.includes(user.username) &&
          curUser.username !== user.username
      ) || [];

    res.json({ users: resUsers });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addContact = async function (req, res) {
  const userId = getUserData(req)?.id;
  const { usernameAdd } = req.body;

  if (!userId || !usernameAdd)
    return res.status(400).json({ message: "Invalid user or contact." });

  try {
    const userToAdd = await User.findOne({ username: usernameAdd });
    if (!userToAdd) throw "Invalid user.";

    const curUser = await User.findById(userId);
    const contacts = curUser.contacts || [];
    contacts.push({
      username: usernameAdd,
      avatar: userToAdd.avatar,
      id: userToAdd._id,
    });

    await curUser.save();
    res.json({ contacts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const addNewMessageIndicator = async function (userId, contactId) {
  if (!userId || !contactId) return;

  try {
    const user = await User.findById(userId);
    if (!user) throw "Invalid user.";

    const contact = user.contacts.find((c) => c.id.equals(contactId));

    if (!contact) return;

    user.contacts = [
      { ...contact, isNewMessage: true },
      ...user.contacts.filter((c) => !c.id.equals(contactId)),
    ];
    await user.save();
  } catch (err) {
    console.log(err);
  }
};

const removeNewMessageIndicator = async function (req, res) {
  const userId = getUserData(req)?.id;
  const contactId = req.params.contactId;

  if (!userId || !contactId) return res.status(400).json("no user or contact.");

  try {
    const user = await User.findById(userId);
    if (!user) throw "Invalid user.";

    const contact = user.contacts.find((c) => c.id.equals(contactId));

    if (!contact) return;

    user.contacts = [
      { ...contact, isNewMessage: false },
      ...user.contacts.filter((c) => !c.id.equals(contactId)),
    ];
    await user.save();

    res.json(user.contacts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getContactsNewMessages = async function (req, res) {
  const userId = getUserData(req)?.id;

  if (!userId) return res.status(400).json("no user.");

  try {
    const user = await User.findById(userId);
    if (!user) throw "Invalid user.";

    const contactsWithNewMessages = user.contacts
      .filter((c) => c.isNewMessage)
      .map((c) => c.id);

    res.json(contactsWithNewMessages);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export {
  getContacts,
  searchContacts,
  addContact,
  addNewMessageIndicator,
  removeNewMessageIndicator,
  getContactsNewMessages,
};
