import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, History, Shield, HelpCircle, LogOut, Globe, X, BrainCircuit } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { changeLanguage } from '../../i18n';

type NavPage = 'game' | 'history' | 'admin';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onTutorialClick: () => void;
}

export function Navbar({ currentPage, onNavigate, onTutorialClick }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: NavPage; label: string; icon: typeof Menu }[] = [
    { key: 'game', label: t('nav.game'), icon: BrainCircuit },
    { key: 'history', label: t('nav.history'), icon: History },
  ];

  if (isAdmin) {
    navItems.push({ key: 'admin', label: t('nav.admin'), icon: Shield });
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <span className="text-xl font-bold text-gray-100 tracking-tight hidden sm:block">
              {t('nav.appName')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${currentPage === item.key
                      ? 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onTutorialClick}
              className="p-2 rounded-xl text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
              title={t('nav.tutorial')}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-white/10" />

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'en' ? 'CN' : 'EN'}</span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-gray-300">{user?.id}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('game.playerRole')}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title={t('auth.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 animate-fade-in-up">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${currentPage === item.key
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            
            <div className="h-px bg-white/10 my-4" />
            
            <button
              onClick={() => {
                onTutorialClick();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <HelpCircle className="w-5 h-5" />
              {t('nav.tutorial')}
            </button>
            
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Globe className="w-5 h-5" />
              {i18n.language === 'en' ? 'Switch to 中文' : 'Switch to English'}
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
