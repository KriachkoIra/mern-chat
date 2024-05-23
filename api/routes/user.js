import express from "express";
import mongoose from "mongoose";
import {
  getContacts,
  searchContacts,
  addContact,
  addNewMessageIndicator,
  removeNewMessageIndicator,
  getContactsNewMessages,
} from "../controllers/contacts.controller.js";
import {
  changeAvatar,
  getAvatar,
  changeUsername,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/contacts", getContacts);
router.get("/searchContacts", searchContacts);
router.post("/contacts", addContact);
router.delete(
  "/contacts/removeNewMessage/:contactId",
  removeNewMessageIndicator
);
router.get("/contactsWithNewMessages", getContactsNewMessages);
router.get("/avatar", getAvatar);
router.post("/avatar", changeAvatar);
router.patch("/", changeUsername);

export default router;
