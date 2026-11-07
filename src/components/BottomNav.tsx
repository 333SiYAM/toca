import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';
import { Compass, Map, Calendar, Bookmark, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  isContainedInFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ isContainedInFrame = false }) => {
  const { t } = useLanguage();
  const { activeTab, setActiveTab, savedDestinationIds, trips } = useApp();

  const tabs: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { id: 'explore', label: t.nav.explore, icon: Compass },
    { id: 'map', label: t.nav.map, icon: Map },
    { id: 'trips', label: t.nav.trips, icon: Calendar, badgeCount: trips.length },
    { id: 'saved', label: t.nav.saved, icon: Bookmark, badgeCount: savedDestinationIds.length },
    { id: 'profile', label: t.nav.profile, icon: ShieldCheck },
  ];

  return (
    <nav
      className={`${
        isContainedInFrame
          ? 'sticky bottom-0 left-0 right-0 z-40'
          : 'fixed bottom-0 left-0 right-0 z-40 md:hidden'
      } bg-white/95 backdrop-blur-md border-t border-stone-200 select-none shadow-lg`}
      aria-label="Bottom Navigation"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
                isActive ? 'text-[#173B2E]' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] text-[9px] font-mono font-bold bg-[#267A5C] text-white rounded-full flex items-center justify-center">
                    {tab.badgeCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[64px] ${
                  isActive ? 'font-bold text-[#173B2E]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#267A5C]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
