import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const notifications = await Notification.find({ to: userId })
        .populate("from", "username firstName lastName profilePicture")
        .populate("post", "content image")
        .populate("comment", "content")
        .sort({ createdAt: -1 });
    res.json(200).json({ notifications });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        to: userId
    });

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.json({ message: "Notification deleted successfully" });
});