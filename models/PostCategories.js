const mongoose = require('mongoose');

const postCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('PostCategory', postCategorySchema);