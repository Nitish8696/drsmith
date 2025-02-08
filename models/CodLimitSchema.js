const mongoose = require("mongoose");


const codLimitSchema = new mongoose.Schema(
    {
        limit: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("CodLimit", codLimitSchema)