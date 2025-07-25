import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { Logger } from "./helpers.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://192.168.1.100:8081", // Expo development
        process.env.FRONTEND_URL || "*",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const userSockets = new Map(); // { userId: socketId}
  const userActivities = new Map(); // {userId: activity}

  io.on("connection", (socket) => {
    Logger.info(`🔌 New connection: ${socket.id}`);

    socket.on("user_connected", (userId) => {
      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      // broadcast to all connected sockets that this user just logged in
      io.emit("user_connected", userId);

      socket.emit("users_online", Array.from(userSockets.keys()));

      io.emit("activities", Array.from(userActivities.entries()));

      Logger.success(`User connected: ${userId}`);
    });

    socket.on("update_activity", ({ userId, activity }) => {
      Logger.info(`Activity updated: ${userId} - ${activity}`);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;

        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        // send to receiver in realtime, if they're online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
        Logger.success(`💬 Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        Logger.error("Message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSockets.entries()) {
        // find disconnected user
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
        Logger.info(`🔌 User disconnected: ${disconnectedUserId}`);
      }
    });
  });

  return io;
};
