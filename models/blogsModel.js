const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId },
    comment: { type: String },
  },
  {
    _id: false, // Disable the generation of _id for subdocuments
  }
);

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    cover: { type: String, required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, required: true },
    category: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [commentSchema], // Embed comment schema as an array
  },
  {
    versionKey: false, // Disable the "__v" field
  }
);

module.exports = mongoose.model("Blog", blogSchema);
