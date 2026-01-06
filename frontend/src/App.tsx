import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import './i18n';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/api';
import { AuthPage, ChangePasswordForm } from './components/Auth';
import { TutorialOverlay } from './components/Tutorial';
import { GameBoard } from './components/Game';
import { HistoryList, GameReplay } from './components/History';
import { Dashboard } from './components/Admin';
import { Navbar } from './components/Layout';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mustChangePassword } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ChangePasswordForm />
      </div>
    );
  }

  return children;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const { user } = useAuthStore();
  
  // Auto-show tutorial if not completed
  useEffect(() => {
    if (user && !user.tutorial_completed) {
      setShowTutorial(true);
    }
  }, [user]);

  // Map path to nav key
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/game')) return 'game';
    if (path.startsWith('/history')) return 'history';
    if (path.startsWith('/admin')) return 'admin';
    return 'game';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={getCurrentPage()}
        onNavigate={(page) => navigate(`/${page}`)}
        onTutorialClick={() => setShowTutorial(true)}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/game" element={<GameBoard />} />
          <Route path="/history" element={<HistoryList onSelectGame={(id) => navigate(`/history/${id}`)} />} />
          <Route path="/history/:id" element={<GameReplayWrapper />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/game" replace />} />
        </Routes>
      </main>
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => setShowTutorial(false)}
      />
    </div>
  );
}

function GameReplayWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <GameReplay gameId={Number(id)} onBack={() => navigate('/history')} />;
}

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          // Tutorial auto-show logic could be handled in Layout or here if we pass prop
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initUser();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/game" />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
