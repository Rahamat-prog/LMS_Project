const path = require('path');
const multer = require('multer');

const upload = multer({

    limits: {fileSize: 50 * 1024 * 1024}, // 50 mb in size max limit

    // Where and how to store file
    storage: multer.diskStorage({

        // Temp folder to save file
        destination: "uploads/",

        // Keep original file name
        filename: (req, file,cb) => {
            cb(null, file.originalname);
        },
    }),

    // Allow only these file types
    fileFilter: (req, file, cb) => {

         // Get file extension (.jpg, .mp4 etc)
        let ext = path.extname(file.originalname); 
        // Reject if not in allowed list
        if( ext !== ".jpg" && 
            ext !== ".jpeg" && 
            ext !== ".webp" && 
            ext !== ".png" && 
            ext !== ".mp4") {
            cb(new Error(`unsupported file type! ${ext}`), false); // reject file 
            return ;
        }
        // Accept file
        cb(null, true);
    }
});

module.exports = upload;