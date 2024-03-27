const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  configTerms: { type: mongoose.Schema.Types.ObjectId, ref: 'Variation', default : null},
});

module.exports = mongoose.model('Attribute', attributeSchema);