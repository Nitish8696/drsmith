const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");


const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: Array, required: true },
  categories: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
  ],
  salePrice: { type: String, default: null },
  regularPrice: { type: String, default: null },
  isVariable: { type: Boolean, default: false },
  variable: {
    type: [
      {
        name: { type: String },
        regularPrice: { type: Number },
        salePrice: { type: Number }
      }
    ],
    default: null
  },
  inStock: { type: Boolean, default:null }
},
  { timestamps: true }
)

module.exports = mongoose.model("Product", ProductSchema)