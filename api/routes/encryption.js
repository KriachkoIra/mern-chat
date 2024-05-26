import express from "express";
import {
  getPublicKey,
  getUserPublicKey,
  setPublicKey,
} from "../controllers/encrypt.controller.js";

const router = express.Router();

router.get("/public-key/:id", getUserPublicKey);
router.get("/public-key", getPublicKey);
router.post("/public-key", setPublicKey);

export default router;
