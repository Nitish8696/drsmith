// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  mobile: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpiration: { type: Date },
  isVerified: { type: Boolean, default: false },
  isAdmin : { type: Boolean, default: false},
});

module.exports = mongoose.model('User', userSchema);
