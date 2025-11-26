import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TreeViewPage } from './pages/admin/TreeViewPage';
import { TracksSubtracksPage } from './pages/admin/TracksSubtracksPage';
import { CoursesPage } from './pages/admin/CoursesPage';
import { QuestionsPage } from './pages/admin/QuestionsPage';
import { CourseQuestionsPage } from './pages/admin/CourseQuestionsPage';
import { CapstoneListPage } from './pages/admin/CapstoneListPage';
import { CapstoneDetailPage } from './pages/admin/CapstoneDetailPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeCoursesPage } from './pages/employee/CoursesPage';
import { CourseDetailPage } from './pages/employee/CourseDetailPage';
import { QuizPage } from './pages/employee/QuizPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

const PrivateRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({
  children,
  role,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} /> : <Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/tree-view"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <TreeViewPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/tracks"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <TracksSubtracksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <CoursesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <QuestionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/questions/:courseId"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <CourseQuestionsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/capstones"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <CapstoneListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/capstones/:capstoneId"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <CapstoneDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <PrivateRoute role="admin">
            <Navbar />
            <EmployeesPage />
          </PrivateRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <EmployeeDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/dashboard"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <EmployeeDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <EmployeeProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/courses"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <EmployeeCoursesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/courses/:courseId"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <CourseDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/employee/courses/:courseId/quiz"
        element={
          <PrivateRoute role="employee">
            <Navbar />
            <QuizPage />
          </PrivateRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
