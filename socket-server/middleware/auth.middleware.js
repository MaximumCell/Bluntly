import jwt from "jsonwebtoken";

export const protectRoute = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // For development, you might want to skip JWT verification
    // and just extract userId from the token payload without verification
    if (process.env.NODE_ENV === "development") {
      // Simple token parsing without verification (for development only)
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId) {
        req.auth = { userId: decoded.userId };
        return next();
      }
    }

    // For production, use proper JWT verification
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.auth = decoded;

    // Temporary fallback for development
    req.auth = { userId: "temp_user_id" };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
