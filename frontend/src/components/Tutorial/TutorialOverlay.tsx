import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import { BookOpen, Users, MessageCircle, Target, Lightbulb, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { authApi } from '../../services/api';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEP_ICONS = [BookOpen, Users, MessageCircle, Target, Lightbulb];

export function TutorialOverlay({ isOpen, onClose, onComplete }: TutorialOverlayProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    { title: t('tutorial.step1Title'), desc: t('tutorial.step1Desc') },
    { title: t('tutorial.step2Title'), desc: t('tutorial.step2Desc') },
    { title: t('tutorial.step3Title'), desc: t('tutorial.step3Desc') },
    { title: t('tutorial.step4Title'), desc: t('tutorial.step4Desc') },
    { title: t('tutorial.step5Title'), desc: t('tutorial.step5Desc') },
  ];

  const handleComplete = async () => {
    if (dontShowAgain) {
      try {
        await authApi.updateTutorial(true);
      } catch {}
    }
    onComplete();
  };

  const handleSkip = () => {
    onClose();
  };

  const Icon = STEP_ICONS[currentStep];

  if (!isOpen) return null;

  return (
    <Transition show={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95">
        <div className="relative w-full max-w-lg mx-4 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-400">{t('tutorial.title')}</h2>
              <p className="text-gray-400 text-sm">{t('tutorial.subtitle')}</p>
            </div>

            <div className="flex justify-center mb-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                    idx === currentStep ? 'bg-indigo-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="bg-gray-900 rounded-lg p-6 mb-6 min-h-[200px]">
              <div className="flex items-center mb-4">
                <Icon className="w-8 h-8 text-indigo-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">{steps[currentStep].title}</h3>
              </div>
              <p className="text-gray-300 whitespace-pre-line">{steps[currentStep].desc}</p>
            </div>

            {currentStep === steps.length - 1 && (
              <label className="flex items-center text-sm text-gray-400 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="mr-2 rounded bg-gray-700 border-gray-600"
                />
                {t('tutorial.dontShowAgain')}
              </label>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('common.back')}
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                >
                  {t('tutorial.startGame')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
