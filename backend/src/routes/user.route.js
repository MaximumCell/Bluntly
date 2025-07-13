import express from "express";
import { followUser, getCurrentUser, getUserProfile, syncUser, updateUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.put("/profile", protectRoute, updateUserProfile);
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.post("/follow/:targetUserId", protectRoute, followUser)

export default router;