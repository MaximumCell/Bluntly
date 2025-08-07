import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId })
    .populate("user", "username firstName lastName profilePicture")
    .sort({ createdAt: -1 });

  // Add net score calculation for each comment
  const commentsWithScore = comments.map((comment) => ({
    ...comment.toObject(),
    netScore: comment.likes.length - comment.dislikes.length,
  }));

  res.status(200).json({ comments: commentsWithScore });
});

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;
  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Comment content cannot be empty" });
  }
  const post = await Post.findById(postId);
  const user = await User.findOne({ clerkId: userId });
  if (!post || !user) {
    return res.status(404).json({ message: "Post or user not found" });
  }
  const comment = await Comment.create({
    content,
    post: postId,
    user: user._id,
  });

  // link comment to post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // create notification if the comment is not by the post author
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      message: `${user.firstName} ${user.lastName} commented on your post`,
      post: postId,
      comment: comment._id,
    });
  }
  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  const user = await User.findOne({ clerkId: userId });
  if (!comment || !user) {
    return res.status(404).json({ message: "Comment or user not found" });
  }
  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only delete your own comments" });
  }

  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });
  await Comment.findByIdAndDelete(commentId);
  res.status(200).json({ message: "Comment deleted successfully" });
});

export const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = getAuth(req);

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isLiked = comment.likes.includes(user._id);
  const isDisliked = comment.dislikes.includes(user._id);

  if (isLiked) {
    // Unlike the comment
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: user._id },
    });
  } else {
    // Like the comment and remove dislike if exists
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: user._id },
      $pull: { dislikes: user._id },
    });
  }

  res
    .status(200)
    .json({ message: isLiked ? "Comment unliked" : "Comment liked" });
});

export const dislikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = getAuth(req);

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const isDisliked = comment.dislikes.includes(user._id);
  const isLiked = comment.likes.includes(user._id);

  if (isDisliked) {
    // Remove dislike
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { dislikes: user._id },
    });
  } else {
    // Dislike the comment and remove like if exists
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { dislikes: user._id },
      $pull: { likes: user._id },
    });
  }

  res
    .status(200)
    .json({ message: isDisliked ? "Comment undisliked" : "Comment disliked" });
});
