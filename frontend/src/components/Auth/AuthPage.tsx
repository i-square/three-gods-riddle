import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthPage() {
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">
          Three Gods Riddle
        </h1>

        <div className="flex justify-center mb-6 border-b border-gray-700">
          <button
            onClick={() => setIsRegister(false)}
            className={`px-4 py-2 font-medium ${
              !isRegister
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-indigo-300'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`px-4 py-2 font-medium ${
              isRegister
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-indigo-300'
            }`}
          >
            {t('auth.register')}
          </button>
        </div>

        {isRegister ? <RegisterForm /> : <LoginForm />}
      </div>
    </div>
  );
}
