import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, AppLayout } from './components/layout/AppLayout';

import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import EmployeesPage  from './pages/EmployeesPage';
import TasksPage      from './pages/TasksPage';
import AttendancePage from './pages/AttendancePage';
import MyTasksPage    from './pages/MyTasksPage';
import ProfilePage    from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login"    element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute roles={['admin', 'manager']}>
                <AppLayout>
                  <EmployeesPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/tasks" element={
              <ProtectedRoute>
                <AppLayout>
                  <TasksPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/attendance" element={
              <ProtectedRoute>
                <AppLayout>
                  <AttendancePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/my-tasks" element={
              <ProtectedRoute roles={['employee']}>
                <AppLayout>
                  <MyTasksPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
