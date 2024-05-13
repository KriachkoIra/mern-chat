import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const registerUser = async function (req, res) {
  try {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });

    if (exists) {
      return res
        .status(400)
        .json({ message: "User with this username alredy exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    const createdUser = await newUser.save();

    try {
      const token = await jwt.sign(
        { id: createdUser._id, username },
        process.env.JWT_KEY
      );

      res
        .cookie("token", token)
        .status(201)
        .json({ id: createdUser._id, username });
    } catch (err) {
      throw err;
    }
  } catch (err) {}
};

const loginUser = async function (req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Username not found." });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(400).json({ message: "Password is incorrect." });
    }

    try {
      const token = await jwt.sign(
        { id: user._id, username },
        process.env.JWT_KEY
      );

      res.cookie("token", token).status(201).json({ id: user._id, username });
    } catch (err) {
      throw err;
    }
  } catch (err) {}
};

const verifyUser = async function (req, res) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json("No token.");
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) throw err;
      res.json(decoded);
    });
  } catch (err) {
    res.status(401).json("Invalid token.");
  }
};

export { registerUser, loginUser, verifyUser };
