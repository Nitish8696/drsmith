const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        products: [
            {
                productId: {
                    type: String,
                },
                quantity: {
                    type:Number,
                    default : 1,
                },
                weight : {
                    type: String,
                  }
            },
        ],
        amount: { type: Number, required:true},
        address: {type : Object, required : true},
        status : {type: String, default : 'pending'},
    },
    { timestamps: true }
)

module.exports = mongoose.model("ConfirmOrder", OrderSchema)