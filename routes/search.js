const router = require("express").Router();
const Product = require("../models/Product");
const express = require("express");

router.get('/', async (req, res) => {
    console.log('jaat')
    const query = req.query.q
    try {
        const products = await Product.find({ title: { $regex: query, $options: 'i' } });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.get('/suggestions', async (req, res) => {
    const query = req.query.q
    try {
        if(!query){
            return res.status(200).json([])
        }
        const products = await Product.find({ title: { $regex: query, $options: 'i' } });
        const transformedProducts = products.map(product => ({
            img: product.img,
            title: product.title,
            id : product._id
        }))
        res.status(200).json(transformedProducts);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router