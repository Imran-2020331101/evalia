const multer = require("multer");
const path = require("path");
const config = require("../config");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in uploads/temp directory
    cb(null, path.join(__dirname, "../../uploads/temp"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter for PDF validation
const fileFilter = (req, file, cb) => {
  // Check if file is PDF
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // Maximum file size
  },
  fileFilter: fileFilter,
});

module.exports = upload;
