// backend/models/Comment.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// optional: populate user details easily
commentSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Comment", commentSchema);
