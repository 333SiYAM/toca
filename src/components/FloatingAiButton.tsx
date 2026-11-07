import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Sparkles, Bot, CloudSun } from 'lucide-react';

export const FloatingAiButton: React.FC = () => {
  const { language } = useLanguage();
  const { setIsAiChatOpen, setIsWeatherModalOpen } = useApp();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Quick Weather & Safe Travel Floating Pill */}
      <button
        onClick={() => setIsWeatherModalOpen(true)}
        className="px-3 py-2 rounded-full bg-white/95 text-stone-800 hover:bg-stone-50 text-xs font-semibold shadow-lg border border-stone-200 flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
        title="Check Live Weather & Safe Travel Conditions"
      >
        <CloudSun className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">
          {language === 'bn' ? 'আবহাওয়া ও নিরাপত্তা' : 'Live Weather & Safety'}
        </span>
      </button>

      {/* Main AI Chatbot Launcher Button */}
      <button
        onClick={() => setIsAiChatOpen(true)}
        className="px-4 py-3 rounded-full bg-gradient-to-r from-[#173B2E] to-[#205e47] hover:from-[#1b4435] hover:to-[#267256] text-white text-xs sm:text-sm font-bold shadow-xl border border-emerald-400/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ring-4 ring-emerald-900/10"
        title="Open TOCA Travel AI Assistant"
        aria-label="Open AI Chatbot"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin [animation-duration:8s]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span>
          {language === 'bn' ? 'টোকা এআই গাইড' : 'Ask TOCA AI'}
        </span>
      </button>
    </div>
  );
};
