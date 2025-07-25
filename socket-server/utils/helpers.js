// Utility functions for socket server

class Logger {
  static info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(
      `ℹ️  [${timestamp}] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  static error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ${message}`, error || "");
  }

  static warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(
      `⚠️  [${timestamp}] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  static success(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(
      `✅ [${timestamp}] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }
}

// Event validation utilities
class EventValidator {
  static validateCommentData(commentData) {
    const { postId, comment } = commentData;

    if (!postId || typeof postId !== "string") {
      throw new Error("Valid postId is required");
    }

    if (!comment || typeof comment !== "object") {
      throw new Error("Valid comment object is required");
    }

    return true;
  }

  static validateUserData(userData) {
    const { userId, username } = userData;

    if (!userId || typeof userId !== "string") {
      throw new Error("Valid userId is required");
    }

    if (!username || typeof username !== "string") {
      throw new Error("Valid username is required");
    }

    return true;
  }

  static validatePostId(postId) {
    if (!postId || typeof postId !== "string") {
      throw new Error("Valid postId is required");
    }
    return true;
  }

  static validateNotificationData(notificationData) {
    const { targetUserId, type, message } = notificationData;

    if (!targetUserId || typeof targetUserId !== "string") {
      throw new Error("Valid targetUserId is required");
    }

    if (!type || typeof type !== "string") {
      throw new Error("Valid notification type is required");
    }

    if (!message || typeof message !== "string") {
      throw new Error("Valid message is required");
    }

    return true;
  }
}

// Response utilities
class ResponseHelper {
  static success(res, data = null, message = "Success") {
    return res.status(200).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = "Error", statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static badRequest(res, message = "Bad request", errors = null) {
    return res.status(400).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}

// Room utilities
class RoomHelper {
  static getPostRoomName(postId) {
    return `post_${postId}`;
  }

  static getUserRoomName(userId) {
    return `user_${userId}`;
  }

  static parsePostIdFromRoom(roomName) {
    if (roomName.startsWith("post_")) {
      return roomName.replace("post_", "");
    }
    return null;
  }

  static parseUserIdFromRoom(roomName) {
    if (roomName.startsWith("user_")) {
      return roomName.replace("user_", "");
    }
    return null;
  }
}

// Time utilities
class TimeHelper {
  static getTimestamp() {
    return new Date().toISOString();
  }

  static formatUptime(uptimeSeconds) {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  static isRecentTimestamp(timestamp, maxAgeMinutes = 5) {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMinutes = (now - eventTime) / (1000 * 60);

    return diffMinutes <= maxAgeMinutes;
  }
}

// Environment utilities
class EnvHelper {
  static isDevelopment() {
    return process.env.NODE_ENV === "development";
  }

  static isProduction() {
    return process.env.NODE_ENV === "production";
  }

  static getPort() {
    return process.env.PORT || 3001;
  }

  static getNodeEnv() {
    return process.env.NODE_ENV || "development";
  }

  static getAllowedOrigins() {
    const defaultOrigins = [
      "http://localhost:3000",
      "http://localhost:8081",
      "exp://192.168.1.100:8081",
    ];

    if (process.env.ALLOWED_ORIGINS) {
      return process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
        origin.trim()
      );
    }

    if (process.env.FRONTEND_URL) {
      return [...defaultOrigins, process.env.FRONTEND_URL];
    }

    return defaultOrigins;
  }
}

export {
  Logger,
  EventValidator,
  ResponseHelper,
  RoomHelper,
  TimeHelper,
  EnvHelper,
};
