import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  getDashboard, getProfile, updateProfile, getStudents, getInstructors, getAdmins, getStudentById, updateStudent, deleteStudent, updateInstructor, deleteInstructor,
  getCategories, createCategory, updateCategory, deleteCategory, getCategoryAnalytics,
  getCourses, createCourse, updateCourse, deleteCourse,
  getQuizzes, createQuiz, updateQuiz, deleteQuiz,
  getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard,
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/students', getStudents);
router.get('/instructors', getInstructors);
router.get('/admins', getAdmins);
router.get('/students/:id', validateObjectId, getStudentById);
router.put('/students/:id', validateObjectId, updateStudent);
router.delete('/students/:id', validateObjectId, deleteStudent);
router.put('/instructors/:id', validateObjectId, updateInstructor);
router.delete('/instructors/:id', validateObjectId, deleteInstructor);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', validateObjectId, updateCategory);
router.delete('/categories/:id', validateObjectId, deleteCategory);
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', validateObjectId, updateCourse);
router.delete('/courses/:id', validateObjectId, deleteCourse);
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', validateObjectId, updateQuiz);
router.delete('/quizzes/:id', validateObjectId, deleteQuiz);
router.get('/flashcards', getFlashcards);
router.post('/flashcards', createFlashcard);
router.put('/flashcards/:id', validateObjectId, updateFlashcard);
router.delete('/flashcards/:id', validateObjectId, deleteFlashcard);

export default router;
