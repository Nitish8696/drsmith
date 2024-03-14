const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/temp'); // Destination directory for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // File naming
    }
});

// Initialize Multer upload
const upload = multer({ storage: storage });

module.exports = upload;