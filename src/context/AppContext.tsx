import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination, Trip, AppTab, UserProfile, Division } from '../types';
import { DESTINATIONS } from '../data/destinations';
import { authService, GUEST_USER_PROFILE } from '../services/authService';

interface AppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedDestination: Destination | null;
  setSelectedDestination: (dest: Destination | null) => void;
  savedDestinationIds: string[];
  toggleSaveDestination: (id: string) => void;
  isDestinationSaved: (id: string) => boolean;
  trips: Trip[];
  activeTripId: string | null;
  setActiveTripId: (id: string | null) => void;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt'>) => Trip;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addDestinationToTrip: (tripId: string, destinationId: string) => void;
  viewMode: 'device' | 'responsive';
  setViewMode: (mode: 'device' | 'responsive') => void;
  toggleViewMode: () => void;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
  reopenOnboarding: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDivision: string;
  setSelectedDivision: (div: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  // User Profile & Authentication
  userProfile: UserProfile;
  loginUser: (profile: Partial<UserProfile>) => void;
  logoutUser: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  toggleVisitedDivision: (division: Division) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  // Short Video Reel
  activeVideoReelDest: Destination | null;
  setActiveVideoReelDest: (dest: Destination | null) => void;
  // Real-time AI Travel Chatbot
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  chatInitialPrompt: string | null;
  openAiChatWithPrompt: (prompt: string) => void;
  // Safe Travel & Weather Modal
  isWeatherModalOpen: boolean;
  setIsWeatherModalOpen: (open: boolean) => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-siyam-2026',
  name: 'Siyam Ahmed',
  email: 'siyam.gamerx2003@gmail.com',
  phone: '+880 1712-345678',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  isLoggedIn: true,
  travelerType: 'Domestic Explorer',
  homeDivision: 'Dhaka',
  bio: 'Passionate backpacker exploring the hidden corners, tea estates, and mangrove trails of Bangladesh.',
  passportOrNidVerified: true,
  emergencyContactName: 'Fahim Ahmed (Brother)',
  emergencyContactPhone: '+880 1819-987654',
  visitedDivisions: ['Dhaka', 'Sylhet', 'Chattogram', 'Khulna'],
  createdAt: '2026-01-15',
};

const INITIAL_SAMPLE_TRIP: Trip = {
  id: 'trip-sylhet-escape',
  title: 'Sylhet Rainforest & Tea Gardens Expedition',
  destinationIds: ['sreemangal-tea-gardens', 'tanguar-haor'],
  startDate: '2026-11-12',
  endDate: '2026-11-15',
  groupSize: 2,
  travelStyle: 'explorer',
  days: [
    {
      dayNumber: 1,
      title_en: 'Arrival in Sreemangal & Finlay Tea Estates',
      title_bn: 'শ্রীমঙ্গলে আগমন ও ফিনলে চা বাগান ভ্রমণ',
      stops: [
        {
          id: 'stop-1',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Upaban Express Train from Dhaka Kamalapur to Sreemangal',
          title_bn: 'ঢাকা কমলাপুর থেকে উপবন এক্সপ্রেস ট্রেনে শ্রীমঙ্গল পৌঁছানো',
          timeSlot: '06:40 AM – 11:30 AM',
          notes: 'Scenic morning route passing through Bhairab bridge and green wetlands',
          estimatedCostBDT: 900,
        },
        {
          id: 'stop-2',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Check-in at Eco Cottage & Cycling through Finlay Tea Estate',
          title_bn: 'ইকো কটেজে চেক-ইন ও ফিনলে চা বাগানে সাইকেল ভ্রমণ',
          timeSlot: '02:00 PM – 05:00 PM',
          notes: 'Rent bicycles from cottage gate to explore terraced tea hills',
          estimatedCostBDT: 400,
        },
        {
          id: 'stop-3',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Evening Tasting at Nilkantha 7-Layer Tea Cabin',
          title_bn: 'নীলকণ্ঠ কেবিনে বিখ্যাত সাতরঙা চা আস্বাদন',
          timeSlot: '05:30 PM – 06:30 PM',
          notes: 'Experience Ramesh Ram Gope’s original multilayer tea',
          estimatedCostBDT: 180,
        },
      ],
    },
    {
      dayNumber: 2,
      title_en: 'Lawachara Rainforest Gibbon Trek & Baikka Beel Birds',
      title_bn: 'লাউয়াছড়া উল্লুক পর্যবেক্ষণ ও বাইক্কা বিল পরিযায়ী পাখি',
      stops: [
        {
          id: 'stop-4',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Early Morning Gibbon Trek with Certified Forest Eco-Guide',
          title_bn: 'বনবিভাগের ইকো-গাইডসহ ভোরবেলায় লাউয়াছড়া রেইনফরেস্ট ট্রেইল',
          timeSlot: '06:30 AM – 09:30 AM',
          notes: 'High chance of spotting Western Hoolock Gibbons calling from tall canopy trees',
          estimatedCostBDT: 700,
        },
        {
          id: 'stop-5',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Manipuri Handloom Village Visit (Ramnagar)',
          title_bn: 'রামসুন্দরপুর মণিপুরী তাঁতপল্লী পরিদর্শন',
          timeSlot: '11:00 AM – 01:00 PM',
          notes: 'Watch indigenous women weave traditional cotton and silk shawls',
          estimatedCostBDT: 1500,
        },
        {
          id: 'stop-6',
          destinationId: 'sreemangal-tea-gardens',
          title_en: 'Baikka Beel Wetland Bird Sanctuary Observation Tower',
          title_bn: 'বাইক্কা বিল ওয়াচটাওয়ার থেকে পাখি পর্যবেক্ষণ',
          timeSlot: '03:30 PM – 05:30 PM',
          notes: 'Sunset over lotus beds with migratory whistling ducks and kingfishers',
          estimatedCostBDT: 300,
        },
      ],
    },
    {
      dayNumber: 3,
      title_en: 'Sunamganj & Tanguar Haor Lake Experience',
      title_bn: 'সুনামগঞ্জ যাত্রা ও টাঙ্গুয়ার হাওরে কাঠের বজরার অভিজ্ঞতা',
      stops: [
        {
          id: 'stop-7',
          destinationId: 'tanguar-haor',
          title_en: 'Drive via Sylhet Bypass to Tahirpur Ghat',
          title_bn: 'সিলেট বাইপাস হয়ে তাহিরপুর ঘাটে পৌঁছানো',
          timeSlot: '07:00 AM – 10:30 AM',
          notes: 'Transit to Sunamganj wetlands along the Meghalaya hill ridge',
          estimatedCostBDT: 2200,
        },
        {
          id: 'stop-8',
          destinationId: 'tanguar-haor',
          title_en: 'Day-cruise on Traditional Wooden Houseboat along Jadukata River',
          title_bn: 'যাদুকাটা নদী ও বারেকের টিলা সংলগ্ন এলাকায় বজরা ভ্রমণ',
          timeSlot: '11:00 AM – 04:30 PM',
          notes: 'Swimming in crystal river water and fresh freshwater fish lunch on board',
          estimatedCostBDT: 4500,
        },
      ],
    },
  ],
  budget: {
    transportBDT: 4800,
    lodgingBDT: 5600,
    foodBDT: 3400,
    activitiesBDT: 2800,
    totalBDT: 16600,
  },
  notes: 'Pack comfortable trekking shoes, mosquito repellent, binoculars for birdwatching, and powerbanks.',
  isOfflineDownloaded: true,
  createdAt: '2026-10-10',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('explore');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  // Persisted Saved Destinations
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('toca_saved_destinations');
      return stored ? JSON.parse(stored) : ['sreemangal-tea-gardens', 'sundarbans-mangrove', 'sajek-valley'];
    } catch {
      return ['sreemangal-tea-gardens', 'sundarbans-mangrove'];
    }
  });

  // Persisted Trips
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const stored = localStorage.getItem('toca_trips');
      return stored ? JSON.parse(stored) : [INITIAL_SAMPLE_TRIP];
    } catch {
      return [INITIAL_SAMPLE_TRIP];
    }
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(trips[0]?.id || null);

  // User Profile & Auth
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return authService.getCurrentUser();
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeVideoReelDest, setActiveVideoReelDest] = useState<Destination | null>(null);

  // Real-time AI Travel Chatbot
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);

  const openAiChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setIsAiChatOpen(true);
  };

  // Safe Travel & Weather Modal
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // View Mode: 'device' (Android phone frame) vs 'responsive' (full wide view)
  const [viewMode, setViewMode] = useState<'device' | 'responsive'>(() => {
    const stored = localStorage.getItem('toca_view_mode');
    return (stored === 'device' || stored === 'responsive') ? stored : 'responsive';
  });

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('toca_onboarding_done') !== 'true';
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('toca_saved_destinations', JSON.stringify(savedDestinationIds));
  }, [savedDestinationIds]);

  useEffect(() => {
    localStorage.setItem('toca_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    authService.setCurrentUser(userProfile);
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('toca_view_mode', viewMode);
  }, [viewMode]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const loginUser = (profileData: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const merged: UserProfile = {
        ...prev,
        ...profileData,
        isLoggedIn: true,
      };
      authService.setCurrentUser(merged);
      if (merged.id) {
        authService.updateAccount(merged.id, merged);
      }
      return merged;
    });
    setIsLoginModalOpen(false);
    showToast(`Welcome back, ${profileData.name || 'Traveler'}! ✓`);
  };

  const logoutUser = () => {
    const guest = authService.logout();
    setUserProfile(guest);
    showToast('Signed out. Continuing in Guest mode.');
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const merged: UserProfile = {
        ...prev,
        ...updated,
      };
      authService.setCurrentUser(merged);
      if (merged.id) {
        authService.updateAccount(merged.id, merged);
      }
      return merged;
    });
    showToast('Profile updated successfully ✓');
  };

  const toggleVisitedDivision = (division: Division) => {
    setUserProfile((prev) => {
      const alreadyVisited = prev.visitedDivisions.includes(division);
      const nextVisited = alreadyVisited
        ? prev.visitedDivisions.filter((d) => d !== division)
        : [...prev.visitedDivisions, division];
      
      showToast(alreadyVisited ? `Removed ${division} from visited list` : `Marked ${division} as visited! 🎉`);
      return {
        ...prev,
        visitedDivisions: nextVisited,
      };
    });
  };

  const toggleSaveDestination = (id: string) => {
    setSavedDestinationIds((prev) => {
      const isSaved = prev.includes(id);
      if (isSaved) {
        showToast('Destination removed from saved bookmarks');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Saved to your collection & offline cache');
        return [...prev, id];
      }
    });
  };

  const isDestinationSaved = (id: string) => savedDestinationIds.includes(id);

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt'>): Trip => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    showToast('New trip itinerary created');
    return newTrip;
  };

  const updateTrip = (updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Trip itinerary updated');
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (activeTripId === id) {
      setActiveTripId(trips.find((t) => t.id !== id)?.id || null);
    }
    showToast('Trip deleted');
  };

  const addDestinationToTrip = (tripId: string, destinationId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest) return;

    const updatedDestinationIds = Array.from(new Set([...targetTrip.destinationIds, destinationId]));
    
    // Add a stop to the last day or create Day 1
    const lastDayIndex = targetTrip.days.length - 1;
    const newStop = {
      id: `stop-${Date.now()}`,
      destinationId,
      title_en: `Explore ${dest.name_en}`,
      title_bn: `${dest.name_bn} পরিদর্শন`,
      timeSlot: '02:00 PM – 05:00 PM',
      notes: dest.short_description_en,
      estimatedCostBDT: Math.round(dest.budget_min_bdt * 0.4),
    };

    let updatedDays = [...targetTrip.days];
    if (updatedDays.length === 0) {
      updatedDays = [{
        dayNumber: 1,
        title_en: `Day 1: ${dest.district_en}`,
        title_bn: `১ম দিন: ${dest.district_bn}`,
        stops: [newStop],
      }];
    } else {
      updatedDays[lastDayIndex] = {
        ...updatedDays[lastDayIndex],
        stops: [...updatedDays[lastDayIndex].stops, newStop],
      };
    }

    const newActivitiesCost = targetTrip.budget.activitiesBDT + newStop.estimatedCostBDT;
    const newTotal = targetTrip.budget.transportBDT + targetTrip.budget.lodgingBDT + targetTrip.budget.foodBDT + newActivitiesCost;

    const updatedTrip: Trip = {
      ...targetTrip,
      destinationIds: updatedDestinationIds,
      days: updatedDays,
      budget: {
        ...targetTrip.budget,
        activitiesBDT: newActivitiesCost,
        totalBDT: newTotal,
      },
    };

    updateTrip(updatedTrip);
    showToast(`Added ${dest.name_en} to ${targetTrip.title}`);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'device' ? 'responsive' : 'device'));
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('toca_onboarding_done', 'true');
  };

  const reopenOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDestination,
        setSelectedDestination,
        savedDestinationIds,
        toggleSaveDestination,
        isDestinationSaved,
        trips,
        activeTripId,
        setActiveTripId,
        createTrip,
        updateTrip,
        deleteTrip,
        addDestinationToTrip,
        viewMode,
        setViewMode,
        toggleViewMode,
        showOnboarding,
        dismissOnboarding,
        reopenOnboarding,
        toast,
        showToast,
        searchQuery,
        setSearchQuery,
        selectedDivision,
        setSelectedDivision,
        selectedCategory,
        setSelectedCategory,
        userProfile,
        loginUser,
        logoutUser,
        updateUserProfile,
        toggleVisitedDivision,
        isLoginModalOpen,
        setIsLoginModalOpen,
        activeVideoReelDest,
        setActiveVideoReelDest,
        isAiChatOpen,
        setIsAiChatOpen,
        chatInitialPrompt,
        openAiChatWithPrompt,
        isWeatherModalOpen,
        setIsWeatherModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
