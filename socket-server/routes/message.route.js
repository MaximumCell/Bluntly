import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/users", protectRoute, getAllUsers);
router.get("/:userId", protectRoute, getMessages);
router.post("/send/:userId", protectRoute, sendMessage);

export default router;
