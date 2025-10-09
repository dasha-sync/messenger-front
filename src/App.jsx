import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import SignInForm from './components/auth/forms/SignInForm';
import SignUpForm from './components/auth/forms/SignUpForm';
import SecurePage from './components/secure/SecurePage';
import SettingsForm from './components/secure/settings/SettingsForm';
import { useAuth } from './components/controls/AuthContext';
import Alert from './components/controls/Alert';

import './App.css';

const LoadingScreen = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const PUBLIC_ROUTES = ['/welcome', '/signin', '/signup'];

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error, clearError } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('App state:', { isLoading, isAuthenticated, pathname: location.pathname });
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
      console.log('Route check:', { isPublicRoute });

      if (!isAuthenticated && !isPublicRoute) {
        console.log('Redirecting to welcome...');
        navigate('/welcome', { replace: true });
      } else if (isAuthenticated && isPublicRoute) {
        console.log('Redirecting to home...');
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  if (isLoading) {
    console.log('App is loading...');
    return <LoadingScreen />;
  }

  console.log('Rendering App with state:', { isLoading, isAuthenticated });
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

        {/* Catch all route - должен быть последним */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/welcome" replace />
        } />
      </Routes>
    </div>
  );
}

export default App;
