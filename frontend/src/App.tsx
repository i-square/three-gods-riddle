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
      <div className="page-shell">
        <div className="page-content">
          <div className="surface-elevated p-8 sm:p-10 max-w-xl mx-auto">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showTutorial, setShowTutorial] = useState(() => !!user && !user.tutorial_completed);

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.startsWith('/game')) return 'game';
    if (path.startsWith('/history')) return 'history';
    if (path.startsWith('/admin')) return 'admin';
    return 'game';
  };

  return (
    <div className="page-shell page-enter">
      <div className="page-content">
        <Navbar
          currentPage={getCurrentPage()}
          onNavigate={(page) => navigate(`/${page}`)}
          onTutorialClick={() => setShowTutorial(true)}
        />

        <main className="mt-6 surface-glass p-4 sm:p-5 lg:p-6">
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
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initUser();
  }, [isAuthenticated, logout, setUser]);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="surface-elevated px-7 py-6 animate-fade-in-up">
          <div className="text-sm font-semibold text-teal-700">{t('common.loading')}</div>
        </div>
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
