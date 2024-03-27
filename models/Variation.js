const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
    variations: [
        {
            name: { type: String, required: true },
            price: { type: Number, default: null }
        }
    ]
});

module.exports = mongoose.model('Variation', variationSchema);