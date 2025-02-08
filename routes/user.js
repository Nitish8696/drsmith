const User = require("../models/User");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("./verifyToken");
const CryptoJS = require("crypto-js")


const router = require("express").Router();


router.put("/:id", verifyTokenAndAuthorization, async (req, res, next) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
        if (updatedUser) {
            res.status(500).json("user has been updated")
        }
    } catch (error) {
        res.status(500).json(err)
    }
})
router.post('/updatepassword', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const id = req.user.id
    if (!oldPassword || !newPassword) {
        return res.json({ status : 400, message: 'Old password and new password are required' });
    }
    try {
        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.json({ status : 404, message: 'User not found' });
        }

        // Check if the old password is correct
        const hashedPassword =  CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC)

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

        // const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (originalPassword !== oldPassword) {
            return res.json({ status: 406, message: 'Old password is incorrect' });
        }

        // Hash the new password and update it
        const NewhashedPassword =  CryptoJS.AES.encrypt(newPassword, process.env.PASS_SEC).toString();
        user.password = NewhashedPassword;

        // Save the updated user
        await user.save();

        res.json({ status:200, message: 'Password updated successfully' });
    } catch (error) {
        res.json({status:500, message: 'Server error', error: error.message });
    }
})

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const users = await User.find({ isVerified: true });  // Only fetch verified users
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            }
        ])
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router