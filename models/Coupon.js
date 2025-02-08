const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponTitle: {
    type: String,
    required: true,
    trim: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Restrict the percentage between 0 and 100
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 1, // Minimum quantity required to use the coupon
  },
  expirationDate: {
    type: Date,
    required: true, // Only the date (e.g., 2024-12-31)
  },
  expirationTime: {
    type: String,
    required: true, // Time as a string in HH:mm format (e.g., "23:59")
    validate: {
      validator: function (v) {
        return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(v); // Regex to validate HH:mm format
      },
      message: (props) => `${props.value} is not a valid time! Use HH:mm format.`,
    },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Coupon', couponSchema);
