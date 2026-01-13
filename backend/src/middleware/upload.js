import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createDirs = () => {
    const dirs = ['uploads/videos', 'uploads/thumbnails'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
createDirs();

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video') {
            cb(null, 'uploads/videos');
        } else if (file.fieldname === 'thumbnail') {
            cb(null, 'uploads/thumbnails');
        } else {
            cb({ message: 'This file is not accepted' }, false);
        }
    },
    filename: (req, file, cb) => {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    console.log('Multer processing file:', file.fieldname, file.mimetype);
    if (file.fieldname === 'video') {
        // Accept video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            console.error('File rejected: Not a video', file.mimetype);
            cb(new Error('Not a video! Please upload a video file.'), false);
        }
    } else if (file.fieldname === 'thumbnail') {
        // Accept image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            console.error('File rejected: Not an image', file.mimetype);
            cb(new Error('Not an image! Please upload an image for thumbnail.'), false);
        }
    } else {
        console.error('File rejected: Unexpected field', file.fieldname);
        cb(null, false);
    }
};

// Initiate multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024 // 2GB limit
    }
});

// Middleware for handling both video and thumbnail fields
export const uploadVideo = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);
