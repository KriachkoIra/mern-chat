import express from "express";
import mongoose from "mongoose";
import {
  loginUser,
  registerUser,
  verifyUser,
  logoutUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify", verifyUser);

export default router;
