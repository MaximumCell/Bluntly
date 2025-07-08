import express from "express"
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";


import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(clerkMiddleware());


connectDB();

app.get("/", (req, res) => {
  res.send("Hello, World!")
});
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});


app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`)
})