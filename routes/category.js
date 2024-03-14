const Category = require("../models/Categories");
const express = require("express");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const path = require("path");



router.post("/", async (req, res) => {
    console.log(req.body)
    const newProduct = new Category({
        name : req.body.category
    })
    // try {
    //     const savedProduct = await newProduct.save();
    //     res.status(200).json(savedProduct)
    // } catch (error) {
    //     res.status(500).json(error)
    // }
})

module.exports = router