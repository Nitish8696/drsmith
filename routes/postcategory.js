const PostCategory = require("../models/PostCategories")
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const path = require("path");



router.post("/", async (req, res) => {
    const category = new PostCategory({
        name: req.body.name,
    })

    try {
        const addcategory = await category.save()
        res.status(201).json(addcategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.get("/", async (req, res) => {

    try {
        const categories = await PostCategory.find()
        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCategory = await PostCategory.findByIdAndDelete(id);
        if (updatedCategory) {
            res.json({ status: 200, msg: "Category deleted successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router