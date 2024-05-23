import express from "express";
import {
  getMessages,
  deleteMessage,
  editMessage,
} from "../controllers/messages.controller.js";

const router = express.Router();

router.get("/:contactId", getMessages);
router.delete("/:msgId", deleteMessage);
router.patch("/:msgId", editMessage);

export default router;
