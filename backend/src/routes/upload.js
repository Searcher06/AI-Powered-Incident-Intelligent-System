import express from 'express';
import multer from 'multer';
import uploadController from '../controllers/uploadController.js';

const router = express.Router();

// Store in memory — we stream directly to Cloudinary, no disk writes
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, webp, gif`));
    }
  },
});

// POST /upload  — accepts multipart/form-data with field name "image"
router.post('/', upload.single('image'), uploadController.uploadImage);

export default router;
