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
      } catch (error) {
        console.error('Failed to update tutorial preference:', error);
      }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
        <div className="surface-elevated p-0 w-full max-w-lg relative">
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-800"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <p className="badge mb-2">{t('tutorial.subtitle')}</p>
              <h2 className="text-2xl sm:text-3xl font-black section-title text-myth">{t('tutorial.title')}</h2>
            </div>

            <div className="flex justify-center mb-6">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full mx-1 transition-all ${
                    idx === currentStep ? 'bg-teal-600 w-6' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="surface-base rounded-lg p-6 mb-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-7 h-7 text-teal-700" />
                <h3 className="text-xl font-bold text-slate-900">{steps[currentStep].title}</h3>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{steps[currentStep].desc}</p>
            </div>

            {currentStep === steps.length - 1 && (
              <label className="flex items-center gap-2 text-sm text-slate-600 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('tutorial.dontShowAgain')}
              </label>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="btn-soft px-4 py-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('common.back')}
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="btn-primary px-4 py-2"
                >
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="btn-primary px-5 py-2"
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
