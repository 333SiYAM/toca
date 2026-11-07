import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS } from '../data/destinations';
import { DestinationVisual } from '../components/DestinationVisual';
import {
  Bookmark,
  Compass,
  Trash2,
  CalendarPlus,
  ArrowRight,
  HardDriveDownload,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SavedTab: React.FC = () => {
  const { language, t } = useLanguage();
  const { 
    savedDestinationIds, 
    toggleSaveDestination, 
    setSelectedDestination, 
    setActiveTab,
    showToast 
  } = useApp();

  const savedDestinations = useMemo(() => {
    return DESTINATIONS.filter((d) => savedDestinationIds.includes(d.id));
  }, [savedDestinationIds]);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.saved.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            {t.saved.subtitle}
          </p>
        </div>

        {savedDestinations.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>{savedDestinations.length} Cached Offline</span>
            </span>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {savedDestinations.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
          <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-900">{t.saved.noSavedTitle}</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            {t.saved.noSavedDesc}
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#267A5C] text-white font-semibold text-xs sm:text-sm hover:bg-[#1d6349] transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span>{t.saved.exploreBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {savedDestinations.map((destination) => (
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
                  className="absolute top-3 right-3 z-10 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full bg-rose-900/60 hover:bg-rose-900 text-white backdrop-blur-md transition-colors"
                  aria-label="Remove bookmark"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
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
                  <span className="font-mono text-emerald-800 font-semibold">
                    ৳{destination.budget_min_bdt.toLocaleString()} – ৳{destination.budget_max_bdt.toLocaleString()}
                  </span>
                  <span className="text-stone-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {language === 'bn' ? destination.estimated_duration_bn : destination.estimated_duration_en}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
