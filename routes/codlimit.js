const express = require("express");
const mongoose = require("mongoose");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin,verifyToken } = require("./verifyToken");
const CodLimit = require("../models/CodLimitSchema"); // Update the path as necessary
const router = express.Router();

// Create a new COD limit
router.post("/cod-limit", verifyTokenAndAdmin,async (req, res) => {
  const { limit } = req.body;
  if (!limit) {
    return res.status(400).json({ error: "Limit is required." });
  }
  try {
    const codLimit = new CodLimit({ limit });
    await codLimit.save();
    res.status(201).json({ message: "COD Limit created successfully.", codLimit });
  } catch (error) {
    console.error("Error creating COD limit:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Fetch the current COD limit
router.get("/cod-limit", async (req, res) => {
  try {
    const codLimit = await CodLimit.findOne().sort({ createdAt: -1 }); // Get the latest COD limit
    if (!codLimit) {
      return res.status(404).json({ error: "COD Limit not found." });
    }
    res.status(200).json(codLimit);
  } catch (error) {
    console.error("Error fetching COD limit:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Update the COD limit
router.put("/cod-limit/:id", verifyTokenAndAdmin,async (req, res) => {
  const { id } = req.params;
  const { limit } = req.body;
  if (!limit) {
    return res.status(400).json({ error: "Limit is required." });
  }
  try {
    const codLimit = await CodLimit.findByIdAndUpdate(
      id,
      { limit },
      { new: true, runValidators: true }
    );
    if (!codLimit) {
      return res.status(404).json({ error: "COD Limit not found." });
    }
    res.status(200).json({ message: "COD Limit updated successfully.", codLimit });
  } catch (error) {
    console.error("Error updating COD limit:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Delete the COD limit
router.delete("/cod-limit/:id", verifyTokenAndAdmin,async (req, res) => {
  const { id } = req.params;
  try {
    const codLimit = await CodLimit.findByIdAndDelete(id);
    if (!codLimit) {
      return res.status(404).json({ error: "COD Limit not found." });
    }
    res.status(200).json({ message: "COD Limit deleted successfully." });
  } catch (error) {
    console.error("Error deleting COD limit:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
