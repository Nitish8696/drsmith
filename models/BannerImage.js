const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  link : { type: String, required: true}
});

module.exports = mongoose.model('BannerImage', bannerSchema);