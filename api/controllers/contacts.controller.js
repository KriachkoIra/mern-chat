import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const getContacts = async function (req, res) {
  const userId = req.params.id;

  const user = await User.findById(userId);
  const contacts = user.contacts || [];

  res.json({ contacts });
};

const searchContacts = async function (req, res) {
  const userId = req.params.id;
  const usernameSearch = req.query.usernameSearch?.toLowerCase();

  const curUser = await User.findById(userId);
  const contacts = curUser.contacts || [];
  const contactNames = contacts.map((contact) => contact.username);

  try {
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
  const userId = req.params.id;
  const { usernameAdd } = req.body;

  try {
    const userToAdd = await User.findOne({ username: usernameAdd });
    if (!userToAdd) throw "Invalid user.";

    const curUser = await User.findById(userId);
    const contacts = curUser.contacts || [];
    contacts.push({ username: usernameAdd });

    await curUser.save();
    res.json({ contacts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export { getContacts, searchContacts, addContact };
