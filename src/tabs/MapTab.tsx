import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS, DIVISIONS } from '../data/destinations';
import { Destination } from '../types';
import { DestinationVisual } from '../components/DestinationVisual';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherService';
import {
  MapPin,
  Navigation,
  List,
  Compass,
  ArrowRight,
  ExternalLink,
  LocateFixed,
  Layers,
  Info,
  Search,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Clock,
  Banknote,
  CloudSun,
  ShieldCheck,
  Check,
  Maximize2
} from 'lucide-react';

export const MapTab: React.FC = () => {
  const { language, t } = useLanguage();
  const { setSelectedDestination, isDestinationSaved, toggleSaveDestination, showToast } = useApp();

  const [selectedPinId, setSelectedPinId] = useState<string>('sreemangal-tea-gardens');
  const [activeDivision, setActiveDivision] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'grid' | 'list'>('roadmap');
  const [userLocationSimulated, setUserLocationSimulated] = useState<boolean>(true);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(13);

  // User reference coordinate (Dhaka Zero Point / GPO)
  const userLat = 23.8103;
  const userLng = 90.4125;

  const calculateDistanceKm = (lat: number, lng: number) => {
    // Haversine formula
    const R = 6371;
    const dLat = ((lat - userLat) * Math.PI) / 180;
    const dLng = ((lng - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const getEstimatedTravelTime = (distanceKm: number) => {
    if (distanceKm < 30) return language === 'bn' ? '১-২ ঘণ্টা (লোকাল/মেট্রো)' : '1-2 hrs (Local)';
    if (distanceKm < 150) return language === 'bn' ? '৩-৪ ঘণ্টা (হাইওয়ে)' : '3-4 hrs (Highway)';
    if (distanceKm < 300) return language === 'bn' ? '৫-৭ ঘণ্টা (ট্রেন/বাস)' : '5-7 hrs (Train/Bus)';
    if (distanceKm < 450) return language === 'bn' ? '৮-১০ ঘণ্টা (বাস/নৌকা)' : '8-10 hrs (Bus/Launch)';
    return language === 'bn' ? '১০-১২+ ঘণ্টা (দূরপাল্লা)' : '10-12+ hrs (Long Distance)';
  };

  const filteredPins = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const matchesDivision = activeDivision === 'All' || d.division === activeDivision;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name_en.toLowerCase().includes(q) ||
        d.name_bn.toLowerCase().includes(q) ||
        d.district_en.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q);
      return matchesDivision && matchesSearch;
    });
  }, [activeDivision, searchQuery]);

  const selectedDestination = useMemo(() => {
    return DESTINATIONS.find((d) => d.id === selectedPinId) || filteredPins[0] || DESTINATIONS[0];
  }, [selectedPinId, filteredPins]);

  // Fetch live weather when selected destination changes
  useEffect(() => {
    if (!selectedDestination) return;
    let isMounted = true;
    setWeatherLoading(true);

    fetchLiveWeather(
      selectedDestination.id,
      selectedDestination.latitude,
      selectedDestination.longitude
    )
      .then((data) => {
        if (isMounted) {
          setLiveWeather(data);
          setWeatherLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Weather fetch warning in MapTab:', err);
        if (isMounted) setWeatherLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDestination?.id]);

  // SVG coordinate projection fallback for overview grid
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 20.4;
    const maxLat = 26.6;
    const minLng = 88.0;
    const maxLng = 92.7;
    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 780 + 60;
    return { x, y };
  };

  // Google Maps Embed URL generator
  const getGoogleMapsEmbedUrl = (dest: Destination, type: 'roadmap' | 'satellite') => {
    // t=m for roadmap, t=k for satellite imagery
    const mapMode = type === 'satellite' ? 'k' : 'm';
    return `https://maps.google.com/maps?q=${dest.latitude},${dest.longitude}&t=${mapMode}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  };

  // Google Maps Directions link
  const getGoogleMapsDirectionsUrl = (dest: Destination) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${dest.latitude},${dest.longitude}&travelmode=driving`;
  };

  const isSaved = isDestinationSaved(selectedDestination.id);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Title & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#173B2E]">
              <Compass className="w-5 h-5 text-[#267A5C]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {language === 'bn' ? 'বাংলাদেশ ইন্টারেক্টিভ গুগল ম্যাপ' : 'Interactive Google Map & Exploration'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            {language === 'bn'
              ? 'সরাসরি গুগল ম্যাপের মাধ্যমে পর্যটন কেন্দ্রসমূহ দেখুন, দূরত্ব পরিমাপ করুন ও রুট নির্ধারণ করুন।'
              : 'Direct Google Maps integration for exploring Bangladesh heritage sites, coordinates, and driving routes.'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location status toggle */}
          <button
            onClick={() => {
              setUserLocationSimulated(!userLocationSimulated);
              showToast(userLocationSimulated ? 'Location reference hidden' : 'Location reference set to Dhaka (GPO) ✓');
            }}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              userLocationSimulated
                ? 'bg-[#173B2E] text-white border-[#173B2E] shadow-2xs'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
            }`}
            title="Calculate distance from Dhaka"
          >
            <LocateFixed className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'ঢাকা কেন্দ্রবিন্দু' : 'Dhaka Origin'}</span>
          </button>

          {/* Map style segment buttons */}
          <div className="flex items-center p-1 bg-stone-200/80 rounded-xl border border-stone-300/60 shadow-2xs">
            <button
              onClick={() => setMapType('roadmap')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-white text-[#173B2E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Google Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-white text-[#173B2E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('grid')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'grid'
                  ? 'bg-white text-[#173B2E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setMapType('list')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'list'
                  ? 'bg-white text-[#173B2E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5 inline mr-1" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Search & Division Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'স্থান বা জেলা খুঁজুন (উদাঃ কক্সবাজার, সাজেক)...' : 'Search map (e.g. Cox\'s Bazar, Sajek)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Division Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 no-scrollbar text-xs">
          {DIVISIONS.map((div) => {
            const count = div === 'All' ? DESTINATIONS.length : DESTINATIONS.filter((d) => d.division === div).length;
            const isSelected = activeDivision === div;
            return (
              <button
                key={div}
                onClick={() => setActiveDivision(div)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#173B2E] text-white border-[#173B2E] shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
                }`}
              >
                <span>{div === 'All' ? (language === 'bn' ? 'সকল বিভাগ' : 'All Divisions') : div}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Presentation */}
      {mapType !== 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAP CANVAS (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-stone-300 shadow-sm">
              {/* Map Controls Overlay Bar */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-md text-xs font-bold text-stone-800 flex items-center gap-2 pointer-events-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="truncate max-w-[200px]">
                    {language === 'bn' ? selectedDestination.name_bn : selectedDestination.name_en}
                  </span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    {selectedDestination.latitude.toFixed(4)}, {selectedDestination.longitude.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  {/* Zoom controls for direct embed */}
                  <div className="bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md flex items-center overflow-hidden">
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
                      className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-100"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono px-1 text-stone-400">{zoomLevel}</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(z - 1, 6))}
                      className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-100"
                      title="Zoom Out"
                    >
                      −
                    </button>
                  </div>

                  <a
                    href={getGoogleMapsDirectionsUrl(selectedDestination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white/95 hover:bg-white text-emerald-800 border border-stone-200 shadow-md transition-colors"
                    title="Open Directions in Google Maps"
                  >
                    <Navigation className="w-4 h-4 text-emerald-700" />
                  </a>
                </div>
              </div>

              {/* MAP DISPLAY: Direct Google Maps Iframe Embed or Grid View */}
              {mapType === 'roadmap' || mapType === 'satellite' ? (
                <div className="relative w-full h-[540px] sm:h-[620px] bg-stone-100">
                  <iframe
                    title={`Google Map - ${selectedDestination.name_en}`}
                    src={getGoogleMapsEmbedUrl(selectedDestination, mapType)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                /* Staged SVG Overview Grid */
                <div className="relative aspect-[4/5] sm:aspect-[1/1] w-full max-h-[620px] p-6 bg-gradient-to-b from-[#1b332b] via-[#173B2E] to-[#0f241c] flex items-center justify-center">
                  <svg
                    viewBox="0 0 800 900"
                    className="w-full h-full select-none"
                    style={{ filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.5))' }}
                  >
                    {/* Simplified Bangladesh Outline */}
                    <path
                      d="M260,110 Q320,80 390,90 T480,120 Q530,130 580,180 Q640,240 670,300 T720,420 Q740,510 730,620 Q700,740 680,820 Q650,860 630,830 Q620,770 600,720 T540,680 Q480,700 450,740 T400,790 Q340,790 320,740 Q280,700 240,680 T180,630 Q150,560 170,480 Q190,410 200,340 T220,240 Q220,180 260,110 Z"
                      fill="#204d3c"
                      stroke="#2d6a53"
                      strokeWidth="2.5"
                    />

                    {/* Rivers */}
                    <path
                      d="M330,120 Q340,260 370,380 Q390,450 440,510 T490,620 L530,730"
                      fill="none"
                      stroke="#173547"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M200,350 Q280,420 380,450 Q480,470 550,530"
                      fill="none"
                      stroke="#173547"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Divisions */}
                    <text x="390" y="470" fill="#a7f3d0" fontSize="18" fontWeight="bold" opacity="0.6">Dhaka</text>
                    <text x="590" y="580" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Chattogram</text>
                    <text x="520" y="270" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Sylhet</text>
                    <text x="240" y="380" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Rajshahi</text>
                    <text x="270" y="600" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Khulna</text>
                    <text x="370" y="680" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Barishal</text>
                    <text x="280" y="200" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Rangpur</text>
                    <text x="410" y="320" fill="#a7f3d0" fontSize="16" fontWeight="bold" opacity="0.6">Mymensingh</text>

                    {/* Pins */}
                    {filteredPins.map((dest) => {
                      const pos = projectCoords(dest.latitude, dest.longitude);
                      const isSelected = dest.id === selectedPinId;
                      return (
                        <g
                          key={dest.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedPinId(dest.id)}
                        >
                          {isSelected && (
                            <circle cx={pos.x} cy={pos.y} r="20" fill="#10b981" opacity="0.4" className="animate-pulse" />
                          )}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isSelected ? '12' : '8'}
                            fill={isSelected ? '#10b981' : '#34d399'}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          <text
                            x={pos.x + 14}
                            y={pos.y + 4}
                            fill={isSelected ? '#ffffff' : '#d1fae5'}
                            fontSize={isSelected ? '14' : '11'}
                            fontWeight={isSelected ? 'bold' : 'normal'}
                          >
                            {dest.name_en.split('&')[0].trim()}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Quick Jump Pin Strip */}
              <div className="p-3 bg-stone-900 border-t border-stone-800 overflow-x-auto no-scrollbar flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 pl-1">
                  {language === 'bn' ? 'দ্রুত স্থান নির্বাচন:' : 'Quick Jump:'}
                </span>
                {filteredPins.map((dest) => {
                  const isSelected = dest.id === selectedPinId;
                  return (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedPinId(dest.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-300" />
                      <span>{language === 'bn' ? dest.name_bn : dest.name_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DESTINATION INTEL DRAWER (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
              {/* Header tags */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  {selectedDestination.division} Division · {selectedDestination.district_en}
                </span>

                {userLocationSimulated && (
                  <span className="font-mono text-emerald-900 font-bold bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-700" />
                    <span>~{calculateDistanceKm(selectedDestination.latitude, selectedDestination.longitude)} km from Dhaka</span>
                  </span>
                )}
              </div>

              {/* Visual Thumbnail */}
              <div
                onClick={() => setSelectedDestination(selectedDestination)}
                className="cursor-pointer group overflow-hidden rounded-2xl border border-stone-200 relative shadow-2xs"
              >
                <DestinationVisual destination={selectedDestination} aspect="card" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white drop-shadow">
                      {language === 'bn' ? selectedDestination.name_bn : selectedDestination.name_en}
                    </h2>
                    <p className="text-xs text-emerald-200 font-medium">
                      {selectedDestination.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Weather & Status Bar */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">
                      {weatherLoading ? (
                        'Fetching live weather...'
                      ) : liveWeather ? (
                        `${liveWeather.temperatureC}°C · ${language === 'bn' ? liveWeather.condition_bn : liveWeather.condition_en}`
                      ) : (
                        'Weather Available'
                      )}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {liveWeather ? (
                        <span className="font-semibold text-emerald-800">
                          ● {language === 'bn' ? liveWeather.safetyTitle_bn : liveWeather.safetyTitle_en}
                        </span>
                      ) : (
                        'Safe travel condition'
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-900 text-xs">
                    ৳{selectedDestination.budget_min_bdt.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-stone-500">Avg / Day</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'bn'
                  ? selectedDestination.short_description_bn
                  : selectedDestination.short_description_en}
              </p>

              {/* Travel Time & Road Intel */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Est. Travel Time
                  </span>
                  <p className="font-bold text-stone-800 text-xs">
                    {getEstimatedTravelTime(calculateDistanceKm(selectedDestination.latitude, selectedDestination.longitude))}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    GPS Coordinates
                  </span>
                  <p className="font-mono font-bold text-stone-800 text-xs">
                    {selectedDestination.latitude.toFixed(3)}°N, {selectedDestination.longitude.toFixed(3)}°E
                  </p>
                </div>
              </div>

              {/* Primary Actions Cluster */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => setSelectedDestination(selectedDestination)}
                  className="w-full py-3 rounded-xl bg-[#173B2E] hover:bg-[#267A5C] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'সম্পূর্ণ ভ্রমণ বিবরণ দেখুন' : 'Explore Full Guide & Tips'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedDestination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>

                  <button
                    onClick={() => {
                      toggleSaveDestination(selectedDestination.id);
                      showToast(isSaved ? 'Removed from saved trips' : 'Saved to your destinations ✓');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-stone-500" />
                        <span>Save Spot</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST FORMAT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPins.map((dest) => {
            const distance = calculateDistanceKm(dest.latitude, dest.longitude);
            return (
              <div
                key={dest.id}
                onClick={() => {
                  setSelectedPinId(dest.id);
                  setMapType('roadmap');
                }}
                className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {dest.division}
                    </span>
                    <h3 className="text-sm font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors mt-1">
                      {language === 'bn' ? dest.name_bn : dest.name_en}
                    </h3>
                    <p className="text-xs text-stone-500">{dest.district_en} District</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-lg">
                    ~{distance} km
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {language === 'bn' ? dest.short_description_bn : dest.short_description_en}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>View on Google Map →</span>
                  <span className="font-mono text-stone-800">৳{dest.budget_min_bdt.toLocaleString()} BDT</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
