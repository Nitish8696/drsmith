const router = require("express").Router();
const Attribute = require("../models/AttributesSchema");

router.post('/', async (req, res) => {

    const attribute = new Attribute({
        name : req.body.name
    })
    
    try {
        const productAttribute = await attribute.save()
        res.status(200).json(productAttribute);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router