import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/home';
import { EncryptPage } from './pages/encrypt';
import { AccessPage } from './pages/access';
import { DecryptLocalPage } from './pages/decrypt-local';
import { DashboardPage } from './pages/dashboard';
import LoginPage from './pages/login';
import SignUpPage from './pages/signup';
import AccountDashboard from './pages/account-dashboard';
import { ProtectedRoute } from './components/auth/protected-route';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/encrypt" element={<ProtectedRoute><EncryptPage /></ProtectedRoute>} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/decrypt-local" element={<DecryptLocalPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;