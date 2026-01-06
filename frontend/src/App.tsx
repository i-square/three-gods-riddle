import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/api';
import { AuthPage, ChangePasswordForm } from './components/Auth';
import { TutorialOverlay } from './components/Tutorial';
import { GameBoard } from './components/Game';
import { HistoryList, GameReplay } from './components/History';
import { Dashboard } from './components/Admin';
import { Navbar } from './components/Layout';

type Page = 'game' | 'history' | 'admin';

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, mustChangePassword, setUser, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('game');
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          if (!userData.tutorial_completed) {
            setShowTutorial(true);
          }
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

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (mustChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ChangePasswordForm />
      </div>
    );
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const renderPage = () => {
    if (selectedGameId !== null) {
      return (
        <GameReplay
          gameId={selectedGameId}
          onBack={() => setSelectedGameId(null)}
        />
      );
    }

    switch (currentPage) {
      case 'game':
        return <GameBoard />;
      case 'history':
        return <HistoryList onSelectGame={setSelectedGameId} />;
      case 'admin':
        return <Dashboard />;
      default:
        return <GameBoard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSelectedGameId(null);
        }}
        onTutorialClick={() => setShowTutorial(true)}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
}

export default App;
