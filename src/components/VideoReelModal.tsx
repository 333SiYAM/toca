import React, { useState, useEffect } from 'react';
import { Destination } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import {
  X,
  Play,
  Volume2,
  VolumeX,
  Heart,
  CalendarPlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  Share2,
  ExternalLink,
  ShieldCheck,
  Film,
} from 'lucide-react';

interface VideoReelModalProps {
  initialDestination: Destination;
  allDestinations: Destination[];
  onClose: () => void;
}

export const VideoReelModal: React.FC<VideoReelModalProps> = ({
  initialDestination,
  allDestinations,
  onClose,
}) => {
  const { language } = useLanguage();
  const { setSelectedDestination, addDestinationToTrip, trips, showToast } = useApp();

  // Filter destinations that have short videos
  const videoDestinations = allDestinations.filter((d) => d.shortVideo);
  const initialIndex = videoDestinations.findIndex((d) => d.id === initialDestination.id);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const currentDestination = videoDestinations[currentIndex] || initialDestination;
  const videoData = currentDestination.shortVideo;

  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [showTripMenu, setShowTripMenu] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videoDestinations.length]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    showToast(isMuted ? 'Sound unmuted 🔊' : 'Sound muted 🔇');
  };

  const handleLike = () => {
    const destId = currentDestination.id;
    const alreadyLiked = hasLiked[destId];
    const baseLikes = videoData?.likesCount || 1000;
    const currentVal = likes[destId] || baseLikes;

    if (alreadyLiked) {
      setLikes({ ...likes, [destId]: currentVal - 1 });
      setHasLiked({ ...hasLiked, [destId]: false });
    } else {
      setLikes({ ...likes, [destId]: currentVal + 1 });
      setHasLiked({ ...hasLiked, [destId]: true });
      showToast('Added to your favorite travel reels ❤️');
    }
  };

  const handleNext = () => {
    if (currentIndex < videoDestinations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setShowTripMenu(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(videoDestinations.length - 1);
    }
    setShowTripMenu(false);
  };

  const handleShare = () => {
    const shareTitle = `Authentic 4K Travel Reel: ${currentDestination.name_en}`;
    const shareUrl = `https://www.youtube.com/watch?v=${videoData?.youtubeId || ''}`;
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: `Watch authentic footage of ${currentDestination.name_en}, Bangladesh on TOCA!`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard?.writeText(shareUrl);
        showToast('Video link copied to clipboard');
      });
    } else {
      navigator.clipboard?.writeText(shareUrl);
      showToast('Video link copied to clipboard');
    }
  };

  const currentLikesCount = (likes[currentDestination.id] !== undefined)
    ? likes[currentDestination.id]
    : (videoData?.likesCount || 1200);

  const youtubeEmbedUrl = videoData?.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${videoData.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&loop=1&playlist=${videoData.youtubeId}&controls=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
      {/* Outer Container */}
      <div className="relative w-full max-w-[480px] h-full sm:h-[860px] max-h-[100vh] sm:max-h-[94vh] bg-stone-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-stone-800">
        
        {/* Top Floating Header */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between text-white drop-shadow">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-white/20 flex items-center gap-1.5 shadow-sm">
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentDestination.division} Division</span>
            </span>
            <span className="text-[11px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
              {currentIndex + 1} / {videoDestinations.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-colors text-white border border-white/10"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md transition-colors text-white border border-white/10"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Canvas */}
        <div className="relative w-full flex-1 bg-black overflow-hidden flex items-center justify-center">
          {youtubeEmbedUrl ? (
            <iframe
              key={`${currentDestination.id}-${isMuted}`}
              src={youtubeEmbedUrl}
              title={videoData?.title_en || currentDestination.name_en}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/70 p-6 space-y-2">
              <Play className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold">{currentDestination.name_en}</p>
              <p className="text-xs text-stone-400">Authentic video tour coming soon</p>
            </div>
          )}

          {/* Right Floating Actions Column (Likes, Guide, Share, YouTube) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-3.5 text-white"
          >
            {/* Heart Like Button */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
              aria-label="Like video reel"
            >
              <div className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/20 ${
                hasLiked[currentDestination.id] ? 'bg-rose-600 text-white scale-110' : 'bg-black/60 text-white hover:bg-black/80'
              }`}>
                <Heart className={`w-5 h-5 ${hasLiked[currentDestination.id] ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-mono font-bold text-white drop-shadow bg-black/50 px-1 rounded">
                {currentLikesCount.toLocaleString()}
              </span>
            </button>

            {/* View Full Guide */}
            <button
              onClick={() => {
                onClose();
                setSelectedDestination(currentDestination);
              }}
              className="flex flex-col items-center gap-1 group"
              title="View full destination guide"
            >
              <div className="p-3 rounded-full bg-emerald-700/90 hover:bg-emerald-600 backdrop-blur-md text-white transition-all shadow-lg border border-white/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-white/90 drop-shadow">Guide</span>
            </button>

            {/* Add to Trip */}
            <div className="relative">
              <button
                onClick={() => setShowTripMenu(!showTripMenu)}
                className="flex flex-col items-center gap-1 group"
                title="Add to Itinerary"
              >
                <div className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-lg border border-white/20">
                  <CalendarPlus className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-[10px] font-medium text-white/90 drop-shadow">Trip</span>
              </button>

              {/* Trip Selection Dropdown */}
              {showTripMenu && (
                <div className="absolute right-12 bottom-0 w-56 p-2 bg-stone-900/95 backdrop-blur-xl border border-stone-700 rounded-2xl shadow-2xl text-left text-xs z-50 animate-fadeIn">
                  <p className="px-2 py-1 font-bold text-stone-300 text-[11px] border-b border-stone-800">
                    Add to Itinerary:
                  </p>
                  {trips.length > 0 ? (
                    <div className="py-1 max-h-40 overflow-y-auto space-y-1">
                      {trips.map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => {
                            addDestinationToTrip(trip.id, currentDestination.id);
                            setShowTripMenu(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-white hover:bg-emerald-800 transition-colors truncate block"
                        >
                          {trip.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-2 text-[11px] text-stone-400">
                      No trips yet. Create one in the Trips tab!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group"
              title="Share reel"
            >
              <div className="p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-lg border border-white/20">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-white/90 drop-shadow">Share</span>
            </button>

            {/* External YouTube Link */}
            {videoData?.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoData.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group text-white"
                title="Watch on YouTube"
              >
                <div className="p-3 rounded-full bg-rose-700/80 hover:bg-rose-600 backdrop-blur-md text-white transition-all shadow-lg border border-white/20">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium text-white/90 drop-shadow">YouTube</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom Reel Navigation & Reel Carousel Strip */}
        <div className="p-3 bg-stone-950/95 border-t border-stone-800 space-y-2 z-30">
          {/* Destination Details & Switch Buttons */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>{language === 'bn' ? currentDestination.name_bn : currentDestination.name_en}</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 text-[10px] font-mono shrink-0">
                  ৳{currentDestination.budget_min_bdt.toLocaleString()}
                </span>
              </h3>
              <p className="text-[11px] text-emerald-300/90 truncate flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{videoData?.creator || 'Verified Bangladesh Tour Series'}</span>
              </p>
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition-colors border border-stone-700"
                aria-label="Previous reel"
                title="Previous reel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors border border-emerald-600"
                aria-label="Next reel"
                title="Next reel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reel Thumbnails Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
            {videoDestinations.map((d, index) => {
              const thumbUrl = d.shortVideo?.posterUrl || d.images[0]?.url;
              const isActive = index === currentIndex;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setShowTripMenu(false);
                  }}
                  className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all group ${
                    isActive
                      ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105'
                      : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                  title={d.name_en}
                >
                  <img
                    src={thumbUrl}
                    alt={d.name_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                  <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] font-bold text-white truncate drop-shadow text-center">
                    {d.division}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
