import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/home';
import { EncryptPage } from './pages/encrypt';
import { AccessPage } from './pages/access';
import { DashboardPage } from './pages/dashboard';
import LoginPage from './pages/login';
import SignUpPage from './pages/signup';
import DashboardNew from './pages/dashboard-new';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/encrypt" element={<EncryptPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard-new/*" element={<DashboardNew />} />
      </Routes>
    </Router>
  );
}

export default App;