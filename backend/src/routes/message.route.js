import express from "express";
import { Message } from "../models/message.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getAuth } from "@clerk/express";

const router = express.Router();

// Get all conversations for current user
router.get("/conversations", protectRoute, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUserId = currentUser._id.toString();

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
          "username firstName lastName profilePicture verified"
        );
        return {
          _id: msg._id,
          user: {
            ...user.toObject(),
            name: `${user.firstName} ${user.lastName}`.trim(),
          },
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
router.get("/:userId", protectRoute, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUserId = currentUser._id.toString();
    const { userId: targetUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username firstName lastName profilePicture")
      .populate("receiverId", "username firstName lastName profilePicture");

    // Mark messages as read
    await Message.updateMany(
      { senderId: targetUserId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send message
router.post("/", protectRoute, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const { userId } = getAuth(req);

    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const senderId = currentUser._id.toString();

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
      .populate("senderId", "username firstName lastName profilePicture")
      .populate("receiverId", "username firstName lastName profilePicture");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Delete conversation
router.delete("/conversation/:userId", protectRoute, async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUserId = currentUser._id.toString();
    const { userId: targetUserId } = req.params;

    // Delete all messages between current user and specified user
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// Search users for messaging
router.get("/search/users", protectRoute, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ],
    })
      .select("username firstName lastName profilePicture verified")
      .limit(20);

    // Format users for response
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatar: user.profilePicture,
      verified: user.verified || false,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
