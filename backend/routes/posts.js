// backend/routes/posts.js
const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// ✅ Serve uploaded images statically
router.use("/uploads", express.static("uploads"));

// ✅ Create post (with optional image)
router.post("/create", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: "Title & content required" });

    const newPost = new Post({
      title,
      content,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((t) => t.trim())
        : [],
      author: req.user._id,
      image: req.file ? req.file.path : null,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (err) {
    next(err);
  }
});

// ✅ Get posts with pagination, search & tag filter
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : null;
    const tag = req.query.tag ? req.query.tag.trim() : null;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email"),
      Post.countDocuments(filter),
    ]);

    res.json({
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ✅ Get single post by ID or slug
router.get("/:identifier", async (req, res, next) => {
  try {
    const id = req.params.identifier;
    let post = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      post = await Post.findById(id).populate("author", "name email");
    }
    if (!post) {
      post = await Post.findOne({ slug: id }).populate("author", "name email");
    }
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// ✅ Update post
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    if (req.body.tags) {
      post.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(",").map((t) => t.trim());
    }

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// ✅ Delete post
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ✅ Like a post
router.post("/:id/like", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = req.user._id;
    if (!post.likedBy.some((id) => id.toString() === uid.toString())) {
      post.likedBy.push(uid);
      await post.save();
    }

    res.json({ likesCount: post.likedBy.length });
  } catch (err) {
    next(err);
  }
});

// ✅ Unlike a post
router.post("/:id/unlike", authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = req.user._id.toString();
    post.likedBy = post.likedBy.filter((id) => id.toString() !== uid);
    await post.save();

    res.json({ likesCount: post.likedBy.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
