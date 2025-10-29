const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

// Create post
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    const newPost = new Post({
      title,
      content,
      image,
      tags,
      author: req.user.id,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "name");
  res.json(posts);
});

// Get single post
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name");
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

// Update post
router.put("/:id", auth, async (req, res) => {
  const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
