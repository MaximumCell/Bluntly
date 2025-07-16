import express from "express"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";


import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";
import messageRoutes from "./routes/message.route.js";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());
app.use(arcjetMiddleware);



app.get("/", (req, res) => {
  res.send("Hello, World!")
});
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});


const startServer = async () => {
  try {
    await connectDB();

    // listen for local development
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
    }
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;