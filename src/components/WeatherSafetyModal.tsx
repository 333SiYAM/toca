import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS, DIVISIONS } from '../data/destinations';
import { fetchLiveWeather, LiveWeatherData } from '../services/weatherService';
import { Destination } from '../types';
import {
  X,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  ShieldCheck,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Calendar,
  Sparkles,
  PhoneCall,
  RefreshCw,
  Info,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const WeatherSafetyModal: React.FC = () => {
  const { language } = useLanguage();
  const { isWeatherModalOpen, setIsWeatherModalOpen, openAiChatWithPrompt, setSelectedDestination } = useApp();

  const [selectedDestId, setSelectedDestId] = useState<string>(DESTINATIONS[0].id);
  const [weatherMap, setWeatherMap] = useState<Record<string, LiveWeatherData>>({});
  const [loading, setLoading] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>('All');

  const currentDestination = DESTINATIONS.find((d) => d.id === selectedDestId) || DESTINATIONS[0];
  const currentWeather = weatherMap[selectedDestId];

  // Load weather for selected destination and key regional spots
  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const results: Record<string, LiveWeatherData> = {};
      
      // Load current selected destination first
      const current = await fetchLiveWeather(
        currentDestination.id,
        currentDestination.latitude,
        currentDestination.longitude
      );
      results[currentDestination.id] = current;

      // Also load a representative destination for each division
      const representativeDests = DESTINATIONS.slice(0, 8);
      await Promise.all(
        representativeDests.map(async (d) => {
          if (!results[d.id]) {
            const data = await fetchLiveWeather(d.id, d.latitude, d.longitude);
            results[d.id] = data;
          }
        })
      );

      setWeatherMap((prev) => ({ ...prev, ...results }));
    } catch (err) {
      console.error('Failed to load weather in modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWeatherModalOpen) {
      loadWeatherData();
    }
  }, [isWeatherModalOpen, selectedDestId]);

  if (!isWeatherModalOpen) return null;

  const renderWeatherIcon = (iconType?: LiveWeatherData['iconType'], className = 'w-5 h-5') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'cloud':
        return <Cloud className={`${className} text-stone-500`} />;
      case 'cloud-rain':
      case 'rain':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-rose-500`} />;
      default:
        return <CloudSun className={`${className} text-amber-500`} />;
    }
  };

  const getSafetyBadge = (status?: LiveWeatherData['safetyStatus']) => {
    if (status === 'caution') {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        text: language === 'bn' ? 'সতর্কতা: প্রতিকূল আবহাওয়া' : 'Caution: High Risk',
      };
    }
    if (status === 'advisory') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        text: language === 'bn' ? 'পরামর্শ: প্রস্তুতি রাখুন' : 'Advisory: Rain/Wind',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      text: language === 'bn' ? 'ভ্রমণের জন্য নিরাপদ' : 'Safe for Exploration',
    };
  };

  const currentSafetyBadge = getSafetyBadge(currentWeather?.safetyStatus);

  const filteredDestinations = filterDivision === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter((d) => d.division === filterDivision);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#FDFBF7] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 text-stone-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weather-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#173B2E] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 flex items-center justify-center border border-emerald-700/60 shadow-inner">
              <CloudSun className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 id="weather-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
                {language === 'bn' ? 'লাইভ আবহাওয়া ও নিরাপদ ভ্রমণ সতর্কতা' : 'Live Weather & Safe Travel Conditions'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {language === 'bn'
                  ? 'বাংলাদেশের সকল বিভাগের রিয়েল-টাইম পূর্বাভাস ও নিরাপত্তা গাইড'
                  : 'Real-time forecast & meteorological safety assessment across Bangladesh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadWeatherData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-xs flex items-center gap-1.5"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsWeatherModalOpen(false)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Active Featured Location Weather Hero */}
          <section className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {currentDestination.division} Division
                  </span>
                  <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${currentSafetyBadge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${currentSafetyBadge.dot} animate-pulse`} />
                    <span>{currentSafetyBadge.text}</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {language === 'bn' ? currentDestination.name_bn : currentDestination.name_en}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {language === 'bn' ? currentDestination.district_bn : currentDestination.district_en}, Bangladesh (Lat {currentDestination.latitude.toFixed(2)}, Lon {currentDestination.longitude.toFixed(2)})
                  </span>
                </p>
              </div>

              {/* Quick AI query for this location */}
              <button
                onClick={() => {
                  setIsWeatherModalOpen(false);
                  openAiChatWithPrompt(
                    language === 'bn'
                      ? `${currentDestination.name_bn} ভ্রমণের বর্তমান আবহাওয়া ও সতর্কতা কি?`
                      : `What are the current weather and safety tips for traveling to ${currentDestination.name_en}?`
                  );
                }}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#173B2E] hover:bg-[#204e3e] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {language === 'bn' ? 'এআই কে জিজ্ঞাসা করুন' : 'Ask AI About This Spot'}
                </span>
              </button>
            </div>

            {/* Current Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3.5 border border-stone-200/70 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                  <span>{language === 'bn' ? 'তাপমাত্রা' : 'Temperature'}</span>
                  <Thermometer className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {currentWeather ? `${currentWeather.temperatureC}°` : '28°'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">C</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {language === 'bn' ? 'অনুভূত:' : 'Feels like'} {currentWeather?.apparentTemperatureC ?? 30}°C
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3.5 border border-stone-200/70 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                  <span>{language === 'bn' ? 'আবহাওয়া' : 'Condition'}</span>
                  {renderWeatherIcon(currentWeather?.iconType)}
                </div>
                <div className="text-base sm:text-lg font-bold text-stone-900 truncate">
                  {currentWeather
                    ? language === 'bn'
                      ? currentWeather.condition_bn
                      : currentWeather.condition_en
                    : 'Clear Sky'}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  {language === 'bn' ? 'লাইভ আপডেট' : 'Live from BMD/Meteo'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3.5 border border-stone-200/70 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                  <span>{language === 'bn' ? 'বাতাসের গতি' : 'Wind Speed'}</span>
                  <Wind className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {currentWeather ? currentWeather.windSpeedKmH : '14'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">km/h</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {currentWeather && currentWeather.windSpeedKmH > 35 ? 'Moderate gusts' : 'Calm breeze'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3.5 border border-stone-200/70 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                  <span>{language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}</span>
                  <Droplets className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {currentWeather ? `${currentWeather.humidityPercent}%` : '68%'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {language === 'bn' ? 'পর্যাপ্ত পানি পান করুন' : 'Stay hydrated'}
                </p>
              </div>
            </div>

            {/* Safety Guidance Box */}
            <div className="mt-4 p-4 rounded-xl bg-emerald-950 text-white flex items-start gap-3 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-emerald-200 text-sm">
                  {currentWeather
                    ? language === 'bn'
                      ? currentWeather.safetyTitle_bn
                      : currentWeather.safetyTitle_en
                    : 'Safe Travel Guidelines'}
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  {currentWeather
                    ? language === 'bn'
                      ? currentWeather.safetyAdvisory_bn
                      : currentWeather.safetyAdvisory_en
                    : 'Weather is favorable. Carry an umbrella, refill mineral water, and respect local park conservation rules.'}
                </p>
              </div>
            </div>

            {/* 3-Day Forecast Strip */}
            {currentWeather?.dailyForecast && currentWeather.dailyForecast.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{language === 'bn' ? 'আগামী ৩ দিনের পূর্বাভাস' : '3-Day Outlook'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {currentWeather.dailyForecast.map((fc, idx) => (
                    <div key={idx} className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60 text-center">
                      <div className="text-xs font-semibold text-stone-700">
                        {language === 'bn' ? fc.dayName_bn : fc.dayName_en}
                      </div>
                      <div className="my-1 flex justify-center">
                        {renderWeatherIcon(fc.weatherCode >= 50 ? 'cloud-rain' : 'sun', 'w-4 h-4')}
                      </div>
                      <div className="text-xs font-bold text-stone-900">
                        {fc.maxTempC}° <span className="text-stone-400 font-normal">/ {fc.minTempC}°</span>
                      </div>
                      <div className="text-[10px] text-sky-600 mt-0.5">
                        🌧️ {fc.precipitationProbability}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Destination Selector Tabs */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-stone-900">
                {language === 'bn' ? 'স্থান নির্বাচন করে আবহাওয়া দেখুন' : 'Select Destination for Microclimate Weather'}
              </h4>

              {/* Division filter pill */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setFilterDivision('All')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    filterDivision === 'All'
                      ? 'bg-[#173B2E] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                {DIVISIONS.slice(1).map((div) => (
                  <button
                    key={div}
                    onClick={() => setFilterDivision(div)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                      filterDivision === div
                        ? 'bg-[#173B2E] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredDestinations.map((dest) => {
                const isSelected = dest.id === selectedDestId;
                const weather = weatherMap[dest.id];
                return (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDestId(dest.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-900 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${isSelected ? 'text-emerald-300' : 'text-stone-400'}`}>
                        {dest.division}
                      </span>
                      {weather && (
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-stone-700'}`}>
                          {weather.temperatureC}°C
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold truncate">
                      {language === 'bn' ? dest.name_bn : dest.name_en}
                    </div>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {weather ? (language === 'bn' ? weather.condition_bn : weather.condition_en) : 'Check live'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Safe Travel Standards & Emergency Lifeline Grid */}
          <section className="bg-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? 'জরুরি হেল্পলাইন ও জাতীয় নিরাপত্তা বিধি' : 'Emergency Lifelines & Safe Travel Protocols'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 mb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tourist Police Hotline</span>
                </div>
                <a
                  href="tel:01320160000"
                  className="text-xs font-mono font-bold text-emerald-800 hover:underline block"
                >
                  01320-160000 / 01769-690740
                </a>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  24/7 tourist safety support at major destinations
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 mb-1">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                  <span>National Emergency</span>
                </div>
                <a
                  href="tel:999"
                  className="text-xs font-mono font-bold text-rose-800 hover:underline block"
                >
                  Dial 999
                </a>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Instant police, fire service & medical ambulance
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Disaster Early Warning</span>
                </div>
                <a
                  href="tel:1090"
                  className="text-xs font-mono font-bold text-amber-800 hover:underline block"
                >
                  Dial 1090
                </a>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Flood, cyclone, and marine weather alerts
                </p>
              </div>
            </div>

            <div className="text-[11px] text-stone-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
              ⚠️ <strong>Bangladesh Travel Safety Rules:</strong> In Cox&apos;s Bazar, Kuakata, and Saint Martin, do not swim if red flags are hoisted. In Sajek, adhere strictly to the Dighinala Army escort timing (10 AM & 3 PM). On all haor houseboats and river speedboats, certified life jackets are required by maritime law.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
