import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { env } from '../config/env.js';
import {
  getDashboard, getProfile, updateProfile, getCourses, getCourseDetail, getFlashcards, trackFlashcardReview, getQuizzes,
  submitQuiz, getAttempts, getRecommendations, refreshRecommendations, getDocumentUploadConfig,
  analyzeDocument, submitGeneratedDocumentQuiz, getDocumentHistory, getDocumentById, askDocumentQuestion
} from '../controllers/studentController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.documentUploadMaxBytes,
  },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfName = /\.pdf$/i.test(file.originalname || '');

    if (!isPdfMime || !isPdfName) {
      cb(new Error('Only PDF files are allowed.'));
      return;
    }

    cb(null, true);
  },
});

router.use(protect, authorizeRoles('student'));

router.get('/dashboard', getDashboard);
router.get('/documents/upload-config', getDocumentUploadConfig);
router.get('/documents', getDocumentHistory);
router.get('/documents/:id', getDocumentById);
router.post('/documents/analyze', upload.single('document'), analyzeDocument);
router.post('/documents/:id/quiz/submit', submitGeneratedDocumentQuiz);
router.post('/documents/:id/chat', askDocumentQuestion);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseDetail);
router.get('/flashcards', getFlashcards);
router.post('/flashcards/:id/review', trackFlashcardReview);
router.get('/quizzes', getQuizzes);
router.post('/quizzes/:id/submit', submitQuiz);
router.get('/attempts', getAttempts);
router.get('/recommendations', getRecommendations);
router.post('/recommendations/refresh', refreshRecommendations);

export default router;
