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

        res.status(200).json({ comments });
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
        user: user._id
    });

    // link comment to post
    await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id }
    });

    // create notification if the comment is not by the post author
    if (post.user.toString() !== user._id.toString()) {
        await Notification.create({
            from: user._id,
            to: post.user,
            type: "comment",
            message: `${user.firstName} ${user.lastName} commented on your post`,
            post: postId,
            comment: comment._id
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
        return res.status(403).json({ message: "You can only delete your own comments" });
    }

    // remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
    });
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
});