import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Login } from '../pages/Login';
import { Profile } from '../pages/Profile';
import { Unauthorized } from '../pages/Unauthorized';
import {
  AdminDashboard,
  AdminUsers,
  AdminClasses,
  AdminSubjects,
  AdminTeacherAssignments,
  AdminAssignments,
} from '../pages/admin';
import {
  TeacherDashboard,
  TeacherAssignments,
  TeacherCreateAssignment,
  TeacherSubmissions,
} from '../pages/teacher';
import {
  StudentDashboard,
  StudentAssignments,
  StudentSubmissions,
} from '../pages/student';

// Public only route (redirects to role dashboard if already logged in)
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user, getRoleDashboardPath } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return children;
};

// Root redirect
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, getRoleDashboardPath } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes inside AppShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {/* Shared Authenticated Routes */}
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/classes" element={<AdminClasses />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/teacher-assignments" element={<AdminTeacherAssignments />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<RoleRoute allowedRoles={['Teacher']} />}>
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
            <Route path="/teacher/assignments/create" element={<TeacherCreateAssignment />} />
            <Route path="/teacher/assignments/:id/submissions" element={<TeacherSubmissions />} />
          </Route>

          {/* Student Routes */}
          <Route element={<RoleRoute allowedRoles={['Student']} />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/submissions" element={<StudentSubmissions />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
