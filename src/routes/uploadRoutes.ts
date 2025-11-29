import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware';
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
