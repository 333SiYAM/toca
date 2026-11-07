import React, { useState, useEffect } from 'react';
import { Destination } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DestinationVisual } from './DestinationVisual';
import { DESTINATIONS } from '../data/destinations';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherService';
import {
  X,
  Bookmark,
  Share2,
  CalendarPlus,
  ExternalLink,
  MapPin,
  Clock,
  Banknote,
  Sun,
  ShieldCheck,
  Compass,
  Bus,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Play,
  Image as ImageIcon,
  CloudSun,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  Film,
  Sparkles,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  Navigation,
} from 'lucide-react';

interface DestinationDetailModalProps {
  destination: Destination;
  onClose: () => void;
  onOpenVideoReel?: (dest: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  onOpenVideoReel,
}) => {
  const { language, t } = useLanguage();
  const { 
    isDestinationSaved, 
    toggleSaveDestination, 
    trips, 
    addDestinationToTrip,
    createTrip,
    showToast,
    setSelectedDestination,
    openAiChatWithPrompt,
    setIsWeatherModalOpen,
  } = useApp();

  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);
    fetchLiveWeather(destination.id, destination.latitude, destination.longitude)
      .then((data) => {
        if (isMounted) setLiveWeather(data);
      })
      .catch((err) => {
        console.warn('Destination modal weather error:', err);
      })
      .finally(() => {
        if (isMounted) setWeatherLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [destination.id, destination.latitude, destination.longitude]);

  const isSaved = isDestinationSaved(destination.id);

  const images = destination.images || [];

  const nearbyDestinations = DESTINATIONS.filter(
    (d) => d.division === destination.division && d.id !== destination.id
  ).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `TOCA — ${destination.name_en}`,
        text: destination.short_description_en,
        url: window.location.href,
      }).catch(() => {
        showToast('Link copied to clipboard');
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Destination link copied to clipboard');
    }
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentPhoto = images[selectedPhotoIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 min-h-[44px] min-w-[44px] flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-md"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Container (Photos Gallery vs Video Reel) */}
        <div className="relative">
          {activeMediaTab === 'photos' ? (
            <div className="relative group">
              <DestinationVisual 
                destination={destination} 
                aspect="hero" 
                activeImageIndex={selectedPhotoIndex}
              />

              {/* Lightbox Trigger Button */}
              {currentPhoto && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-16 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md transition-all"
                  title="Expand Full Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View High-Res</span>
                </button>
              )}

              {/* Photo Caption Overlay */}
              {currentPhoto && (
                <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                  <p className="text-xs text-white/95 font-medium bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl inline-block drop-shadow border border-white/10 max-w-full">
                    📷 {language === 'bn' ? currentPhoto.caption_bn : currentPhoto.caption_en}
                    {currentPhoto.authorCredit && (
                      <span className="text-emerald-300 ml-1.5 text-[11px] font-mono">
                        · © {currentPhoto.authorCredit}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Inline Video Reel Preview */
            <div className="relative h-72 sm:h-84 md:h-96 bg-black flex flex-col items-center justify-center overflow-hidden">
              {destination.shortVideo?.youtubeId ? (
                <>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${destination.shortVideo.youtubeId}?autoplay=1&mute=0&playsinline=1&controls=1&rel=0`}
                    title={destination.shortVideo.title_en}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {onOpenVideoReel && (
                    <button
                      onClick={() => onOpenVideoReel(destination)}
                      className="absolute bottom-3 right-3 z-20 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xl border border-emerald-500"
                    >
                      <Film className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Open Reel Player</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center text-white/70 p-6 space-y-2">
                  <Play className="w-8 h-8 text-stone-500 mx-auto" />
                  <p className="text-xs">Authentic video reel loading...</p>
                </div>
              )}
            </div>
          )}

          {/* Media Switcher Tabs in Top-Left of media hero */}
          <div className="absolute top-4 left-4 z-20 flex items-center p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 text-white text-xs shadow-lg">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeMediaTab === 'photos'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Real Photos ({images.length})</span>
            </button>
            {destination.shortVideo && (
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeMediaTab === 'video'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current text-rose-600" />
                <span>4K Video Tour</span>
              </button>
            )}
          </div>
        </div>

        {/* Photo Gallery Thumbnails Bar */}
        {activeMediaTab === 'photos' && images.length > 1 && (
          <div className="px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar bg-stone-50 border-b border-stone-200">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                  selectedPhotoIndex === idx
                    ? 'border-emerald-600 ring-2 ring-emerald-400 shadow-sm'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
                title={img.caption_en}
              >
                <img
                  src={img.url}
                  alt={img.caption_en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-medium text-center py-0.5 truncate px-1">
                  Photo {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                  {destination.division} {language === 'bn' ? 'বিভাগ' : 'Division'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{language === 'bn' ? destination.district_bn : destination.district_en}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-stone-700">{destination.category}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                ৳{destination.budget_min_bdt.toLocaleString()} – ৳{destination.budget_max_bdt.toLocaleString()} BDT
              </span>
            </div>

            <h1 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {language === 'bn' ? destination.name_bn : destination.name_en}
            </h1>
            <p className="text-stone-500 text-sm mt-0.5 font-medium">
              {language === 'bn' ? destination.name_en : destination.name_bn}
            </p>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-y border-stone-100 py-3">
            <button
              onClick={() => toggleSaveDestination(destination.id)}
              className={`flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isSaved
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? t.destination.saved : t.destination.savePlace}</span>
            </button>

            <button
              onClick={() => setShowTripPicker(!showTripPicker)}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-[#267A5C] hover:bg-[#1f634b] text-white flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>{t.destination.addToTrip}</span>
            </button>

            {destination.shortVideo && onOpenVideoReel && (
              <button
                onClick={() => onOpenVideoReel(destination)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Play className="w-4 h-4 fill-current text-emerald-400" />
                <span>Reel</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
              aria-label="Share place"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center transition-colors"
              aria-label="Open in Google Maps"
              title="Open coordinates in Google Maps"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Trip Picker Dropdown */}
          {showTripPicker && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  Select an itinerary to add this destination:
                </span>
                <button
                  onClick={() => setShowTripPicker(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              {trips.length > 0 ? (
                <div className="space-y-1.5">
                  {trips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => {
                        addDestinationToTrip(trip.id, destination.id);
                        setShowTripPicker(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-100 text-xs font-semibold text-stone-800 flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <span className="truncate">{trip.title}</span>
                      <span className="text-[11px] font-mono text-emerald-800">
                        {trip.days.length} Days · + Add
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-stone-600">No active itineraries created yet.</p>
                  <button
                    onClick={() => {
                      createTrip({
                        title: `${destination.name_en} Expedition`,
                        destinationIds: [destination.id],
                        startDate: '2026-11-20',
                        endDate: '2026-11-22',
                        groupSize: 2,
                        travelStyle: 'explorer',
                        days: [
                          {
                            dayNumber: 1,
                            title_en: `Arrival & Explore ${destination.name_en}`,
                            title_bn: `${destination.name_bn} ভ্রমণ`,
                            stops: [
                              {
                                id: 'stop-auto-1',
                                destinationId: destination.id,
                                title_en: destination.name_en,
                                title_bn: destination.name_bn,
                                estimatedCostBDT: destination.budget_min_bdt,
                              },
                            ],
                          },
                        ],
                        budget: {
                          transportBDT: 1500,
                          lodgingBDT: 2500,
                          foodBDT: 1200,
                          activitiesBDT: 800,
                          totalBDT: 6000,
                        },
                        isOfflineDownloaded: true,
                      });
                      setShowTripPicker(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold"
                  >
                    Create New Trip for this spot
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Live Weather & Safe Travel Card */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-500" />
                <h2 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {language === 'bn' ? 'লাইভ আবহাওয়া ও নিরাপত্তা সতর্কতা' : 'Live Weather & Safe Travel Advisory'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {liveWeather && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    liveWeather.safetyStatus === 'caution'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : liveWeather.safetyStatus === 'advisory'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    ● {language === 'bn' ? liveWeather.safetyTitle_bn : liveWeather.safetyTitle_en}
                  </span>
                )}
                <button
                  onClick={() => setIsWeatherModalOpen(true)}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline"
                >
                  {language === 'bn' ? 'সকল বিভাগ' : 'All Divisions'}
                </button>
              </div>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-2xs">
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{language === 'bn' ? 'তাপমাত্রা' : 'Temp'}</span>
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5">
                  {liveWeather ? `${liveWeather.temperatureC}°C` : '28°C'}
                </div>
                <div className="text-[10px] text-stone-400">
                  {language === 'bn' ? 'অনুভূত:' : 'Feels:'} {liveWeather?.apparentTemperatureC ?? 30}°C
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-2xs">
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{language === 'bn' ? 'আবহাওয়া' : 'Sky'}</span>
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-xs font-bold text-stone-900 mt-1 truncate">
                  {liveWeather ? (language === 'bn' ? liveWeather.condition_bn : liveWeather.condition_en) : 'Clear Sky'}
                </div>
                <div className="text-[10px] text-emerald-700">Real-time BMD</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-2xs">
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{language === 'bn' ? 'বাতাস' : 'Wind'}</span>
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5">
                  {liveWeather ? `${liveWeather.windSpeedKmH} km/h` : '14 km/h'}
                </div>
                <div className="text-[10px] text-stone-400">
                  {liveWeather && liveWeather.windSpeedKmH > 35 ? 'Gusty' : 'Gentle breeze'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-stone-200/60 shadow-2xs">
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>{language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5">
                  {liveWeather ? `${liveWeather.humidityPercent}%` : '68%'}
                </div>
                <div className="text-[10px] text-stone-400">Keep water bottle</div>
              </div>
            </div>

            {/* Safety Advice Box with AI Consultation Button */}
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-emerald-900 mr-1">
                  🛡️ {language === 'bn' ? 'ভ্রমণ নিরাপত্তা পরামর্শ:' : 'Safety Guidance:'}
                </span>
                <span>
                  {liveWeather
                    ? language === 'bn'
                      ? liveWeather.safetyAdvisory_bn
                      : liveWeather.safetyAdvisory_en
                    : 'Check local transport timing, carry rain gear in wet months, and follow local ranger instructions.'}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  openAiChatWithPrompt(
                    language === 'bn'
                      ? `${destination.name_bn} ভ্রমণের বর্তমান আবহাওয়া ও নিরাপত্তা সংক্রান্ত জরুরি পরামর্শ দিন`
                      : `What are the current safe travel conditions, road access, and weather tips for ${destination.name_en}?`
                  );
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#173B2E] hover:bg-[#235845] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{language === 'bn' ? 'এআই গাইডকে জিজ্ঞাসা' : 'Ask AI Guide'}</span>
              </button>
            </div>
          </div>

          {/* Highlights Checklist */}
          {destination.highlights_en && destination.highlights_en.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{t.destination.highlights}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(language === 'bn' ? destination.highlights_bn : destination.highlights_en).map((h, i) => (
                  <div 
                    key={i}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-800 flex items-start gap-2"
                  >
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {t.destination.about}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
              {language === 'bn' ? destination.full_description_bn : destination.full_description_en}
            </p>
          </div>

          {/* Practical Travel Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Timings & Season */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>{t.destination.bestSeason}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {language === 'bn' ? destination.best_season_bn : destination.best_season_en}
              </p>
              <div className="pt-1 flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{t.destination.estimatedDuration}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {language === 'bn' ? destination.estimated_duration_bn : destination.estimated_duration_en}
              </p>
            </div>

            {/* Entry Fees & Hours */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>{t.destination.entryFee}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {language === 'bn' ? destination.entry_fee_bn : destination.entry_fee_en}
              </p>
              <div className="pt-1 flex items-center gap-2 text-stone-900 font-bold text-xs">
                <Info className="w-4 h-4 text-stone-700" />
                <span>{t.destination.openingHours}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">
                {language === 'bn' ? destination.opening_hours_bn : destination.opening_hours_en}
              </p>
            </div>
          </div>

          {/* Transport Routes */}
          {destination.transport_options_en && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-emerald-800" />
                <span>{t.destination.howToReach}</span>
              </h2>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {(language === 'bn' ? destination.transport_options_bn : destination.transport_options_en).map((opt, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2">
                    <span className="font-mono text-emerald-800 font-bold shrink-0">{i + 1}.</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Interactive Google Map Location Card */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>{language === 'bn' ? 'গুগল ম্যাপে ভৌগোলিক অবস্থান' : 'Live Google Map Location'}</span>
              </h2>
              <span className="font-mono text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                {destination.latitude.toFixed(4)}°N, {destination.longitude.toFixed(4)}°E
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs relative">
              <iframe
                title={`Google Map - ${destination.name_en}`}
                src={`https://maps.google.com/maps?q=${destination.latitude},${destination.longitude}&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-56 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Bottom directions action bar */}
              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 text-xs">
                <span className="text-[11px] text-stone-600 truncate">
                  {destination.district_en}, {destination.division} Division
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <span>Full Map</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Tips */}
          {destination.travel_tips_en && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>{t.destination.travelTips}</span>
              </h2>
              <div className="space-y-1.5 text-xs text-stone-700">
                {(language === 'bn' ? destination.travel_tips_bn : destination.travel_tips_en).map((tip, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Advisories */}
          {destination.safety_notes_en && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{t.destination.safety}</span>
              </h2>
              <div className="space-y-1.5 text-xs text-rose-950">
                {(language === 'bn' ? destination.safety_notes_bn : destination.safety_notes_en).map((safety, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                    <span>{safety}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Destinations in the same Division */}
          {nearbyDestinations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {language === 'bn' ? 'কাছের অন্যান্য স্থান' : `Other Spots in ${destination.division}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearbyDestinations.map((nearby) => (
                  <div
                    key={nearby.id}
                    onClick={() => {
                      setSelectedDestination(nearby);
                      setSelectedPhotoIndex(0);
                      setActiveMediaTab('photos');
                    }}
                    className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {language === 'bn' ? nearby.name_bn : nearby.name_en}
                      </p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {nearby.category} · ৳{nearby.budget_min_bdt.toLocaleString()} BDT
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Source Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>{t.destination.officialSource}: {destination.source_name}</span>
            </div>
            <div>
              <span>{destination.last_verified_at}</span>
            </div>
          </div>
        </div>

        {/* Full-Screen Lightbox View for Photos */}
        {lightboxOpen && currentPhoto && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 animate-fadeIn">
            <div className="w-full flex items-center justify-between text-white pb-2">
              <span className="text-xs font-mono">
                Photo {selectedPhotoIndex + 1} of {images.length}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-w-4xl max-h-[75vh] flex items-center justify-center">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption_en}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="text-center text-white/90 space-y-1 max-w-2xl px-4 py-2">
              <p className="text-sm font-semibold">
                {language === 'bn' ? currentPhoto.caption_bn : currentPhoto.caption_en}
              </p>
              {currentPhoto.authorCredit && (
                <p className="text-xs text-white/60 font-mono">
                  Credit: © {currentPhoto.authorCredit}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
