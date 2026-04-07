import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getDashboard, getStudents, getCategories, createCategory, getCategoryAnalytics,
  getCourses, createCourse, updateCourse, deleteCourse,
  getQuizzes, createQuiz, updateQuiz, deleteQuiz,
  getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard,
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.get('/flashcards', getFlashcards);
router.post('/flashcards', createFlashcard);
router.put('/flashcards/:id', updateFlashcard);
router.delete('/flashcards/:id', deleteFlashcard);

export default router;
