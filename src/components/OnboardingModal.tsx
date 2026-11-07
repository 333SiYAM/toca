import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Compass, Calendar, ShieldCheck, ArrowRight, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { language, t } = useLanguage();
  const { showOnboarding, dismissOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboarding) return null;

  const steps = [
    {
      icon: <Compass className="w-10 h-10 text-emerald-400" />,
      title: t.onboarding.step1Title,
      desc: t.onboarding.step1Desc,
      tag: 'Local-First Discovery',
    },
    {
      icon: <Calendar className="w-10 h-10 text-amber-400" />,
      title: t.onboarding.step2Title,
      desc: t.onboarding.step2Desc,
      tag: 'BDT ৳ Budget Estimates',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-teal-400" />,
      title: t.onboarding.step3Title,
      desc: t.onboarding.step3Desc,
      tag: 'Verified Provenance',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1b3e31] via-[#173B2E] to-[#122c22] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/40 space-y-6">
        <button
          onClick={dismissOnboarding}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center space-y-1 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-2">
            <Compass className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t.appName}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
            {t.appTagline}
          </p>
        </div>

        {/* Carousel Slide */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3 min-h-[160px] flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-emerald-300">
              {steps[currentStep].tag}
            </span>
            <span className="text-xs font-mono text-white/50">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200/80 leading-relaxed">
            {steps[currentStep].desc}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${
                currentStep === i ? 'w-6 bg-emerald-400' : 'w-2 bg-white/30'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {currentStep < steps.length - 1 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={dismissOnboarding}
                className="w-1/3 min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white"
              >
                {t.onboarding.skipBtn}
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="w-2/3 min-h-[44px] py-2.5 rounded-xl bg-[#267A5C] hover:bg-[#1f664d] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={dismissOnboarding}
              className="w-full min-h-[44px] py-3 rounded-xl bg-[#267A5C] hover:bg-[#1f664d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <span>{t.onboarding.startBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
