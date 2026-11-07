import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';
import { Globe, Smartphone, Monitor, User, CloudSun, Sparkles } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { 
    activeTab, 
    setActiveTab, 
    viewMode, 
    toggleViewMode, 
    userProfile, 
    setIsLoginModalOpen,
    setIsAiChatOpen,
    setIsWeatherModalOpen,
  } = useApp();

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'explore', label: t.nav.explore },
    { id: 'map', label: t.nav.map },
    { id: 'trips', label: t.nav.trips },
    { id: 'saved', label: t.nav.saved },
    { id: 'profile', label: t.nav.profile },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4ED]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('explore')}
          className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#173B2E] whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span>TOCA</span>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-[#267A5C] bg-emerald-100/70 px-2 py-0.5 rounded">
            Bangladesh
          </span>
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'text-[#173B2E] border-[#267A5C]'
                    : 'text-stone-600 hover:text-stone-900 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Weather & Safe Travel Trigger */}
          <button
            onClick={() => setIsWeatherModalOpen(true)}
            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 shadow-2xs"
            title="Live Weather & Safe Travel Advisories"
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xl:inline">Weather</span>
          </button>

          {/* AI Travel Assistant Trigger */}
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200 shadow-2xs"
            title="Ask TOCA AI Travel Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">Ask AI</span>
          </button>
          {/* User Profile Avatar / Sign in trigger */}
          <button
            onClick={() => {
              if (userProfile.isLoggedIn) {
                setActiveTab('profile');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className="min-h-[40px] px-2.5 py-1 rounded-xl bg-white text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 shadow-2xs"
            title={userProfile.isLoggedIn ? `${userProfile.name} profile` : 'Sign in'}
          >
            {userProfile.isLoggedIn ? (
              <>
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-600"
                />
                <span className="hidden lg:inline text-xs truncate max-w-[100px]">
                  {userProfile.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>


          {/* Frame mode toggle */}
          <button
            onClick={toggleViewMode}
            className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 shadow-2xs"
            title={viewMode === 'device' ? 'Expand to responsive desktop layout' : 'Preview inside Android frame'}
          >
            {viewMode === 'device' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Android View</span>
              </>
            )}
          </button>

          {/* Bilingual Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="min-h-[40px] px-3 py-1.5 text-xs font-bold text-white bg-[#173B2E] hover:bg-[#204d3c] rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
