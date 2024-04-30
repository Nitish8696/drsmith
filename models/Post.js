const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    img: { type: Array, required: true },
    category: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'PostCategory' }
      ],
  },
  { timestamps: true }
);


module.exports = mongoose.model("Post", postSchema)
