import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getComments,
  likeComment,
  dislikeComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/post/:postId", getComments);

router.post("/post/:postId", protectRoute, createComment);
router.post("/:commentId/like", protectRoute, likeComment);
router.post("/:commentId/dislike", protectRoute, dislikeComment);
router.delete("/:commentId", protectRoute, deleteComment);

export default router;
