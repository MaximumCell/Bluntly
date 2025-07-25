import express from "express";
import {
  getAllUsers,
  getUserByUsername,
} from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users - Get all users
router.get("/", getAllUsers);

// GET /api/users/:username - Get user by username
router.get("/:username", getUserByUsername);

export default router;
