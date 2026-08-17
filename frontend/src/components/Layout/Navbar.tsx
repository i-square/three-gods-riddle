import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, History, Shield, HelpCircle, LogOut, Globe, X, BrainCircuit, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { changeLanguage } from '../../i18n';

type NavPage = 'game' | 'history' | 'admin';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onTutorialClick: () => void;
}

const NAV_ICONS: Record<NavPage, typeof Menu> = {
  game: BrainCircuit,
  history: History,
  admin: Shield,
};

export function Navbar({ currentPage, onNavigate, onTutorialClick }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: NavPage; label: string }[] = [
    { key: 'game', label: t('nav.game') },
    { key: 'history', label: t('nav.history') },
  ];

  if (isAdmin) {
    navItems.push({ key: 'admin', label: t('nav.admin') });
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    changeLanguage(newLang);
  };

  return (
    <header className="surface-base px-3 py-3 md:px-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {/* brand */}
        <button
          onClick={() => onNavigate('game')}
          className="flex items-center gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-slate-100/70 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white font-bold tracking-tight text-lg shadow-sm">
            3
          </div>
          <div className="text-left">
            <p className="font-black text-lg section-title text-myth">{t('nav.appName')}</p>
            <p className="text-xs text-slate-500">{t('game.title')}</p>
          </div>
        </button>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.key];
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`btn-soft px-3.5 py-2 flex items-center gap-2 ${
                  isActive ? 'bg-teal-50 text-teal-800 border-teal-300' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-600'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}

          <div className="w-px h-8 mx-1 bg-slate-300" />

          <button
            onClick={onTutorialClick}
            className="btn-soft px-2.5 py-2 text-sm"
            title={t('nav.tutorial')}
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={toggleLanguage}
            className="btn-soft px-2.5 py-2 text-sm flex items-center gap-2"
            title={i18n.language === 'en' ? '切换为中文' : 'Switch to English'}
          >
            {i18n.language === 'en' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{i18n.language === 'en' ? 'CN' : 'EN'}</span>
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-[0.16em]">{t('game.playerRole')}</p>
            <p className="font-semibold text-sm text-slate-800">{user?.id}</p>
          </div>
          <button
            onClick={logout}
            className="icon-btn btn-danger"
            title={t('auth.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="md:hidden icon-btn btn-soft"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 animate-fade-in-up">
          <div className="surface-glass p-3 rounded-xl space-y-2">
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.key];
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full btn-soft px-3 py-2.5 flex items-center justify-between ${
                    isActive ? 'bg-teal-50 text-teal-800 border-teal-300' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </button>
              );
            })}

            <div className="h-px bg-slate-200 my-1" />
            <button
              onClick={() => {
                onTutorialClick();
                setMobileMenuOpen(false);
              }}
              className="w-full btn-soft px-3 py-2.5 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              {t('nav.tutorial')}
            </button>

            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full btn-soft px-3 py-2.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {i18n.language === 'en' ? 'Switch to 中文' : 'Switch to English'}
              </span>
            </button>

            <button
              onClick={logout}
              className="w-full btn-danger px-3 py-2.5 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>

            <div className="pt-1 pl-1 text-xs text-slate-600">
              {user?.id}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
