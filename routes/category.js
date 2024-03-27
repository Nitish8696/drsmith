const Category = require("../models/Categories")
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();



router.post("/", async (req, res) => {
  console.log(req.body)
  try {
    const addcategory = await Category.create(req.body)
    res.status(201).json(addcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})


router.get("/", async (req, res) => {
  
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCategory = await Category.deleteMany({ $or: [{ _id: id }, { parentCategory: id }] });
    if (updatedCategory) {
      res.json({ status: 200, msg: "Category deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router