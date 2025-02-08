const mongoose = require("mongoose");


const shippingSchema = new mongoose.Schema({
    shippingRate : {
        type: Number,
        required: true
    },
    limit : {
        type: Number,
        required: true
    }
},
{ timestamps: true }
)

module.exports = mongoose.model('shipping', shippingSchema)