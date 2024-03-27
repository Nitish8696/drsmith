const router = require("express").Router();
const Product = require("../models/Product");
const express = require("express");

router.get('/', async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    const query = req.query.q
    
    try {
        const products = await Product.find({ title: { $regex: query, $options: 'i' } });
        const result = await products.slice(skip, skip + limit)
        res.status(200).json(result);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.get('/suggestions', async (req, res) => {
    const query = req.query.q
    try {
        if (!query) {
            return res.status(200).json([])
        }
        const products = await Product.find({ title: { $regex: query, $options: 'i' } });
        const transformedProducts = products.map(product => ({
            img: product.img,
            title: product.title,
            id: product._id
        }))
        res.status(200).json(transformedProducts);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router