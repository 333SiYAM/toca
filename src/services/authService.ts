import { UserProfile, Division, TravelerType } from '../types';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Plaintext or hashed for client session storage
  avatar: string;
  travelerType: TravelerType;
  homeDivision: Division;
  bio?: string;
  passportOrNidVerified: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  visitedDivisions: Division[];
  createdAt: string;
}

const STORAGE_USERS_KEY = 'toca_registered_users_db_v2';
const STORAGE_CURRENT_USER_KEY = 'toca_current_user_profile_v2';
const STORAGE_PENDING_OTP_KEY = 'toca_pending_otp_v2';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-siyam-2026',
    name: 'Siyam Ahmed',
    email: 'siyam.gamerx2003@gmail.com',
    phone: '+880 1712-345678',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    travelerType: 'Domestic Explorer',
    homeDivision: 'Dhaka',
    bio: 'Passionate backpacker exploring the hidden corners, tea estates, and mangrove trails of Bangladesh.',
    passportOrNidVerified: true,
    emergencyContactName: 'Fahim Ahmed (Brother)',
    emergencyContactPhone: '+880 1819-987654',
    visitedDivisions: ['Dhaka', 'Sylhet', 'Chattogram', 'Khulna'],
    createdAt: '2026-01-15',
  },
  {
    id: 'user-anika-2026',
    name: 'Dr. Anika Rahman',
    email: 'anika.archaeology@heritage.bd',
    phone: '+880 1819-223344',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    travelerType: 'Domestic Explorer',
    homeDivision: 'Rajshahi',
    bio: 'Heritage scholar documenting Buddhist viharas, terracotta temples, and sultanate mosques.',
    passportOrNidVerified: true,
    emergencyContactName: 'Kamal Rahman',
    emergencyContactPhone: '+880 1711-001122',
    visitedDivisions: ['Rajshahi', 'Dhaka', 'Rangpur', 'Khulna'],
    createdAt: '2026-02-10',
  },
  {
    id: 'user-tanvir-2026',
    name: 'Tanvir Islam',
    email: 'tanvir.wildlife@nature.bd',
    phone: '+880 1912-556677',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    travelerType: 'Solo Adventurer',
    homeDivision: 'Sylhet',
    bio: 'Wildlife scout tracking birds in Lawachara and tigers in the Sundarbans.',
    passportOrNidVerified: true,
    emergencyContactName: 'Sadia Islam',
    emergencyContactPhone: '+880 1912-998877',
    visitedDivisions: ['Sylhet', 'Khulna', 'Chattogram'],
    createdAt: '2026-03-01',
  },
];

export const GUEST_USER_PROFILE: UserProfile = {
  id: 'guest-traveler',
  name: 'Guest Traveler',
  email: 'guest@toca.bd',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  isLoggedIn: false,
  travelerType: 'Domestic Explorer',
  homeDivision: 'Dhaka',
  bio: 'Exploring Bangladesh in Guest Mode. Sign in to sync itineraries and cloud passport.',
  passportOrNidVerified: false,
  visitedDivisions: [],
  createdAt: new Date().toISOString().split('T')[0],
};

function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users: UserAccount[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function toUserProfile(account: UserAccount, isLoggedIn = true): UserProfile {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    avatar: account.avatar,
    isLoggedIn,
    travelerType: account.travelerType,
    homeDivision: account.homeDivision,
    bio: account.bio,
    passportOrNidVerified: account.passportOrNidVerified,
    emergencyContactName: account.emergencyContactName,
    emergencyContactPhone: account.emergencyContactPhone,
    visitedDivisions: account.visitedDivisions || [],
    createdAt: account.createdAt,
  };
}

export const authService = {
  // Get all registered accounts
  getAllAccounts(): UserAccount[] {
    return getStoredUsers();
  },

  // Get active session
  getCurrentUser(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Default to Siyam Ahmed logged in for initial state
    const defaultUser = toUserProfile(INITIAL_USERS[0], true);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(profile: UserProfile | null) {
    if (profile) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(GUEST_USER_PROFILE));
    }
  },

  // Email & Password Sign In
  signInWithEmail(emailInput: string, passwordInput: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password' };
    }

    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return {
        success: false,
        error: `No account found with email "${emailInput}". Please check spelling or create a new account.`,
      };
    }

    if (found.password !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. (For demo testing, password is: password123)',
      };
    }

    const userProfile = toUserProfile(found, true);
    this.setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  },

  // Sign Up / Register
  signUp(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    travelerType: TravelerType;
    homeDivision: Division;
    avatar?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();
    const cleanPhone = data.phone.trim();
    const cleanPass = data.password.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: `An account with email "${cleanEmail}" already exists. Please sign in instead.`,
      };
    }

    const newAccount: UserAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone.startsWith('+880') ? cleanPhone : `+880 ${cleanPhone.replace(/^\+880\s*/, '')}`,
      password: cleanPass,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      travelerType: data.travelerType || 'Domestic Explorer',
      homeDivision: data.homeDivision || 'Dhaka',
      bio: `Verified traveler exploring ${data.homeDivision || 'Bangladesh'}.`,
      passportOrNidVerified: true,
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      visitedDivisions: [data.homeDivision || 'Dhaka'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    users.push(newAccount);
    saveUsers(users);

    const userProfile = toUserProfile(newAccount, true);
    this.setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  },

  // Mobile SMS OTP Generator & Dispatcher
  sendSmsOtp(rawPhone: string): { code: string; phone: string; expiresAt: number } {
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const standardPhone = cleanDigits.slice(-10); // get last 10 digits
    // Realistic standard Bangladesh 6-digit OTP code
    const code = '849201'; // Default predictable verification code for testing, or dynamic
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const payload = {
      phone: standardPhone,
      code,
      expiresAt,
    };
    localStorage.setItem(STORAGE_PENDING_OTP_KEY, JSON.stringify(payload));
    return payload;
  },

  // Verify Mobile OTP
  verifySmsOtp(
    rawPhone: string,
    enteredCode: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const standardPhone = cleanDigits.slice(-10);
    const cleanCode = enteredCode.trim().replace(/\D/g, '');

    if (cleanCode.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit verification code' };
    }

    let storedOtp: { phone: string; code: string; expiresAt: number } | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_PENDING_OTP_KEY);
      if (raw) storedOtp = JSON.parse(raw);
    } catch {
      // ignore
    }

    // Accept valid code (either stored or standard demo code 849201 or 123456)
    const isValidCode =
      (storedOtp && storedOtp.code === cleanCode) ||
      cleanCode === '849201' ||
      cleanCode === '123456';

    if (!isValidCode) {
      return {
        success: false,
        error: 'Invalid verification code. For demo, use code: 849201',
      };
    }

    // Match existing account or create a quick verified phone profile
    const users = getStoredUsers();
    let account = users.find(
      (u) => u.phone.replace(/\D/g, '').endsWith(standardPhone)
    );

    if (!account) {
      // Create new verified mobile user
      account = {
        id: `user-phone-${Date.now()}`,
        name: `Traveler +880 ${standardPhone}`,
        email: `traveler.${standardPhone}@toca.bd`,
        phone: `+880 ${standardPhone}`,
        password: 'password123',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        travelerType: 'Domestic Explorer',
        homeDivision: 'Dhaka',
        bio: 'Verified mobile explorer of Bangladesh heritage & landscapes.',
        passportOrNidVerified: true,
        visitedDivisions: ['Dhaka'],
        createdAt: new Date().toISOString().split('T')[0],
      };
      users.push(account);
      saveUsers(users);
    }

    const userProfile = toUserProfile(account, true);
    this.setCurrentUser(userProfile);
    localStorage.removeItem(STORAGE_PENDING_OTP_KEY);
    return { success: true, user: userProfile };
  },

  // Password Reset
  resetPassword(
    identifier: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanId) return { success: false, error: 'Please enter your email or phone number' };
    if (cleanPass.length < 6) return { success: false, error: 'New password must be at least 6 characters' };

    const users = getStoredUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\D/g, '').endsWith(cleanId.replace(/\D/g, ''))
    );

    if (!user) {
      return {
        success: false,
        error: `No account found for "${identifier}". Please verify your credentials.`,
      };
    }

    user.password = cleanPass;
    saveUsers(users);
    return { success: true };
  },

  // Change Password
  changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): { success: boolean; error?: string } {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, error: 'User account not found' };
    }
    if (user.password !== oldPass.trim()) {
      return { success: false, error: 'Current password does not match' };
    }
    if (newPass.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long' };
    }

    user.password = newPass.trim();
    saveUsers(users);
    return { success: true };
  },

  // Update Account
  updateAccount(userId: string, data: Partial<UserAccount>): { success: boolean; user?: UserProfile } {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...data,
      };
      saveUsers(users);
      const userProfile = toUserProfile(users[index], true);
      this.setCurrentUser(userProfile);
      return { success: true, user: userProfile };
    }

    return { success: false };
  },

  // Logout
  logout(): UserProfile {
    this.setCurrentUser(null);
    return GUEST_USER_PROFILE;
  },
};
