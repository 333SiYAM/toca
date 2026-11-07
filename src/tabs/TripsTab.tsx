import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Trip, TripDay, TripStop } from '../types';
import { DESTINATIONS } from '../data/destinations';
import {
  Calendar,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Banknote,
  Users,
  Compass,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  Info,
  Clock,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';

export const TripsTab: React.FC = () => {
  const { language, t } = useLanguage();
  const { 
    trips, 
    activeTripId, 
    setActiveTripId, 
    createTrip, 
    updateTrip, 
    deleteTrip,
    setSelectedDestination,
    showToast 
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState<number | null>(null); // dayNumber or null

  // New Trip Form State
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newGroupSize, setNewGroupSize] = useState(2);
  const [newTravelStyle, setNewTravelStyle] = useState<'budget' | 'comfort' | 'explorer'>('explorer');
  const [newSelectedDestId, setNewSelectedDestId] = useState(DESTINATIONS[0].id);

  // New Stop Form State
  const [stopTitle, setStopTitle] = useState('');
  const [stopTime, setStopTime] = useState('10:00 AM – 12:30 PM');
  const [stopNotes, setStopNotes] = useState('');
  const [stopCostBDT, setStopCostBDT] = useState(500);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleCreateNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a trip title');
      return;
    }

    const initialDest = DESTINATIONS.find((d) => d.id === newSelectedDestId) || DESTINATIONS[0];
    const created = createTrip({
      title: newTitle.trim(),
      destinationIds: [initialDest.id],
      startDate: newStartDate || new Date().toISOString().split('T')[0],
      endDate: newEndDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      groupSize: Number(newGroupSize) || 2,
      travelStyle: newTravelStyle,
      days: [
        {
          dayNumber: 1,
          title_en: `Day 1: Journey to ${initialDest.name_en}`,
          title_bn: `১ম দিন: ${initialDest.name_bn}-এ যাত্রা`,
          stops: [
            {
              id: `stop-${Date.now()}`,
              destinationId: initialDest.id,
              title_en: `Explore ${initialDest.name_en}`,
              title_bn: `${initialDest.name_bn} দর্শন`,
              timeSlot: 'Morning Arrival',
              notes: initialDest.short_description_en,
              estimatedCostBDT: Math.round(initialDest.budget_min_bdt * 0.35),
            },
          ],
        },
      ],
      budget: {
        transportBDT: 3000,
        lodgingBDT: 4000,
        foodBDT: 2500,
        activitiesBDT: Math.round(initialDest.budget_min_bdt * 0.35),
        totalBDT: 9500 + Math.round(initialDest.budget_min_bdt * 0.35),
      },
      isOfflineDownloaded: true,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setActiveTripId(created.id);
  };

  const handleAddStop = (dayNumber: number) => {
    if (!activeTrip || !stopTitle.trim()) return;

    const newStop: TripStop = {
      id: `stop-${Date.now()}`,
      title_en: stopTitle.trim(),
      title_bn: stopTitle.trim(),
      timeSlot: stopTime.trim() || undefined,
      notes: stopNotes.trim() || undefined,
      estimatedCostBDT: Number(stopCostBDT) || 0,
    };

    const updatedDays = activeTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          stops: [...day.stops, newStop],
        };
      }
      return day;
    });

    const newActivities = activeTrip.budget.activitiesBDT + newStop.estimatedCostBDT;
    const newTotal = activeTrip.budget.transportBDT + activeTrip.budget.lodgingBDT + activeTrip.budget.foodBDT + newActivities;

    updateTrip({
      ...activeTrip,
      days: updatedDays,
      budget: {
        ...activeTrip.budget,
        activitiesBDT: newActivities,
        totalBDT: newTotal,
      },
    });

    setShowAddStopModal(null);
    setStopTitle('');
    setStopNotes('');
    setStopCostBDT(500);
  };

  const handleRemoveStop = (dayNumber: number, stopId: string) => {
    if (!activeTrip) return;

    let removedCost = 0;
    const updatedDays = activeTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const found = day.stops.find((s) => s.id === stopId);
        if (found) removedCost = found.estimatedCostBDT;
        return {
          ...day,
          stops: day.stops.filter((s) => s.id !== stopId),
        };
      }
      return day;
    });

    const newActivities = Math.max(0, activeTrip.budget.activitiesBDT - removedCost);
    const newTotal = activeTrip.budget.transportBDT + activeTrip.budget.lodgingBDT + activeTrip.budget.foodBDT + newActivities;

    updateTrip({
      ...activeTrip,
      days: updatedDays,
      budget: {
        ...activeTrip.budget,
        activitiesBDT: newActivities,
        totalBDT: newTotal,
      },
    });
  };

  const handleMoveStop = (dayNumber: number, index: number, direction: 'up' | 'down') => {
    if (!activeTrip) return;

    const updatedDays = activeTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const stops = [...day.stops];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < stops.length) {
          const temp = stops[index];
          stops[index] = stops[targetIndex];
          stops[targetIndex] = temp;
          return { ...day, stops };
        }
      }
      return day;
    });

    updateTrip({
      ...activeTrip,
      days: updatedDays,
    });
  };

  const handleAddDay = () => {
    if (!activeTrip) return;
    const nextDayNum = activeTrip.days.length + 1;
    const newDay: TripDay = {
      dayNumber: nextDayNum,
      title_en: `Day ${nextDayNum}: Local Exploration & Relaxation`,
      title_bn: `${nextDayNum}ম দিন: স্থানীয় দর্শনীয় স্থান ও বিশ্রাম`,
      stops: [],
    };

    // Add estimated 1 day lodging & food
    const extraLodging = 1800;
    const extraFood = 1200;

    updateTrip({
      ...activeTrip,
      days: [...activeTrip.days, newDay],
      budget: {
        ...activeTrip.budget,
        lodgingBDT: activeTrip.budget.lodgingBDT + extraLodging,
        foodBDT: activeTrip.budget.foodBDT + extraFood,
        totalBDT: activeTrip.budget.totalBDT + extraLodging + extraFood,
      },
    });
    showToast(`Added Day ${nextDayNum} to itinerary`);
  };

  const handleBudgetChange = (field: keyof Trip['budget'], value: number) => {
    if (!activeTrip) return;
    const updatedBudget = {
      ...activeTrip.budget,
      [field]: Math.max(0, value),
    };
    updatedBudget.totalBDT =
      updatedBudget.transportBDT +
      updatedBudget.lodgingBDT +
      updatedBudget.foodBDT +
      updatedBudget.activitiesBDT;

    updateTrip({
      ...activeTrip,
      budget: updatedBudget,
    });
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.trips.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            {t.trips.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#267A5C] hover:bg-[#1d6349] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.trips.createNew}</span>
        </button>
      </div>

      {/* Trips Carousel / Selector */}
      {trips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setActiveTripId(trip.id)}
              className={`min-h-[44px] px-4 py-2 text-xs rounded-xl whitespace-nowrap transition-all border flex items-center gap-2 ${
                activeTrip?.id === trip.id
                  ? 'bg-[#173B2E] text-white border-[#173B2E] shadow-sm font-semibold'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <span>{trip.title}</span>
              <span className="opacity-60 text-[10px] font-mono">
                ({trip.days?.length || 0}d · ৳{(trip.budget?.totalBDT || 0).toLocaleString()})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Trip Details View */}
      {activeTrip ? (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <span className="font-semibold text-stone-800">
                  {activeTrip.startDate} – {activeTrip.endDate}
                </span>
                <span aria-hidden="true">·</span>
                <Users className="w-4 h-4 text-emerald-800" />
                <span>
                  {activeTrip.groupSize} {t.trips.people}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize text-stone-800 font-medium">
                  {activeTrip.travelStyle} style
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSummary}
                  className="min-h-[36px] px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 flex items-center gap-1 border border-stone-200"
                  title="Print / Save PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(t.trips.confirmDelete)) {
                      deleteTrip(activeTrip.id);
                    }
                  }}
                  className="min-h-[36px] px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 flex items-center gap-1 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.trips.deleteTrip}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {activeTrip.title}
                </h2>
                {activeTrip.notes && (
                  <p className="text-xs text-stone-500 mt-1 max-w-xl">
                    {activeTrip.notes}
                  </p>
                )}
              </div>

              {/* Total Budget Card */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-right shrink-0">
                <span className="text-[11px] text-emerald-800 font-medium block">
                  {t.trips.totalEstimatedBudget}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#173B2E] font-mono mt-0.5">
                  ৳{activeTrip.budget.totalBDT.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-700 font-mono block">
                  ~৳{Math.round(activeTrip.budget.totalBDT / (activeTrip.groupSize || 1)).toLocaleString()} {t.trips.perPerson}
                </span>
              </div>
            </div>

            {/* Interactive Budget Breakdown Bar */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.trips.budgetBreakdown}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Transport */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">{t.trips.transport}</span>
                  <div className="flex items-center gap-1 mt-1 font-mono">
                    <span className="font-bold text-stone-900">৳</span>
                    <input
                      type="number"
                      value={activeTrip.budget.transportBDT}
                      onChange={(e) => handleBudgetChange('transportBDT', Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded px-1"
                    />
                  </div>
                </div>

                {/* Lodging */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">{t.trips.lodging}</span>
                  <div className="flex items-center gap-1 mt-1 font-mono">
                    <span className="font-bold text-stone-900">৳</span>
                    <input
                      type="number"
                      value={activeTrip.budget.lodgingBDT}
                      onChange={(e) => handleBudgetChange('lodgingBDT', Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded px-1"
                    />
                  </div>
                </div>

                {/* Food */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">{t.trips.food}</span>
                  <div className="flex items-center gap-1 mt-1 font-mono">
                    <span className="font-bold text-stone-900">৳</span>
                    <input
                      type="number"
                      value={activeTrip.budget.foodBDT}
                      onChange={(e) => handleBudgetChange('foodBDT', Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded px-1"
                    />
                  </div>
                </div>

                {/* Activities */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">{t.trips.activities}</span>
                  <div className="flex items-center gap-1 mt-1 font-mono">
                    <span className="font-bold text-stone-900">৳</span>
                    <input
                      type="number"
                      value={activeTrip.budget.activitiesBDT}
                      onChange={(e) => handleBudgetChange('activitiesBDT', Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 rounded px-1"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-stone-600 italic leading-relaxed pt-1">
                {t.trips.disclaimer}
              </p>
            </div>
          </div>

          {/* Day-by-Day Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">
                {t.trips.daySchedule} ({activeTrip.days.length} {t.trips.days})
              </h3>
              <button
                onClick={handleAddDay}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Day</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeTrip.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#173B2E] text-white text-xs font-bold font-mono">
                        Day {day.dayNumber}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-stone-900">
                        {language === 'bn' ? day.title_bn : day.title_en}
                      </h4>
                    </div>

                    <button
                      onClick={() => setShowAddStopModal(day.dayNumber)}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition-colors border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.trips.addStop}</span>
                    </button>
                  </div>

                  {/* Day Stops */}
                  {day.stops.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-2">
                      No stops added for this day yet. Click "+ Add Stop" to plan visits or transit.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {day.stops.map((stop, sIndex) => {
                        const linkedDest = stop.destinationId
                          ? DESTINATIONS.find((d) => d.id === stop.destinationId)
                          : null;

                        return (
                          <div
                            key={stop.id}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-emerald-800 font-bold">
                                  {sIndex + 1}.
                                </span>
                                <span className="font-bold text-stone-900 text-xs sm:text-sm">
                                  {language === 'bn' ? stop.title_bn : stop.title_en}
                                </span>
                                {stop.timeSlot && (
                                  <span className="text-stone-500 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {stop.timeSlot}
                                  </span>
                                )}
                              </div>
                              {stop.notes && (
                                <p className="text-stone-600 text-xs pl-4 leading-relaxed">
                                  {stop.notes}
                                </p>
                              )}
                              {linkedDest && (
                                <div className="pl-4 pt-0.5">
                                  <button
                                    onClick={() => setSelectedDestination(linkedDest)}
                                    className="text-emerald-800 font-medium hover:underline inline-flex items-center gap-1 text-[11px]"
                                  >
                                    View Destination Guide <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                              <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-1 rounded border border-stone-200">
                                ৳{stop.estimatedCostBDT.toLocaleString()}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  disabled={sIndex === 0}
                                  onClick={() => handleMoveStop(day.dayNumber, sIndex, 'up')}
                                  className="p-1 rounded hover:bg-stone-200 text-stone-500 disabled:opacity-30"
                                  title={t.trips.moveUp}
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={sIndex === day.stops.length - 1}
                                  onClick={() => handleMoveStop(day.dayNumber, sIndex, 'down')}
                                  className="p-1 rounded hover:bg-stone-200 text-stone-500 disabled:opacity-30"
                                  title={t.trips.moveDown}
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveStop(day.dayNumber, stop.id)}
                                  className="p-1 rounded hover:bg-rose-100 text-rose-600"
                                  title={t.trips.removeStop}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-stone-200 space-y-3">
          <Compass className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-900">{t.trips.noTripsTitle}</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            {t.trips.noTripsDesc}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-900 transition-colors"
          >
            {t.trips.createFirstTrip}
          </button>
        </div>
      )}

      {/* Create New Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">
                {t.trips.createNew}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTrip} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Trip Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sajek Cloud Expedition & Nilgiri"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Group Size
                  </label>
                  <select
                    value={newGroupSize}
                    onChange={(e) => setNewGroupSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value={1}>1 Solo Explorer</option>
                    <option value={2}>2 Travelers (Duo)</option>
                    <option value={4}>4 Friends / Small Group</option>
                    <option value={6}>6+ Family / Group</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Travel Style
                  </label>
                  <select
                    value={newTravelStyle}
                    onChange={(e) => setNewTravelStyle(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="budget">Budget Backpacker</option>
                    <option value="explorer">Active Explorer</option>
                    <option value="comfort">Comfort & Leisure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Initial Destination
                </label>
                <select
                  value={newSelectedDestId}
                  onChange={(e) => setNewSelectedDestId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_en} ({d.division} Division)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  {t.trips.cancel}
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900 transition-colors"
                >
                  {t.trips.createNew}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                Add Stop to Day {showAddStopModal}
              </h3>
              <button
                onClick={() => setShowAddStopModal(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Stop Title / Activity *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunrise viewpoint at Konglak Para"
                  value={stopTitle}
                  onChange={(e) => setStopTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Time Slot / Window
                </label>
                <input
                  type="text"
                  placeholder="e.g. 06:00 AM – 08:30 AM"
                  value={stopTime}
                  onChange={(e) => setStopTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Estimated Activity / Toll Cost (BDT ৳)
                </label>
                <input
                  type="number"
                  value={stopCostBDT}
                  onChange={(e) => setStopCostBDT(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-stone-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Notes / Practical Reminders
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wear non-slip shoes, bring flashlight, carry water"
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  {t.trips.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStop(showAddStopModal)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Save Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
