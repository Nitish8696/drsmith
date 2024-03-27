const router = require("express").Router();
const Variation = require("../models/Variation");
const express = require("express");

router.post('/', async (req, res) => {
    const variation = new Variation({
        variations : req.body.variations
    })
    try {
        const productVariations = await variation.save()
        res.status(200).json(productVariations);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
        const variation = await Variation.findById(id);

        variation.variations.push({ name, price });

        await variation.save();
        res.status(200).json(variation);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.delete('/single/:id/:ids', async (req, res) => {
    const { id,ids } = req.params;
    console.log(id,ids)
    try {
        const variation = await Variation.findById(id);

        variation.variations = variation.variations.filter(variation => variation._id != ids)

        await variation.save();
        res.status(200).json(variation);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router