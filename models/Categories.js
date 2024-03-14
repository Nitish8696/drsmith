const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");


const CategoriesSchema = new mongoose.Schema(
    {
        name : {type : String, required: true , unique: true},
        parentCategory : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default : null
        },
        children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default : null
          }]

    },
    { timestamps: true }
)

module.exports = mongoose.model("Category", CategoriesSchema)