import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS } from '../data/destinations';
import { Division, TravelerType } from '../types';
import { authService } from '../services/authService';
import {
  Globe,
  PhoneCall,
  Shield,
  Smartphone,
  HardDrive,
  Info,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  User,
  ShieldCheck,
  MapPin,
  Compass,
  Calendar,
  Bookmark,
  Banknote,
  LogOut,
  LogIn,
  Edit3,
  Award,
  Phone,
  Flame,
  Check,
  AlertTriangle,
  DownloadCloud,
  X,
  ShieldAlert,
  Lock,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { 
    viewMode, 
    toggleViewMode, 
    reopenOnboarding, 
    savedDestinationIds,
    trips,
    userProfile,
    updateUserProfile,
    toggleVisitedDivision,
    logoutUser,
    setIsLoginModalOpen,
    showToast 
  } = useApp();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(userProfile.bio || '');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone || '+880 1712-345678');
  const [editTravelerType, setEditTravelerType] = useState<TravelerType>(userProfile.travelerType);
  const [editHomeDivision, setEditHomeDivision] = useState<Division>(userProfile.homeDivision);
  const [editEmergencyName, setEditEmergencyName] = useState(userProfile.emergencyContactName || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(userProfile.emergencyContactPhone || '');
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);

  // Security & Password Change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Synchronize form states when userProfile updates
  useEffect(() => {
    setEditName(userProfile.name);
    setEditPhone(userProfile.phone || '+880 1712-345678');
    setEditTravelerType(userProfile.travelerType);
    setEditHomeDivision(userProfile.homeDivision);
    setEditEmergencyName(userProfile.emergencyContactName || '');
    setEditEmergencyPhone(userProfile.emergencyContactPhone || '');
    setBioInput(userProfile.bio || '');
  }, [userProfile]);

  const allDivisions: Division[] = [
    'Dhaka',
    'Chattogram',
    'Sylhet',
    'Khulna',
    'Rajshahi',
    'Barishal',
    'Rangpur',
    'Mymensingh',
  ];

  const totalTripsBudget = trips.reduce((acc, trip) => acc + (trip.budget?.totalBDT || 0), 0);
  const visitedCount = userProfile.visitedDivisions?.length || 0;
  const visitedPercentage = Math.round((visitedCount / allDivisions.length) * 100);

  const handleSaveBio = () => {
    updateUserProfile({ bio: bioInput.trim() });
    setIsEditingBio(false);
    showToast('Traveler bio updated ✓');
  };

  const handleSaveFullProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      phone: editPhone,
      travelerType: editTravelerType,
      homeDivision: editHomeDivision,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone,
    });
    setIsEditingProfile(false);
    showToast('Traveler profile details updated ✓');
  };

  const handleDownloadAllOffline = () => {
    setIsDownloadingOffline(true);
    showToast('Downloading offline travel packages for all 14 places... 📥');
    setTimeout(() => {
      setIsDownloadingOffline(false);
      showToast('All 14 Bangladesh destination guides stored offline! Ready for zero-network journeys. ✓');
    }, 1800);
  };

  const handleClearCache = () => {
    localStorage.removeItem('toca_saved_destinations');
    localStorage.removeItem('toca_trips');
    showToast('Local offline storage reset successfully');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // Badges calculations
  const badges = [
    {
      id: 'badge-divisions-half',
      title_en: 'Bengal Voyager',
      title_bn: 'বাংলা পরিব্রাজক',
      desc_en: 'Explored 4 or more Divisions of Bangladesh',
      desc_bn: 'বাংলাদেশের ৪টি বা তার বেশি বিভাগ ভ্রমণ করেছেন',
      icon: '🗺️',
      unlocked: visitedCount >= 4,
    },
    {
      id: 'badge-sundarbans',
      title_en: 'Mangrove Sentinel',
      title_bn: 'সুন্দরবন প্রহরী',
      desc_en: 'Visited Khulna division & Sundarbans Tiger Sanctuary',
      desc_bn: 'খুলনা বিভাগ ও সুন্দরবন ম্যানগ্রোভ বন ভ্রমণ করেছেন',
      icon: '🐅',
      unlocked: userProfile.visitedDivisions?.includes('Khulna'),
    },
    {
      id: 'badge-haor',
      title_en: 'Haor Voyager',
      title_bn: 'হাওর নাবিক',
      desc_en: 'Explored Sylhet division & Tanguar Haor wetland',
      desc_bn: 'সিলেট বিভাগ ও টাঙ্গুয়ার হাওর ভ্রমণ করেছেন',
      icon: '⛵',
      unlocked: userProfile.visitedDivisions?.includes('Sylhet'),
    },
    {
      id: 'badge-clouds',
      title_en: 'Cloud Wanderer',
      title_bn: 'মেঘের যাযাবর',
      desc_en: 'Visited Chattogram hill tracts (Sajek & Nilgiri)',
      desc_bn: 'চট্টগ্রামের পাহাড়ি সাজেক ও নীলগিরি ভ্রমণ করেছেন',
      icon: '☁️',
      unlocked: userProfile.visitedDivisions?.includes('Chattogram'),
    },
    {
      id: 'badge-heritage',
      title_en: 'Pala & Mughal Scholar',
      title_bn: 'ঐতিহ্য সন্ধানী',
      desc_en: 'Visited Rajshahi / Dhaka historic UNESCO monuments',
      desc_bn: 'রাজশাহী বা ঢাকার ঐতিহাসিক প্রত্নতাত্ত্বিক স্থান ভ্রমণ করেছেন',
      icon: '🏛️',
      unlocked: userProfile.visitedDivisions?.includes('Rajshahi') || userProfile.visitedDivisions?.includes('Dhaka'),
    },
  ];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.profile.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
          {t.profile.subtitle}
        </p>
      </div>

      {/* Main User Profile Identity Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with status */}
            <div className="relative shrink-0">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-600/30 shadow-md"
              />
              {userProfile.passportOrNidVerified && (
                <div 
                  className="absolute -bottom-1 -right-1 p-1 bg-emerald-800 text-white rounded-full ring-2 ring-white shadow-sm"
                  title="National Identity / Passport Verified"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Name & Role */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                  {userProfile.isLoggedIn ? userProfile.name : 'Guest Traveler'}
                </h2>
                {userProfile.isLoggedIn && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                    NID VERIFIED
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500 font-mono">
                {userProfile.isLoggedIn ? userProfile.email : 'Explore mode enabled'}
                {userProfile.phone && ` · ${userProfile.phone}`}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-medium text-[11px]">
                  {userProfile.travelerType}
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600 font-medium text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-800" />
                  {userProfile.homeDivision} Division
                </span>
              </div>
            </div>
          </div>

          {/* Edit & Sign-in Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {userProfile.isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    setPasswordError(null);
                    setIsChangingPassword(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Change your login password"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                  <span>Security</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Switch account or sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest Mode Notice */}
        {!userProfile.isLoggedIn && (
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Browsing in Guest Mode</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Sign in or create an account to unlock verified traveler status, save custom day-by-day itineraries, and sync offline guides.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 self-start sm:self-auto shadow-2xs"
            >
              Sign In Now
            </button>
          </div>
        )}

        {/* Bio Section */}
        <div className="pt-2 border-t border-stone-100">
          {!isEditingBio ? (
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-stone-600 italic">
                "{userProfile.bio || 'Exploring the rivers, tea hills, and ancient heritage of Bangladesh.'}"
              </p>
              {userProfile.isLoggedIn && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-[11px] text-emerald-800 font-semibold hover:underline shrink-0"
                >
                  Edit Bio
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={160}
                placeholder="Share your travel philosophy or favorite Bangladesh journey..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                rows={2}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 rounded-lg text-xs text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  className="px-3.5 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
                >
                  Save Bio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact Strip */}
        {userProfile.emergencyContactName && (
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Emergency Contact: <strong>{userProfile.emergencyContactName}</strong> ({userProfile.emergencyContactPhone})
              </span>
            </div>
            <a
              href={`tel:${userProfile.emergencyContactPhone?.replace(/\s+/g, '')}`}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors"
            >
              Call Contact
            </a>
          </div>
        )}
      </div>

      {/* Travel Journey Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
            <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>Saved Places</span>
          </div>
          <p className="text-xl font-extrabold text-stone-900 font-mono">
            {savedDestinationIds.length}
          </p>
          <p className="text-[10px] text-stone-400">Available offline</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span>Custom Trips</span>
          </div>
          <p className="text-xl font-extrabold text-stone-900 font-mono">
            {trips.length}
          </p>
          <p className="text-[10px] text-stone-400">Day itineraries</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Divisions Visited</span>
          </div>
          <p className="text-xl font-extrabold text-stone-900 font-mono">
            {visitedCount} / {allDivisions.length}
          </p>
          <p className="text-[10px] text-emerald-800 font-semibold">{visitedPercentage}% completed</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-medium">
            <Banknote className="w-3.5 h-3.5 text-teal-700" />
            <span>Trip Budget</span>
          </div>
          <p className="text-xl font-extrabold text-stone-900 font-mono">
            ৳{totalTripsBudget.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-400">Estimated BDT</p>
        </div>
      </div>

      {/* Interactive 8 Divisions of Bangladesh Tracker */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>8 Administrative Divisions of Bangladesh</span>
            </h2>
            <p className="text-xs text-stone-500">
              Tap any division card to mark whether you have explored its heritage and attractions.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {visitedCount} of 8 Visited ({visitedPercentage}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full"
            style={{ width: `${visitedPercentage}%` }}
          />
        </div>

        {/* Division Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {allDivisions.map((div) => {
            const isVisited = userProfile.visitedDivisions?.includes(div);
            return (
              <button
                key={div}
                onClick={() => toggleVisitedDivision(div)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isVisited
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs truncate">{div}</p>
                  <p className="text-[10px] text-stone-400 font-normal">
                    {isVisited ? 'Explored ✓' : 'Tap to mark'}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isVisited ? 'bg-emerald-700 text-white' : 'border border-stone-300'
                }`}>
                  {isVisited && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Travel Badges Showcase */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Travel Achievement Badges</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-200 text-stone-900'
                  : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0 p-1.5 rounded-xl bg-white shadow-2xs">
                {b.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {language === 'bn' ? b.title_bn : b.title_en}
                </p>
                <p className="text-[11px] leading-tight text-stone-500 mt-0.5">
                  {language === 'bn' ? b.desc_bn : b.desc_en}
                </p>
                <span className={`inline-block mt-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {b.unlocked ? 'UNLOCKED ★' : 'LOCKED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bangladesh Emergency Hotlines (Life Safety Hub) */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-rose-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>{t.profile.emergencyTitle}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {t.profile.emergencySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tourist Police */}
          <a
            href="tel:01320001299"
            className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.profile.hotlineTouristPolice}</span>
              </p>
              <p className="text-[11px] text-emerald-800 font-mono font-bold">
                +880 1320-001299
              </p>
              <p className="text-[10px] text-stone-500">24/7 Tourist support across all spots</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-700 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
          </a>

          {/* National 999 */}
          <a
            href="tel:999"
            className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 hover:bg-rose-100/70 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{t.profile.hotlineEmergency}</span>
              </p>
              <p className="text-[11px] text-rose-800 font-mono font-bold">
                Dial 999
              </p>
              <p className="text-[10px] text-stone-500">Police, Ambulance & Fire Service</p>
            </div>
            <div className="p-2 rounded-xl bg-rose-600 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
          </a>

          {/* National 333 */}
          <a
            href="tel:333"
            className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-900">
                {t.profile.hotlineGovtInfo}
              </p>
              <p className="text-[11px] text-stone-700 font-mono font-bold">
                Dial 333
              </p>
              <p className="text-[10px] text-stone-500">Government services & travel alerts</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-800 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
          </a>

          {/* Health 16263 */}
          <a
            href="tel:16263"
            className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:bg-stone-100 flex items-center justify-between transition-colors group cursor-pointer"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-900">
                National Health Hotline
              </p>
              <p className="text-[11px] text-stone-700 font-mono font-bold">
                Dial 16263
              </p>
              <p className="text-[10px] text-stone-500">Doctor consultations on the go</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-800 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4" />
            </div>
          </a>
        </div>
      </div>

      {/* Offline Storage & Cache Manager */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-700" />
              <span>Offline Travel Packages & Cache</span>
            </h2>
            <p className="text-xs text-stone-500">
              TOCA stores travel itineraries, GPS coordinates, and safety contacts locally for zero-reception journeys.
            </p>
          </div>

          <button
            onClick={handleDownloadAllOffline}
            disabled={isDownloadingOffline}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-sm"
          >
            <DownloadCloud className={`w-4 h-4 ${isDownloadingOffline ? 'animate-bounce' : ''}`} />
            <span>{isDownloadingOffline ? 'Downloading...' : 'Cache All 14 Guides'}</span>
          </button>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-stone-800">
              ~2.4 MB Cached
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-600">
              14 destinations · {trips.length} itineraries · 8 divisions
            </span>
          </div>

          <button
            onClick={handleClearCache}
            className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Local Cache</span>
          </button>
        </div>
      </div>


      {/* App Preferences & Controls */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
          {t.profile.settingsTitle}
        </h2>

        <div className="space-y-3">
          {/* Language Switch */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {t.profile.languageToggle}
                </p>
                <p className="text-[11px] text-stone-500">
                  Switch between English and বাংলা
                </p>
              </div>
            </div>

            <div className="flex items-center p-1 bg-stone-200/80 rounded-xl text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  language === 'bn'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {t.profile.viewModeToggle}
                </p>
                <p className="text-[11px] text-stone-500">
                  Toggle between Android phone frame and responsive desktop
                </p>
              </div>
            </div>

            <button
              onClick={toggleViewMode}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
            >
              {viewMode === 'device' ? 'Switch to Fullscreen' : 'Switch to Phone'}
            </button>
          </div>

          {/* Replay Onboarding */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {t.profile.reopenOnboarding}
                </p>
                <p className="text-[11px] text-stone-500">
                  Revisit TOCA brand values and feature tour
                </p>
              </div>
            </div>

            <button
              onClick={reopenOnboarding}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors"
            >
              Replay Tour
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Full Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-[#173B2E] to-[#267A5C] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Edit Traveler Profile</h3>
                <p className="text-xs text-emerald-100">Update your traveler identity in TOCA</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFullProfile} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Traveler Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mobile Number (+880)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Traveler Type
                  </label>
                  <select
                    value={editTravelerType}
                    onChange={(e) => setEditTravelerType(e.target.value as TravelerType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Domestic Explorer">Domestic Explorer</option>
                    <option value="Student Backpacker">Student Backpacker</option>
                    <option value="Family Planner">Family Planner</option>
                    <option value="International Tourist">International Tourist</option>
                    <option value="Solo Adventurer">Solo Adventurer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Home Division
                  </label>
                  <select
                    value={editHomeDivision}
                    onChange={(e) => setEditHomeDivision(e.target.value as Division)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {allDivisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    placeholder="e.g. Brother / Parent"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="+880 18..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-800" />
                <h3 className="text-base font-bold text-stone-900">Security & Password</h3>
              </div>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordError(null);
                if (newPassword.length < 6) {
                  setPasswordError('New password must be at least 6 characters');
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  setPasswordError('New passwords do not match');
                  return;
                }
                const result = authService.changePassword(userProfile.id, oldPassword, newPassword);
                if (!result.success) {
                  setPasswordError(result.error || 'Failed to change password');
                  return;
                }
                setIsChangingPassword(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                showToast('Password updated successfully ✓');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-800 mb-1">Current Password *</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">New Password (min 6 chars) *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* End of modals */}
    </div>
  );
};
