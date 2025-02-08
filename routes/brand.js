const BrandCategory = require("../models/Brand");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const router = require("express").Router();
const path = require("path");

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  let category;
  if (req.body.top) {
    category = new BrandCategory({
      name: req.body.name,
      top: req.body.top,
      image: req.body.image,
    });
  } else {
    category = new BrandCategory({
      name: req.body.name,
      image: req.body.image,
    });
  }

  try {
    const addcategory = await category.save();
    res.status(201).json(addcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params; // Get brand ID from the URL
  const { name, top, image } = req.body; // Get brand details from request body

  try {
    // Validate input (you can add more validation as per your needs)
    if (!name || !image) {
      return res.status(400).json({ error: "Name and Image are required." });
    }

    // Find the brand by ID and update
    const updatedBrand = await BrandCategory.findByIdAndUpdate(
      id,
      { name, top, image },
      { new: true } // Return the updated document
    );

    // If brand not found
    if (!updatedBrand) {
      return res.status(404).json({ error: "Brand not found." });
    }

    // Success response
    res.status(200).json({
      message: "Brand updated successfully.",
      data: updatedBrand,
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});


router.get("/", async (req, res) => {
  try {
    const categories = await BrandCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the brand by ID
      const brand = await BrandCategory.findById(id);
  
      // If brand is not found
      if (!brand) {
        return res.status(404).json({ error: "Brand not found." });
      }
  
      // Success response
      res.status(200).json(brand);
    } catch (error) {
      // Handle server errors
      console.error("Error fetching brand:", error);
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  });
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCategory = await BrandCategory.findByIdAndDelete(id);
    if (updatedCategory) {
      res.json({ status: 200, msg: "Category deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
