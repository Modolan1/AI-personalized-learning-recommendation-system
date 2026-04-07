import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HomeEntryPage from '../pages/auth/HomeEntryPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ManageCoursesPage from '../pages/admin/ManageCoursesPage';
import ManageQuizzesPage from '../pages/admin/ManageQuizzesPage';
import ManageFlashcardsPage from '../pages/admin/ManageFlashcardsPage';
import CategoriesAnalyticsPage from '../pages/admin/CategoriesAnalyticsPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import CoursesPage from '../pages/student/CoursesPage';
import CourseDetailPage from '../pages/student/CourseDetailPage';
import FlashcardsPage from '../pages/student/FlashcardsPage';
import QuizzesPage from '../pages/student/QuizzesPage';
import ProfilePage from '../pages/student/ProfilePage';
import DocumentsPage from '../pages/student/DocumentsPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeEntryPage />} />
      <Route path="/login" element={<HomeEntryPage />} />
      <Route path="/register" element={<HomeEntryPage />} />

      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><ManageCoursesPage /></ProtectedRoute>} />
      <Route path="/admin/quizzes" element={<ProtectedRoute roles={['admin']}><ManageQuizzesPage /></ProtectedRoute>} />
      <Route path="/admin/flashcards" element={<ProtectedRoute roles={['admin']}><ManageFlashcardsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><CategoriesAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><StudentsPage /></ProtectedRoute>} />

      <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute roles={['student']}><CoursesPage /></ProtectedRoute>} />
      <Route path="/student/courses/:id" element={<ProtectedRoute roles={['student']}><CourseDetailPage /></ProtectedRoute>} />
      <Route path="/student/flashcards" element={<ProtectedRoute roles={['student']}><FlashcardsPage /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute roles={['student']}><QuizzesPage /></ProtectedRoute>} />
      <Route path="/student/documents" element={<ProtectedRoute roles={['student']}><DocumentsPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><ProfilePage /></ProtectedRoute>} />
    </Routes>
  );
}
