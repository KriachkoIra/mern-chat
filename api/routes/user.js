import express from "express";
import mongoose from "mongoose";
import {
  getContacts,
  searchContacts,
  addContact,
} from "../controllers/contacts.controller.js";

const router = express.Router();

router.get("/:id/contacts", getContacts);
router.get("/:id/seachContacts", searchContacts);
router.post("/:id/contacts", addContact);
//router.delete("/:id/contacts", deleteContact);

export default router;
