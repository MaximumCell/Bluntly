import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  // Add net score calculation
  const postsWithScore = posts.map((post) => ({
    ...post.toObject(),
    netScore: post.likes.length - post.dislikes.length,
  }));

  res.status(200).json({ posts: postsWithScore });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Add net score calculation
  const postWithScore = {
    ...post.toObject(),
    netScore: post.likes.length - post.dislikes.length,
  };

  res.status(200).json({ post: postWithScore });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  // Add net score calculation
  const postsWithScore = posts.map((post) => ({
    ...post.toObject(),
    netScore: post.likes.length - post.dislikes.length,
  }));

  res.status(200).json({ posts: postsWithScore });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    res.status(400);
    throw new Error("Content or image is required");
  }
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let imageUrl = "";
  if (imageFile) {
    try {
      const base64Image = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "bluntly/posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return res.status(400).json({ message: "Image upload failed" });
    }
  }
  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });
  if (!post) {
    res.status(500);
    throw new Error("Failed to create post");
  }
  res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = getAuth(req);

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isLiked = post.likes.includes(user._id);
  const isDisliked = post.dislikes.includes(user._id);

  if (isLiked) {
    // Unlike the post
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
  } else {
    // Like the post and remove dislike if exists
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: user._id },
      $pull: { dislikes: user._id },
    });
  }

  // create a notification for the post author
  if (post.user.toString() !== user._id.toString() && !isLiked) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "like",
      post: post._id,
    });
  }

  res.status(200).json({ message: isLiked ? "Post unliked" : "Post liked" });
});

export const dislikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = getAuth(req);

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isDisliked = post.dislikes.includes(user._id);
  const isLiked = post.likes.includes(user._id);

  if (isDisliked) {
    // Remove dislike
    await Post.findByIdAndUpdate(postId, {
      $pull: { dislikes: user._id },
    });
  } else {
    // Dislike the post and remove like if exists
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { dislikes: user._id },
      $pull: { likes: user._id },
    });
  }

  res
    .status(200)
    .json({ message: isDisliked ? "Post undisliked" : "Post disliked" });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = getAuth(req);

  const post = await Post.findById(postId);
  const user = await User.findOne({ clerkId: userId });
  if (!user || !post) {
    res.status(404);
    throw new Error("Post or user not found");
  }

  if (post.user.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to delete this post");
  }
  // Delete all comments associated with the post
  await Comment.deleteMany({ post: postId });
  // Delete the post
  await Post.findByIdAndDelete(postId);

  res.status(200).json({ message: "Post deleted successfully" });
});
