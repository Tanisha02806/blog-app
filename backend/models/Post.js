// backend/models/Post.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: { type: [String], default: [] },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // for like/unlike
    image: { type: String },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// generate unique slug before save
postSchema.pre("validate", async function (next) {
  if (!this.title) return next();
  let candidate = slugify(this.title, { lower: true, strict: true }).slice(0, 200);
  // if same slug exists, append short id
  const Post = mongoose.model("Post");
  let slug = candidate;
  let i = 0;
  while (await Post.findOne({ slug })) {
    i += 1;
    slug = `${candidate}-${Math.random().toString(36).substr(2, 4)}${i}`;
  }
  this.slug = slug;
  next();
});

// virtual likes count
postSchema.virtual("likesCount").get(function () {
  return (this.likedBy && this.likedBy.length) || 0;
});

postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);
