import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm';
import { Sidebar } from './components/layout/Sidebar';
import { KanbanBoard } from './components/leads/KanbanBoard';
import { ClinicProfile } from './components/profile/ClinicProfile';
import OperatingHours from './components/hours/OperatingHours';
import { WhatsAppChannels } from './components/channels/WhatsAppChannels';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab === 'leads' ? '' : tab}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/profile" element={<ClinicProfile />} />
          <Route path="/hours" element={<OperatingHours />} />
          <Route path="/channels" element={<WhatsAppChannels />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm onForgotPassword={() => window.location.href = '/reset-password'} />} />
        <Route path="/reset-password" element={<ResetPasswordForm onBack={() => window.location.href = '/login'} />} />
        <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;