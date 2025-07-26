import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

// GET /api/messages?senderId=xxx&receiverId=yyy - Get messages between two users
router.get("/", getMessages);

// POST /api/messages - Send a message
router.post("/", sendMessage);

export default router;
