import express from "express";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all conversations for current user
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all messages where current user is sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", currentUserId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Populate user information
    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg._id).select(
          "username name avatar verified"
        );
        return {
          _id: msg._id,
          user,
          lastMessage: msg.lastMessage,
          unreadCount: msg.unreadCount,
          updatedAt: msg.lastMessage.createdAt,
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Get messages between current user and specific user
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username name avatar")
      .populate("receiverId", "username name avatar");

    // Mark messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send message (also handled by socket)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ error: "Receiver ID and content are required" });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim(),
      read: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "username name avatar")
      .populate("receiverId", "username name avatar");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Delete conversation
router.delete("/conversation/:userId", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    // Delete all messages between current user and specified user
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
