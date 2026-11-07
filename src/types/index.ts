export type Division = 
  | 'Dhaka'
  | 'Chattogram'
  | 'Sylhet'
  | 'Khulna'
  | 'Rajshahi'
  | 'Barishal'
  | 'Rangpur'
  | 'Mymensingh';

export type Category = 
  | 'Nature'
  | 'Heritage'
  | 'Wildlife & Waterways'
  | 'Hills & Adventure'
  | 'Beaches'
  | 'Food & Culture';

export interface DestinationImage {
  url: string;
  caption_en: string;
  caption_bn: string;
  authorCredit?: string;
}

export interface DestinationShortVideo {
  videoUrl: string;
  youtubeId?: string;
  posterUrl: string;
  durationSec: number;
  title_en: string;
  title_bn: string;
  creator: string;
  likesCount: number;
}

export interface WeatherInfo {
  tempC: number;
  condition_en: string;
  condition_bn: string;
}

export interface Destination {
  id: string;
  name_en: string;
  name_bn: string;
  division: Division;
  district_en: string;
  district_bn: string;
  category: Category;
  latitude: number;
  longitude: number;
  short_description_en: string;
  short_description_bn: string;
  full_description_en: string;
  full_description_bn: string;
  palette: {
    bgGradient: string;
    accentColor: string;
    textColor: string;
  };
  best_season_en: string;
  best_season_bn: string;
  estimated_duration_en: string;
  estimated_duration_bn: string;
  budget_min_bdt: number;
  budget_max_bdt: number;
  transport_options_en: string[];
  transport_options_bn: string[];
  opening_hours_en?: string;
  opening_hours_bn?: string;
  entry_fee_en?: string;
  entry_fee_bn?: string;
  travel_tips_en: string[];
  travel_tips_bn: string[];
  safety_notes_en: string[];
  safety_notes_bn: string[];
  source_name: string;
  source_url: string;
  last_verified_at: string;
  is_published: boolean;
  highlights_en: string[];
  highlights_bn: string[];
  images: DestinationImage[];
  shortVideo?: DestinationShortVideo;
  weather?: WeatherInfo;
}

export interface TripStop {
  id: string;
  destinationId?: string;
  title_en: string;
  title_bn: string;
  timeSlot?: string;
  notes?: string;
  estimatedCostBDT: number;
}

export interface TripDay {
  dayNumber: number;
  date?: string;
  title_en: string;
  title_bn: string;
  stops: TripStop[];
}

export interface TripBudget {
  transportBDT: number;
  lodgingBDT: number;
  foodBDT: number;
  activitiesBDT: number;
  totalBDT: number;
}

export interface Trip {
  id: string;
  title: string;
  destinationIds: string[];
  startDate: string;
  endDate: string;
  groupSize: number;
  travelStyle: 'budget' | 'comfort' | 'explorer';
  days: TripDay[];
  budget: TripBudget;
  notes?: string;
  isOfflineDownloaded: boolean;
  createdAt: string;
}

export type TravelerType = 
  | 'Domestic Explorer'
  | 'Student Backpacker'
  | 'Family Planner'
  | 'International Tourist'
  | 'Solo Adventurer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  isLoggedIn: boolean;
  travelerType: TravelerType;
  homeDivision: Division;
  bio?: string;
  passportOrNidVerified: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  visitedDivisions: Division[];
  createdAt: string;
}

export type AppTab = 'explore' | 'map' | 'trips' | 'saved' | 'profile';
export type Language = 'en' | 'bn';
