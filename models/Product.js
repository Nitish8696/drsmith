const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");


const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: Array, required: true },
  categories: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  priceOptions: {
    type: [
      {
        weight: String,
        price: Number
      }
    ]
  },
  inStock: { type: Number }
},
  { timestamps: true }
)

module.exports = mongoose.model("Product", ProductSchema)