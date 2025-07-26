import { Message } from "../models/message.model.js";
import mongoose from "mongoose";

export const getMessages = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message:
          "Both senderId and receiverId are required as query parameters",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving messages",
    });
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "senderId, receiverId, and content are required",
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
    });
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;

    // Get all unique users who have exchanged messages with current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    }).distinct("senderId receiverId");

    // Get unique user IDs (excluding current user)
    const userIds = [...new Set(messages.flat())].filter(
      (id) => id !== currentUserId
    );

    // For now, return user IDs. In a real app, you'd fetch user details from User collection
    const users = userIds.map((id) => ({
      _id: id,
      username: `User_${id}`, // Placeholder
      // You can fetch actual user details from your User collection here
    }));

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
    });
  }
};
