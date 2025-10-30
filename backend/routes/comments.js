const express = require("express");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Create comment for a specific post
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const newComment = new Comment({
      postId,
      userId: req.user.id, // from JWT
      text,
    });

    await newComment.save();
    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

// ✅ Get comments for a post (with pagination)
router.get("/:postId", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ postId: req.params.postId })
        .sort({ date: -1 }) // or createdAt if your schema uses timestamps
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      Comment.countDocuments({ postId: req.params.postId }),
    ]);

    res.json({
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ✅ Update comment
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!req.user || comment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    res.json({ message: "Comment updated successfully", comment });
  } catch (err) {
    next(err);
  }
});

// ✅ Delete comment
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (!req.user || comment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
