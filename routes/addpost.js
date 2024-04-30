const Post = require("../models/Post");
const express = require("express");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js")
const path = require("path");
const router = require("express").Router();

const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public'); // Destination directory for uploaded files
    },
    filename: function (req, file, cb) {
        return cb(null, Date.now() + path.extname(file.originalname)); // File naming
    }
});

const upload = multer({ storage: storage });

router.post("/", verifyTokenAndAdmin, upload.array('images'), async (req, res) => {

    const categoryArray = JSON.parse(req.body.category);

    let productimages = []

    const productImagesLocalpath = () => {
        req.files?.forEach(file => {
            productimages.push(file.filename)
        })
    }

    await productImagesLocalpath()


    let newPost;

    newPost = new Post({
        title: req.body.title,
        img: productimages,
        categories: categoryArray,
        content: req.body.post
    })
    try {
        const savedPost = await newPost.save();

        res.status(200).json(savedPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Post.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
        if (updatedUser) {
            res.status(200).json(updatedProduct)
        }
    } catch (error) {
        res.status(500).json(err)
    }
})

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json("Product has been deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Post.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;

    try {
        let products;
        if (qNew) {
            products = await Post.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
            products = await Post.find({
                categories: {
                    $in: [qCategory]
                }
            })
        } else {
            products = await Post.find()
        }

        res.status(200).json(products)
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router