import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import PageAnimationWrapper from './components/PageAnimationWrapper';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Define a protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={
          <PageAnimationWrapper>
            <Login />
          </PageAnimationWrapper>
        } />
        <Route path="/register" element={
          <PageAnimationWrapper>
            <Register />
          </PageAnimationWrapper>
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Budget />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={
          <PageAnimationWrapper>
            <NotFound />
          </PageAnimationWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// App with theme
const AppWithTheme = () => {
  const { darkMode } = useThemeContext();
  
  // Create light theme
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#D4AF37', // Gold
        light: '#E6C555',
        dark: '#BF9B2F',
      },
      secondary: {
        main: '#9C7A2D', // Darker gold
      },
      background: {
        default: '#FDF8E8', // Slightly golden off-white
        paper: '#F8F3E2',  // Warmer off-white with golden tint
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
    },
  });
  
  // Create dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4B0082', // Dark royal purple
        light: '#6A1B9A',
        dark: '#38006B',
      },
      secondary: {
        main: '#673AB7', // Lighter purple accent
      },
      background: {
        default: '#121212', // Very dark gray
        paper: '#1E1E1E',  // Dark gray
      },
      text: {
        primary: '#E0E0E0',
        secondary: '#A0A0A0',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
    },
  });
  
  // Use dark or light theme based on user preference
  const theme = darkMode ? darkTheme : lightTheme;
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

export default App;
