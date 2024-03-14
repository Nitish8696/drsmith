const router = require("express").Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken");


// Register

router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.formData.username,
        email: req.body.formData.email,
        password: CryptoJS.AES.encrypt(req.body.formData.password, process.env.PASS_SEC).toString(),
    })
    try {
        const savedUser = await newUser.save();
        res.json({status : 200 , msg : 'user created successfully'});
    } catch (err) {
        res.json({status : 409 , msg : 'username or email already exist'})
    }
})

// login

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.formData.username })
        if (!user) {
            return res.json({status: 401 ,msg : "User Not Found With This Email"});
        }

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC)

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

        if (originalPassword !== req.body.password) {
            return res.json({status : 401, msg : "Password is incorrect"});
        }

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        }, process.env.JWT_SEC, { expiresIn: "3d" })

        const { password, ...others } = user._doc;

        res.json({ ...others, accessToken, status : 200 });
    } catch (error) {
        res.status(500).json(error);
    }
})



module.exports = router