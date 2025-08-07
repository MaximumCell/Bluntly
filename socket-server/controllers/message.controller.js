import { Message } from "../models/message.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";


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

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user IDs provided",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate("senderId", "username firstName lastName profilePicture")
      .populate("receiverId", "username firstName lastName profilePicture")
      .sort({ createdAt: 1 });

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

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user IDs provided",
      });
    }

    // Verify users exist
    const [senderExists, receiverExists] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!senderExists || !receiverExists) {
      return res.status(404).json({
        success: false,
        message: "One or both users not found",
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content: content.trim(),
    });

    await newMessage.save();

    // Populate the message with user details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username firstName lastName profilePicture")
      .populate("receiverId", "username firstName lastName profilePicture");

    res.status(201).json({
      success: true,
      message: populatedMessage,
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
    const currentUserId = req.query.currentUserId;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: "currentUserId is required as query parameter",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid current user ID provided",
      });
    }

    // Get all unique users who have exchanged messages with current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    });

    // Extract unique user IDs (excluding current user)
    const userIds = new Set();
    messages.forEach((message) => {
      if (message.senderId.toString() !== currentUserId) {
        userIds.add(message.senderId.toString());
      }
      if (message.receiverId.toString() !== currentUserId) {
        userIds.add(message.receiverId.toString());
      }
    });

    // Fetch user details
    const users = await User.find(
      { _id: { $in: Array.from(userIds) } },
      { password: 0, clerkId: 0 }
    ).select("_id username firstName lastName profilePicture");

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
