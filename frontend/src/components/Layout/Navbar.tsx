import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, History, Shield, HelpCircle, LogOut, Globe } from 'lucide-react';
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
    { key: 'game', label: t('nav.game'), icon: Menu },
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
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-400">Three Gods</span>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPage === item.key
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="inline-block w-4 h-4 mr-1" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onTutorialClick}
              className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700"
              title={t('nav.tutorial')}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={toggleLanguage}
              className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 flex items-center"
            >
              <Globe className="w-5 h-5 flex-shrink-0" />
              <span className="ml-1 text-sm whitespace-nowrap">{i18n.language === 'en' ? '中文' : 'English'}</span>
            </button>
            <span className="text-gray-400 text-sm">{user?.id}</span>
            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentPage === item.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="inline-block w-4 h-4 mr-2" />
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <button
                onClick={() => {
                  onTutorialClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700"
              >
                <HelpCircle className="inline-block w-4 h-4 mr-2" />
                {t('nav.tutorial')}
              </button>
              <button
                onClick={toggleLanguage}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700"
              >
                <Globe className="inline-block w-4 h-4 mr-2" />
                {i18n.language === 'en' ? '中文' : 'English'}
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-gray-700"
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
