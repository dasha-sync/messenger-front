import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import SignInForm from './components/auth/forms/SignInForm';
import SignUpForm from './components/auth/forms/SignUpForm';
import SecurePage from './components/secure/SecurePage';
import SettingsForm from './components/secure/settings/SettingsForm';
import { useAuth } from './components/controls/AuthContext';
import Alert from './components/controls/Alert';

import './App.css';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error, clearError } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <>
      {error && (
        <Alert
          message={error.message}
          status={error.status}
          onClose={clearError}
        />
      )}
      {children}
    </>
  );
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error, clearError } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  return (
    <>
      {error && (
        <Alert
          message={error.message}
          status={error.status}
          onClose={clearError}
        />
      )}
      {isAuthenticated ? <Navigate to="/" /> : children}
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <SecurePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsForm />
          </ProtectedRoute>
        } />
        <Route path="/secure" element={
          <ProtectedRoute>
            <SecurePage />
          </ProtectedRoute>
        } />

        {/* Public routes */}
        <Route path="/signin" element={
          <PublicRoute>
            <SignInForm />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUpForm />
          </PublicRoute>
        } />
        <Route path="/welcome" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
