const Product = require("../models/Product");
const express = require("express");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js");
const path = require("path");
const router = require("express").Router();

const multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + path.extname(file.originalname)); // File naming
  },
});

const upload = multer({ storage: storage });

router.post("/", verifyTokenAndAdmin, upload.none(), async (req, res) => {
  const formData = req.body;

  // Convert to a standard JavaScript object if needed
  const standardObject = { ...formData };
  const categoryArray = JSON.parse(standardObject.category);
  const attributes = JSON.parse(standardObject.attributes);
  const variations = JSON.parse(standardObject.variations);
  const images = JSON.parse(standardObject.images);

  const isVariable = JSON.parse(standardObject.isVariable);

  const stock = Number(standardObject.stock);

  const salePrice = Number(standardObject.salePrice);
  const regularPrice = Number(standardObject.regularPrice);

  let newProduct;

  if (isVariable) {
    newProduct = new Product({
      title: standardObject.title,
      desc: standardObject.description,
      features: standardObject.features || null,
      shippingRate : standardObject.shippingRate || null,
      shippingEndividualRate: standardObject.shippingEndividualRate || null,
      keySpecifications: standardObject.keySpecifications || null,
      packaging: standardObject.packaging || null,
      directionToUse: standardObject.directionToUse || null,
      AdditionalInfo: standardObject.additionalInfo || null,
      img: images,
      categories: categoryArray,
      inStock: stock,
      isVariable: isVariable,
      brand: standardObject.brand,
      attributes: attributes,
      variations: variations,
      video: standardObject.video,
      introVideo: standardObject.introVideo,
      salePrice: salePrice,
      regularPrice: regularPrice,
    });
  } else {
    newProduct = new Product({
      title: standardObject.title,
      desc: standardObject.description,
      img: images,
      features: standardObject.features || null,
      shippingRate : standardObject.shippingRate || null,
      shippingEndividualRate: standardObject.shippingEndividualRate || null,
      keySpecifications: standardObject.keySpecifications || null,
      packaging: standardObject.packaging || null,
      directionToUse: standardObject.directionToUse || null,
      AdditionalInfo: standardObject.additionalInfo || null,
      categories: categoryArray,
      inStock: stock,
      isVariable: isVariable,
      brand: standardObject.brand,
      video: standardObject.video,
      introVideo: standardObject.introVideo,
      salePrice: salePrice,
      regularPrice: regularPrice,
    });
  }
  try {
    const savedProduct = await newProduct.save();

    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:id", verifyTokenAndAdmin, upload.none(), async (req, res) => {
  const formData = req.body;

  // Convert form data to a standard object if needed
  const standardObject = { ...formData };

  const categoryArray = JSON.parse(standardObject.category || "[]");
  const attributes = JSON.parse(standardObject.attributes || "[]");
  const variations = JSON.parse(standardObject.variations || "[]");
  const images = JSON.parse(standardObject.images || "[]");

  const isVariable = JSON.parse(standardObject.isVariable || "false");
  const stock = Number(standardObject.stock || 0);
  const salePrice = Number(standardObject.salePrice || 0);
  const regularPrice = Number(standardObject.regularPrice || 0);

  let updatedProduct = {
    title: standardObject.title,
    desc: standardObject.description,
    features: standardObject.features || null,
    shippingRate: standardObject.shippingRate || null,
    shippingEndividualRate: standardObject.shippingEndividualRate || null,
    keySpecifications: standardObject.keySpecifications || null,
    packaging: standardObject.packaging || null,
    shippingRate : standardObject.shippingRate || null,
    directionToUse: standardObject.directionToUse || null,
    AdditionalInfo: standardObject.additionalInfo || null,
    img: images,
    categories: categoryArray,
    inStock: stock,
    isVariable: isVariable,
    brand: standardObject.brand,
    video: standardObject.video,
    introVideo: standardObject.introVideo,
    salePrice: salePrice,
    regularPrice: regularPrice,
  };

  // If the product is variable, update attributes and variations
  if (isVariable) {
    updatedProduct.attributes = attributes;
    updatedProduct.variations = variations;
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: updatedProduct,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qBrand = req.query.brand;

  try {
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else if (qBrand) {
      products = await Product.find({
        brand: {
          $in: [qBrand],
        },
      });
    } else {
      products = await Product.find();
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // const result = products.skip(skip).limit(limit)
    const result = products.slice(skip, skip + limit);

    products = await result;
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
