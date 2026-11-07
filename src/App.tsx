import React from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { LoginModal } from './components/LoginModal';
import { VideoReelModal } from './components/VideoReelModal';
import { AiChatbotModal } from './components/AiChatbotModal';
import { WeatherSafetyModal } from './components/WeatherSafetyModal';
import { FloatingAiButton } from './components/FloatingAiButton';
import { DESTINATIONS } from './data/destinations';

import { ExploreTab } from './tabs/ExploreTab';
import { MapTab } from './tabs/MapTab';
import { TripsTab } from './tabs/TripsTab';
import { SavedTab } from './tabs/SavedTab';
import { ProfileTab } from './tabs/ProfileTab';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { 
    activeTab, 
    selectedDestination, 
    setSelectedDestination, 
    viewMode, 
    toast,
    activeVideoReelDest,
    setActiveVideoReelDest,
  } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'explore':
        return <ExploreTab />;
      case 'map':
        return <MapTab />;
      case 'trips':
        return <TripsTab />;
      case 'saved':
        return <SavedTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ExploreTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4ED] text-[#202923] flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#173B2E] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-medium border border-emerald-700/50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Top App Bar adhering to Top Bar contract */}
      <TopNav />

      {/* Main Content: Android Phone Frame OR Responsive Fullscreen */}
      <main className="flex-1 w-full">
        {viewMode === 'device' ? (
          <AndroidDeviceFrame>
            {renderActiveTab()}
          </AndroidDeviceFrame>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {renderActiveTab()}
          </div>
        )}
      </main>

      {/* Fixed Bottom Tab Bar for Mobile view in Responsive mode */}
      {viewMode === 'responsive' && <BottomNav isContainedInFrame={false} />}

      {/* Global Onboarding Modal */}
      <OnboardingModal />

      {/* User Login & Registration Modal */}
      <LoginModal />

      {/* Fullscreen Travel Video Reel Player */}
      {activeVideoReelDest && (
        <VideoReelModal
          initialDestination={activeVideoReelDest}
          allDestinations={DESTINATIONS}
          onClose={() => setActiveVideoReelDest(null)}
        />
      )}

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <DestinationDetailModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onOpenVideoReel={(dest) => setActiveVideoReelDest(dest)}
        />
      )}

      {/* Real-time AI Travel Chatbot Modal */}
      <AiChatbotModal />

      {/* Safe Travel & Meteorological Weather Modal */}
      <WeatherSafetyModal />

      {/* Quick-Access Floating AI Travel Assistant Button */}
      <FloatingAiButton />

      {/* Minimal Anti-slop Footer */}
      {viewMode === 'responsive' && (
        <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500 mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-stone-700">TOCA — Travel & Explore Bangladesh</p>
              <p className="text-[11px] text-stone-400">
                Official Bangladesh tourism database & itineraries. Estimated budgets in BDT (৳).
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-stone-400">
              <span>National Hotline: 999</span>
              <span>·</span>
              <span>Tourist Police: +880 1320-163599</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
