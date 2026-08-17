import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, BookOpen } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthPage() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="page-shell min-h-screen flex items-center justify-center">
      <div className="texture-layer" />
      <div className="page-content w-full max-w-4xl grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="surface-elevated p-7 lg:p-9 relative overflow-hidden animate-fade-in-up">
          <div className="absolute -top-8 right-[-26px] w-36 h-36 rounded-full bg-amber-200/50 blur-2xl" />
          <div className="absolute bottom-[-22px] left-[-14px] w-28 h-28 rounded-full bg-teal-200/40 blur-2xl" />
          <div className="relative z-10">
            <p className="badge mb-5">{t('tutorial.subtitle')}</p>
            <h1 className="section-title text-4xl sm:text-5xl font-black text-amber-600">
              <span className="text-brand-gradient">3 {t('game.headerTitle')}</span>
            </h1>
            <p className="mt-4 text-base text-slate-700 leading-relaxed max-w-sm">
              {t('game.description')}
            </p>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-700" />
                {t('game.rulesTitle')}
              </p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-teal-600">
                  {t('game.rule1')}
                </li>
                <li className="pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-teal-600">
                  {t('game.rule2')}
                </li>
              </ul>
            </div>

            <div className="mt-8 border border-teal-200/80 bg-teal-50/50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed flex gap-3">
              <BookOpen className="w-5 h-5 text-teal-700 flex-shrink-0" />
              <span>{t('tutorial.step1Desc')}</span>
            </div>
          </div>
        </section>

        <section className="surface-elevated p-6 sm:p-7 lg:p-8 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="flex justify-center rounded-xl p-2 bg-slate-100 text-sm mb-6 border border-slate-200">
            <button
              onClick={() => setIsRegister(false)}
              className={`w-1/2 px-4 py-2 font-semibold rounded-lg transition-colors ${
                !isRegister ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`w-1/2 px-4 py-2 font-semibold rounded-lg transition-colors ${
                isRegister ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {isRegister ? <RegisterForm /> : <LoginForm />}
        </section>
      </div>
    </div>
  );
}
