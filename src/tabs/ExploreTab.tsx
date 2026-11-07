import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS, DIVISIONS, CATEGORIES } from '../data/destinations';
import { Destination } from '../types';
import { DestinationVisual } from '../components/DestinationVisual';
import {
  Search,
  Bookmark,
  CalendarPlus,
  Compass,
  ArrowRight,
  FilterX,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Play,
  Heart,
  Video,
  Image as ImageIcon,
  Flame,
  CloudSun,
  Bot,
  ChevronRight,
} from 'lucide-react';

export const ExploreTab: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    setSelectedDestination,
    isDestinationSaved,
    toggleSaveDestination,
    searchQuery,
    setSearchQuery,
    selectedDivision,
    setSelectedDivision,
    selectedCategory,
    setSelectedCategory,
    setActiveVideoReelDest,
    setIsAiChatOpen,
    openAiChatWithPrompt,
    setIsWeatherModalOpen,
  } = useApp();

  const [onlyVideosFilter, setOnlyVideosFilter] = useState(false);

  const featuredDestination = DESTINATIONS[0]; // Sreemangal tea & rainforest
  const destinationsWithVideos = DESTINATIONS.filter((d) => d.shortVideo);

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      // Videos filter
      if (onlyVideosFilter && !d.shortVideo) {
        return false;
      }
      // Division filter
      if (selectedDivision !== 'All' && d.division !== selectedDivision) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && d.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchEn = d.name_en.toLowerCase().includes(query);
        const matchBn = d.name_bn.toLowerCase().includes(query);
        const matchDistrictEn = d.district_en.toLowerCase().includes(query);
        const matchDistrictBn = d.district_bn.toLowerCase().includes(query);
        const matchDesc = d.short_description_en.toLowerCase().includes(query);
        const matchCategory = d.category.toLowerCase().includes(query);
        return matchEn || matchBn || matchDistrictEn || matchDistrictBn || matchDesc || matchCategory;
      }
      return true;
    });
  }, [selectedDivision, selectedCategory, searchQuery, onlyVideosFilter]);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#173B2E] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>TOCA · {t.appTagline}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t.explore.greeting}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 font-medium">
            {t.explore.subheading}
          </p>

          {/* Search Bar inside Hero */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.explore.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-stone-900 placeholder-stone-400 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 bg-stone-100 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* Live Weather & Safe Travel Conditions Strip */}
      <section className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800/80 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0 mt-0.5">
            <CloudSun className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-200 tracking-wider uppercase">
                {language === 'bn' ? 'লাইভ আবহাওয়া ও নিরাপত্তা' : 'Live Weather & Travel Safety'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'bn' ? 'ভ্রমণ সহায়ক আবহাওয়া' : 'Safe for Exploration'}</span>
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
              {language === 'bn'
                ? 'বাংলাদেশের প্রধান প্রধান পর্যটন অঞ্চলে তাপমাত্রা ২৫°–৩২° সে. এর মধ্যে। পাহাড়ি ও উপকূলীয় নৌযানে নিরাপত্তা বিধি মেনে চলুন।'
                : 'Current temperature across major tourist regions averages 25°C – 31°C. Rivers and hill routes are clear. Safe conditions for sightseeing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => setIsWeatherModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? '৮ বিভাগের আবহাওয়া' : '8-Division Weather'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* TOCA AI Travel Assistant Suggestions Section */}
      <section className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#173B2E] flex items-center justify-center text-amber-300">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
                {language === 'bn' ? 'টোকা এআই ট্রাভেল গাইড — রিয়েল-টাইম পরামর্শ' : 'TOCA Travel AI — Real-time Suggestions'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {language === 'bn'
                  ? 'বাজেট, সঠিক রুট, নিরাপত্তা ও আবহাওয়া জানতে যেকোনো প্রশ্নে ক্লিক করুন'
                  : 'Tap any prompt to get instant verified travel advice & live suggestions'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiChatOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#173B2E] hover:bg-[#204d3c] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'এআই চ্যাট খুলুন' : 'Open AI Chat'}</span>
          </button>
        </div>

        {/* Suggestion Prompt Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() =>
              openAiChatWithPrompt(
                language === 'bn'
                  ? 'সাজেক ভ্যালি ভ্রমণের বর্তমান আবহাওয়া, নিরাপত্তা এবং আর্মি কনভয় সময় কখন?'
                  : 'Is Sajek Valley safe to travel right now and what is the army convoy time?'
              )
            }
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🌄</span>
            <span>{language === 'bn' ? 'সাজেক কনভয় ও নিরাপত্তা' : 'Sajek Convoy & Weather'}</span>
          </button>

          <button
            onClick={() =>
              openAiChatWithPrompt(
                language === 'bn'
                  ? '১০,০০০ টাকার মধ্যে ৩ দিনের শ্রীমঙ্গল ও সিলেট চা বাগান ভ্রমণ পরিকল্পনা দিন'
                  : 'Suggest a 3-day Sreemangal & Sylhet tea garden trip under 10,000 BDT'
              )
            }
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🍵</span>
            <span>{language === 'bn' ? 'শ্রীমঙ্গল বাজেট ট্যুর (১০k)' : 'Sreemangal Budget Trip'}</span>
          </button>

          <button
            onClick={() =>
              openAiChatWithPrompt(
                language === 'bn'
                  ? 'সুন্দরবন ভ্রমণের নৌ-নিরাপত্তা, সশস্ত্র বনরক্ষী নিয়ম ও সেরা সময় কি?'
                  : 'Sundarbans tour: boat safety, armed guards & best season'
              )
            }
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🐅</span>
            <span>{language === 'bn' ? 'সুন্দরবন বোট নিরাপত্তা' : 'Sundarbans Boat Safety'}</span>
          </button>

          <button
            onClick={() =>
              openAiChatWithPrompt(
                language === 'bn'
                  ? 'কক্সবাজার সমুদ্র সৈকত নিরাপত্তা, লাল পতাকা এবং মেরিন ড্রাইভ রুট পরামর্শ দিন'
                  : 'Cox’s Bazar beach safety, red flags and Marine Drive route'
              )
            }
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🌊</span>
            <span>{language === 'bn' ? 'কক্সবাজার সমুদ্র নিরাপত্তা' : 'Cox’s Bazar Beach Flags'}</span>
          </button>

          <button
            onClick={() =>
              openAiChatWithPrompt(
                language === 'bn'
                  ? 'টাঙ্গুয়ার হাওর হাউসবোট ভ্রমণের নিরাপত্তা নিয়ম ও লাইফ জ্যাকেট ব্যবহার'
                  : 'Tanguar Haor houseboat tour safety rules & budget'
              )
            }
            className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🛶</span>
            <span>{language === 'bn' ? 'টাঙ্গুয়ার হাওর হাউসবোট' : 'Tanguar Haor Houseboat'}</span>
          </button>
        </div>
      </section>

      {/* Bangladesh in Motion — Short Travel Video Reels Carousel */}
      {!searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 fill-rose-500" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                Bangladesh in Motion — Short Travel Reels
              </h2>
            </div>
            <button
              onClick={() => setActiveVideoReelDest(destinationsWithVideos[0])}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Watch Reels</span>
              <Play className="w-3 h-3 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {destinationsWithVideos.map((dest) => (
              <div
                key={dest.id}
                onClick={() => setActiveVideoReelDest(dest)}
                className="relative shrink-0 w-44 sm:w-52 h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all border border-stone-200"
              >
                {/* Poster / Thumbnail Image */}
                <img
                  src={dest.shortVideo?.posterUrl || dest.images[0]?.url}
                  alt={dest.name_en}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (dest.shortVideo?.youtubeId) {
                      (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${dest.shortVideo.youtubeId}/hqdefault.jpg`;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-medium border border-white/10">
                  <span>{dest.division}</span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white ring-2 ring-white/50 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white space-y-0.5">
                  <p className="text-xs font-bold truncate drop-shadow">
                    {language === 'bn' ? dest.name_bn : dest.name_en}
                  </p>
                  <p className="text-[10px] text-white/80 truncate">
                    {language === 'bn' ? dest.shortVideo?.title_bn : dest.shortVideo?.title_en}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-300 font-mono">
                    <span>{dest.shortVideo?.durationSec}s reel</span>
                    <span className="flex items-center gap-1 text-white/90">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                      {dest.shortVideo?.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Destination Showcase Card */}
      {!searchQuery && selectedDivision === 'All' && selectedCategory === 'All' && !onlyVideosFilter && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">
              {t.explore.featuredTitle}
            </h2>
            <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase font-mono">
              ★ {t.explore.featuredBadge}
            </span>
          </div>

          <div 
            onClick={() => setSelectedDestination(featuredDestination)}
            className="group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="relative">
              <DestinationVisual destination={featuredDestination} aspect="hero" />
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveDestination(featuredDestination.id);
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                  aria-label="Bookmark destination"
                >
                  <Bookmark
                    className={`w-5 h-5 ${isDestinationSaved(featuredDestination.id) ? 'fill-emerald-400 text-emerald-400' : ''}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                  <span className="text-emerald-800 font-semibold">{featuredDestination.division}</span>
                  <span aria-hidden="true">·</span>
                  <span>{language === 'bn' ? featuredDestination.district_bn : featuredDestination.district_en}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredDestination.category}</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  ৳{featuredDestination.budget_min_bdt.toLocaleString()} – ৳{featuredDestination.budget_max_bdt.toLocaleString()}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                {language === 'bn' ? featuredDestination.name_bn : featuredDestination.name_en}
              </h3>
              <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                {language === 'bn' ? featuredDestination.short_description_bn : featuredDestination.short_description_en}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  {t.explore.exploreGuide} <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {featuredDestination.last_verified_at}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Options Strip: Categories & Media Type */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {t.explore.categoriesHeader}
          </h2>
          {/* Quick toggle for video-only */}
          <button
            onClick={() => setOnlyVideosFilter(!onlyVideosFilter)}
            className={`min-h-[36px] px-3 py-1 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border ${
              onlyVideosFilter
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Short Video Reels</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#173B2E] text-white border-[#173B2E] shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              {cat === 'All' ? 'All Experiences' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Eight Administrative Divisions Selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {t.explore.divisionsHeader}
          </h2>
          {selectedDivision !== 'All' && (
            <button
              onClick={() => setSelectedDivision('All')}
              className="text-xs text-emerald-800 font-semibold hover:underline"
            >
              Show All (8 Divisions)
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DIVISIONS.map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all border ${
                selectedDivision === div
                  ? 'bg-[#267A5C] text-white border-[#267A5C] shadow-sm font-semibold'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              {div === 'All' ? t.explore.allDivisions : `${div} Division`}
            </button>
          ))}
        </div>
      </section>

      {/* Filtered Destinations Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {t.explore.destinationsCount} ({filteredDestinations.length})
          </h2>
          {(selectedDivision !== 'All' || selectedCategory !== 'All' || searchQuery || onlyVideosFilter) && (
            <button
              onClick={() => {
                setSelectedDivision('All');
                setSelectedCategory('All');
                setSearchQuery('');
                setOnlyVideosFilter(false);
              }}
              className="text-xs text-rose-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              {t.explore.clearFilters}
            </button>
          )}
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-stone-200 space-y-3">
            <Compass className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900">{t.explore.noResultsTitle}</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {t.explore.noResultsDesc}
            </p>
            <button
              onClick={() => {
                setSelectedDivision('All');
                setSelectedCategory('All');
                setSearchQuery('');
                setOnlyVideosFilter(false);
              }}
              className="mt-2 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-900 transition-colors"
            >
              {t.explore.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDestinations.map((destination) => {
              const isSaved = isDestinationSaved(destination.id);
              return (
                <div
                  key={destination.id}
                  onClick={() => setSelectedDestination(destination)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-stone-200 hover:border-emerald-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative">
                    <DestinationVisual destination={destination} aspect="card" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveDestination(destination.id);
                      }}
                      className="absolute top-3 right-12 z-20 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full bg-black/45 hover:bg-black/65 text-white backdrop-blur-md transition-colors"
                      aria-label="Save place"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Zero-Pill unboxed metadata */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                        <span className="text-emerald-800 font-semibold">{destination.division}</span>
                        <span aria-hidden="true">·</span>
                        <span>{language === 'bn' ? destination.district_bn : destination.district_en}</span>
                        <span aria-hidden="true">·</span>
                        <span>{destination.category}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors mt-1 line-clamp-1">
                        {language === 'bn' ? destination.name_bn : destination.name_en}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {language === 'bn' ? destination.short_description_bn : destination.short_description_en}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CloudSun className="w-3 h-3 text-amber-500" />
                          <span>Safe Travel</span>
                        </span>
                        <span className="font-mono text-emerald-800 font-semibold text-xs">
                          ৳{destination.budget_min_bdt.toLocaleString()} – ৳{destination.budget_max_bdt.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-stone-500 font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {language === 'bn' ? destination.estimated_duration_bn : destination.estimated_duration_en}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
