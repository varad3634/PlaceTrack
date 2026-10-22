import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DrivesPage } from './pages/DrivesPage';
import { DriveDetailsPage } from './pages/DriveDetailsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '10px',
            },
          }}
        />
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Drives */}
            <Route path="drives" element={<DrivesPage />} />
            <Route path="drives/:id" element={<DriveDetailsPage />} />

            {/* Applications */}
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailsPage />} />

            {/* Interviews */}
            <Route path="interviews" element={<InterviewsPage />} />

            {/* Companies */}
            <Route path="companies" element={<CompaniesPage />} />

            {/* Students Directory (TPO & Admin) */}
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['admin', 'tpo']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route path="students/:id" element={<StudentProfilePage />} />

            {/* Placement Reports (TPO & Admin) */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'tpo']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Audit Logs (Admin only) */}
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
