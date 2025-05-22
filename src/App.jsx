import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import SignInForm from './components/auth/forms/SignInForm';
import SignUpForm from './components/auth/forms/SignUpForm';
import SecurePage from './components/secure/SecurePage';
import SettingsForm from './components/secure/settings/SettingsForm';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/welcome" />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" />;
  }
  return children;
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
