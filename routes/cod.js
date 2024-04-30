const router = require("express").Router();


const express = require('express')
const Order = require("../models/Order");


router.use(express.urlencoded({ extended: true }))

router.get("/payment/:id", async (req, res) => {
    try {
       const cod = await Order.findOneAndUpdate({ _id:req.params.id}, { $set: { status: 'COD' } }, { new: true });
       res.json({cod : cod, status : 200})
    } catch (error) {
        res.json({error : error.message , status : 500})
    }
})

module.exports = router;