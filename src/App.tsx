import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Landing } from './pages/Landing';
import { ProfileSetup } from './pages/ProfileSetup';
import { Dashboard } from './pages/Dashboard';
import { WriteLetter } from './pages/WriteLetter';
import { LetterDetail } from './pages/LetterDetail';
import { Profile } from './pages/Profile';
import { Chocolates } from './pages/Chocolates';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write-letter"
            element={
              <ProtectedRoute>
                <WriteLetter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/letter/:id"
            element={
              <ProtectedRoute>
                <LetterDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chocolates"
            element={
              <ProtectedRoute>
                <Chocolates />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
