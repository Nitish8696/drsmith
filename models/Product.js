const mongoose = require("mongoose");

const VariationSchema = new mongoose.Schema(
  {
    attributeCombination: {
      type: Map, // Dynamic key-value pairs for attributes
      of: String, // Values for the attributes (e.g., "red", "small", etc.)
    },
    price: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    image : { type: String, required: true}
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    features : { type: String , default: null},
    keySpecifications : { type: String , default: null},
    packaging: { type: String, default: null },
    directionToUse: { type: String, default: null},
    AdditionalInfo : { type: String, default: null},
    shippingRate: { type: String, default: null},
    shippingEndividualRate: { type: String, default: null},
    desc: { type: String, required: true },
    img: {type : [String],required: true},
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    salePrice: { type: String, default: null },
    regularPrice: { type: String, default: null },
    brand : {type : mongoose.Schema.Types.ObjectId, ref: 'BrandCategory', default:null},
    isVariable: { type: Boolean, default: false },
    attributes: {
      type: [
        {
          name: { type: String, required: true }, // Attribute name like color, size, etc.
          values: [{ type: String, required: true }], // Possible values like red, green, etc.
        },
      ],
      default: null, // Set attributes to null by default
    },
    variations: {
      type: [VariationSchema], // Array of variations
      default: null, // Set variations to null by default
    },
    inStock: { type: Number },
    video: { type: String, default: null },
    introVideo: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
