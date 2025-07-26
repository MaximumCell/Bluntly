import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.routes.js";
import { initializeSocket } from "./utils/socket.js";
import { Logger } from "./utils/helpers.js";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19006", // Expo web
    "exp://192.168.1.100:8081", // Expo development
    "exp://localhost:8081", // Expo localhost
    "*", // Allow all origins for now
    process.env.FRONTEND_URL || "*",
  ],
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io using the utility
const io = initializeSocket(server);

// Database connection
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(MONGO_URI);
    Logger.success("MongoDB connected successfully");
  } catch (error) {
    Logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bluntly Socket Server",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Socket.io is now handled by the utility file - no manual event handling needed here

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  Logger.info(`🚀 Socket server running on port ${PORT}`);
  Logger.info(`📱 Health check: http://localhost:${PORT}/health`);
  Logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  Logger.info("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close();
    Logger.info("✅ Server closed");
    process.exit(0);
  });
});

export { app, server };
