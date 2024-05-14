import express from "express";
import mongoose from "mongoose";
import { getMessages } from "../controllers/messages.controller.js";

const router = express.Router();

router.get("/:id/:contactName", getMessages);

export default router;
