const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();

// 🟢 Add a new comment
router.post("/:postId", async (req, res) => {
  try {
    console.log("Incoming comment request:", req.body);

    const { text, userId } = req.body;
    let { postId } = req.params;

    // Trim possible whitespace/newlines from postId
    postId = postId.trim();

    const newComment = new Comment({
      text,
      userId,
      postId,
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error("🔥 Error adding comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Get all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    let { postId } = req.params;
    postId = postId.trim();

    const comments = await Comment.find({ postId }).populate("userId", "name");
    res.status(200).json(comments);
  } catch (err) {
    console.error("🔥 Error fetching comments:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
