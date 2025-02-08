const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Importing Axios

// otp send

router.post("/sendOtp", async (req, res) => {
  const { mobile } = req.body;
  try {
    let user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpiration = new Date(Date.now() + 5 * 60000);
      user.otp = hashedOtp;
      user.otpExpiration = otpExpiration;
      const userget = await user.save();

      // //   Send OTP via Fast2SMS using Axios
      const options = {
        method: "POST",
        url: "https://www.fast2sms.com/dev/bulkV2",
        headers: {
          authorization:
            "V0KjJenIuXkZr4v1RU5lExfmChsBciL8DQzFMP62YTpS7dAqo3eiRKZgC32dATtwPmnc4BNzu0IXoQ6k", // Your Fast2SMS API key
        },
        data: {
          variables_values: otp, // OTP value
          route: "otp", // OTP route for sending
          numbers: mobile, // User's mobile number
        },
      };

      try {
        const response = await axios(options); // Send request using Axios
        console.log(response.data); // Log the response from Fast2SMS
        return res.status(200).json({ message: "OTP sent successfully" }); // Ensure to return after response
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error sending OTP", error });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error registering user", error });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { name, mobile } = req.body;

  if (!name && !mobile) {
    return res.status(404).json({ message: "name and mobile are required" });
  }

  try {
    let user = await User.findOne({ mobile });
    if (user && user.isVerified) {
      return res
        .status(400)
        .json({ message: "User already exists with this mobile" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiration = new Date(Date.now() + 5 * 60000); // OTP expires in 5 mins

    if (!user) {
      user = new User({ name, mobile, otp: hashedOtp, otpExpiration });
    } else {
      user.otp = hashedOtp;
      user.otpExpiration = otpExpiration;
    }

    const userget = await user.save();

    // //   Send OTP via Fast2SMS using Axios
    const options = {
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      headers: {
        authorization:
          "V0KjJenIuXkZr4v1RU5lExfmChsBciL8DQzFMP62YTpS7dAqo3eiRKZgC32dATtwPmnc4BNzu0IXoQ6k", // Your Fast2SMS API key
      },
      data: {
        variables_values: otp, // OTP value
        route: "otp", // OTP route for sending
        numbers: mobile, // User's mobile number
      },
    };

    try {
      const response = await axios(options); // Send request using Axios
      console.log(response.data); // Log the response from Fast2SMS
      return res.status(200).json({ message: "OTP sent successfully" }); // Ensure to return after response
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending OTP", error });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error during registration", error });
  }
});

// Verify OTP

router.post("/verify-otp", async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.otpExpiration < Date.now()) {
      return res.status(400).json({ status: 400, message: "OTP expired" });
    }
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch)
      return res.status(400).json({ status: 400, message: "Invalid OTP" });

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    console.log(process.env.JWT_SECRET);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, isAdmin: user.isAdmin,username : user.name },
      process.env.JWT_SEC,
    );

    res
      .status(200)
      .json({ message: "OTP verified", token, _id : user._id, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
});

// login

router.post("/login", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(404).json({ message: "Mobile number is required" });
  }

  try {
    const user = await User.findOne({ mobile });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "User not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiration = new Date(Date.now() + 5 * 60000); // OTP expires in 5 mins

    user.otp = hashedOtp;
    user.otpExpiration = otpExpiration;
    const saveL = await user.save();

    //   Send OTP via Fast2SMS using Axios
    const options = {
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      headers: {
        authorization:
          "V0KjJenIuXkZr4v1RU5lExfmChsBciL8DQzFMP62YTpS7dAqo3eiRKZgC32dATtwPmnc4BNzu0IXoQ6k", // Your Fast2SMS API key
      },
      data: {
        variables_values: otp, // OTP value
        route: "otp", // OTP route for sending
        numbers: mobile, // User's mobile number
      },
    };

    try {
      const response = await axios(options); // Send request using Axios
      console.log(response.data); // Log the response from Fast2SMS
      return res.status(200).json({ message: "OTP sent successfully" }); // Ensure to return after response
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending OTP", error });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
});

module.exports = router;
