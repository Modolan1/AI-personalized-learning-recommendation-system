import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getDashboard, getContent, getCategories,
  createContent, updateContent, deleteContent,
  getContentById, trackView,
} from '../controllers/instructorController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, '..', '..', 'uploads', 'instructor-docs');
mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF documents are allowed'));
  },
});

const router = express.Router();
router.use(protect, authorizeRoles('instructor'));

router.get('/dashboard', getDashboard);
router.get('/content', getContent);
router.get('/content/:id', getContentById);
router.get('/categories', getCategories);
router.post('/content', upload.single('file'), createContent);
router.put('/content/:id', upload.single('file'), updateContent);
router.delete('/content/:id', deleteContent);
router.post('/content/:id/view', trackView);

export default router;
