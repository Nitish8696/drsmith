const Review = require('../models/Reviews')
const User = require("../models/User");
const express = require("express");
const router = require("express").Router();
const { verifyToken } = require("./verifyToken");

router.post('/:id', verifyToken, async(req,res)=> {
    console.log(req.body)
    req.body.createdBy = req.user.id
    req.body.product = req.params.id


    if (!req.body.createdBy || !req.body.product || !req.body.postReview) {
        return res.json({ status:400,msg: 'UserId, productId, rating, and review are required.' });
    }

    const user = await User.findById(req.body.createdBy)

    const newReview = new Review({
        review : req.body.postReview,
        product : req.body.product,
        createdBy : req.body.createdBy,
        userName : user.username
    })

    try {
        const savedReview = await newReview.save();
        res.status(200).json(savedReview)
    } catch (error) {
        res.status(500).json(error)
    }
    
})

router.get('/:id', async (req,res) => {
    const id = req.params.id
    try {
        const reviews = await Review.find({product : id});
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router