import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getAllUsers,
} from "../controllers/message.controller.js";

const router = Router();

// GET /api/messages?senderId=xxx&receiverId=yyy - Get messages between two users
router.get("/", getMessages);

// POST /api/messages - Send a message
router.post("/", sendMessage);

// GET /api/messages/users?currentUserId=xxx - Get all users that have message history with current user
router.get("/users", getAllUsers);

export default router;
