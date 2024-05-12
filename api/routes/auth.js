import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/register", (req, res) => {
  res.json("register ok.");
});

export default router;
