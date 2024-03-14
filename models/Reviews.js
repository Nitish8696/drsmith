const mongoose = require("mongoose");


const ReviewSchema = new mongoose.Schema({
    review: { type: String },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    createdBy : {
        type :mongoose.Types.ObjectId,
        ref : "User",
        required : [true,'please provide user id']
    },
    userName : {
        type :String,
    }
},
{ timestamps: true }
)

module.exports = mongoose.model('Review', ReviewSchema)