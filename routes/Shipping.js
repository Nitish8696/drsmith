const Shipping = require("../models/Shipping");
const express = require("express");
const router = express.Router();

// Create or Update Shipping Document
router.post("/shipping", async (req, res) => {
  try {
    const { shippingRate, limit } = req.body;

    // Check if a document already exists
    const existingShipping = await Shipping.findOne();

    if (existingShipping) {
      // Update the existing document
      existingShipping.shippingRate = shippingRate;
      existingShipping.limit = limit;

      const updatedShipping = await existingShipping.save();
      return res.status(200).json({
        success: true,
        message: "Shipping details updated successfully",
        data: updatedShipping,
      });
    } else {
      // Create a new document
      const newShipping = new Shipping({
        shippingRate,
        limit,
      });

      const savedShipping = await newShipping.save();
      return res.status(201).json({
        success: true,
        message: "Shipping details created successfully",
        data: savedShipping,
      });
    }
  } catch (error) {
    console.error("Error in createOrUpdateShipping:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: error.message,
    });
  }
});

router.get("/shipping", async (req, res) => {
  try {
    const shippingDetails = await Shipping.findOne();

    if (!shippingDetails) {
      return res.status(404).json({
        success: false,
        message: "Shipping details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shipping details fetched successfully",
      data: shippingDetails,
    });
  } catch (error) {
    console.error("Error in getShippingDetails:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching shipping details",
      error: error.message,
    });
  }
});

module.exports = router;
