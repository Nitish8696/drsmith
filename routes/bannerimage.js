const express = require('express');
const BannerImage = require('../models/BannerImage')
const router = express.Router();
const {
    verifyToken,
    verifyTokenAndAdmin,
  } = require("./verifyToken");

// Route to create a new banner image (POST)
router.post('/',verifyTokenAndAdmin, async (req, res) => {
    const { image, link } = req.body;
  
    // Validate input
    if (!image || !link) {
      return res.status(400).json({ message: 'Image and link are required' });
    }
  
    try {
      const newBanner = new BannerImage({ image, link });
      await newBanner.save();
      res.status(201).json({ message: 'Banner image created successfully', banner: newBanner });
    } catch (error) {
      res.status(500).json({ message: 'Error creating banner image', error });
    }
  });

// Route to update an existing banner image (PUT)
router.put('/:id',verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;
    const { image, link } = req.body;
  
    try {
      const updatedBanner = await BannerImage.findByIdAndUpdate(
        id,
        { image, link },
        { new: true, runValidators: true }
      );
  
      if (!updatedBanner) {
        return res.status(404).json({ message: 'Banner image not found' });
      }
  
      res.status(200).json({ message: 'Banner image updated successfully', banner: updatedBanner });
    } catch (error) {
      res.status(500).json({ message: 'Error updating banner image', error });
    }
  });
router.delete('/:id',verifyTokenAndAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(id);
  
    try {
      const updatedBanner = await BannerImage.findByIdAndDelete(id)
  
      if (!updatedBanner) {
        return res.status(404).json({ message: 'Banner image not found' });
      }
  
      res.status(200).json({ message: 'Banner image updated successfully', banner: updatedBanner });
    } catch (error) {
      res.status(500).json({ message: 'Error updating banner image', error });
    }
  });
router.get('/', async (req, res) => {
  
    try {
      const updatedBanner = await BannerImage.find();
  
      if (!updatedBanner) {
        return res.status(404).json(updatedBanner);
      }
  
      res.status(200).json({ message: 'Banner image updated successfully', banner: updatedBanner });
    } catch (error) {
      res.status(500).json({ message: 'Error updating banner image', error });
    }
  });

module.exports = router;
