const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const path = require("path");

const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public'); // Destination directory for uploaded files
    },
    filename: function (req, file, cb) {
        return cb(null, Date.now() + path.extname(file.originalname)); // File naming
    }
});

const upload = multer({ storage: storage });

router.post("/", upload.single('file'), async (req, res) => {

    try {
        const image = req.file;
        let imagePath = "";
        if (image) {
            imagePath = image.filename;
        }
        res.json({
            success: 1,
            file: {
                url: `http://localhost:8000/${imagePath}`,
            },
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

module.exports = router