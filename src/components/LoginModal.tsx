import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Division, TravelerType } from '../types';
import { authService } from '../services/authService';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Smartphone,
  RotateCcw,
  KeyRound,
  AlertCircle,
  HelpCircle,
  Shield,
  Check,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { language } = useLanguage();
  const { isLoginModalOpen, setIsLoginModalOpen, loginUser, showToast } = useApp();

  type AuthTab = 'phone' | 'email' | 'signup' | 'forgot';
  const [authTab, setAuthTab] = useState<AuthTab>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phone OTP Flow states
  const [phoneNumber, setPhoneNumber] = useState('1712345678');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(45);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email Sign-In states
  const [email, setEmail] = useState('siyam.gamerx2003@gmail.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration states
  const [regName, setRegName] = useState('Siyam Ahmed');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('1712345678');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('Domestic Explorer');
  const [homeDivision, setHomeDivision] = useState<Division>('Dhaka');
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );
  const [nidVerified, setNidVerified] = useState(true);

  // Forgot password states
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'success'>('input');

  const avatarOptions = [
    {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      label: 'Siyam (Backpacker)',
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      label: 'Tanvir (Wildlife)',
    },
    {
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      label: 'Anika (Heritage)',
    },
    {
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      label: 'Nusrat (Nature)',
    },
  ];

  // Clear errors when switching tabs
  useEffect(() => {
    setErrorMessage(null);
  }, [authTab]);

  // OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  if (!isLoginModalOpen) return null;

  // Send SMS OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 8) {
      setErrorMessage('Please enter a valid 10-digit mobile number (e.g. 1712345678)');
      return;
    }

    const { code } = authService.sendSmsOtp(phoneNumber);
    setDispatchedOtp(code);
    setOtpSent(true);
    setResendTimer(45);
    setOtpDigits(['', '', '', '', '', '']);
    showToast(`SMS Verification Code sent to +880 ${cleanDigits} 📲`);

    // Auto-focus first digit input after render
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  // Handle single digit input and focus shifting
  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6 digits
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => !d);
    if (nextEmpty !== -1) {
      otpInputRefs.current[nextEmpty]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code');
      return;
    }

    const result = authService.verifySmsOtp(phoneNumber, fullCode);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Verification failed. Please try again.');
      return;
    }

    loginUser(result.user);
  };

  // Email & Password Sign In
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = authService.signInWithEmail(email, password);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Sign in failed');
      return;
    }

    loginUser(result.user);
  };

  // Sign Up / Register
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    const result = authService.signUp({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      travelerType,
      homeDivision,
      avatar: selectedAvatar,
    });

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Failed to create account');
      return;
    }

    loginUser(result.user);
  };

  // Google One-Tap Sign In
  const handleGoogleSignIn = () => {
    const result = authService.signInWithEmail('siyam.gamerx2003@gmail.com', 'password123');
    if (result.success && result.user) {
      loginUser(result.user);
      showToast('Signed in with Google (siyam.gamerx2003@gmail.com) ✓');
    }
  };

  // Quick Account Login
  const handleQuickLogin = (userEmail: string) => {
    const result = authService.signInWithEmail(userEmail, 'password123');
    if (result.success && result.user) {
      loginUser(result.user);
    }
  };

  // Reset Password Handler
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = authService.resetPassword(forgotIdentifier, forgotNewPassword);
    if (!result.success) {
      setErrorMessage(result.error || 'Reset failed');
      return;
    }
    setForgotStep('success');
    showToast('Password reset successfully! Please sign in with your new password.');
  };

  const handleFillDemoOtp = () => {
    const demo = ['8', '4', '9', '2', '0', '1'];
    setOtpDigits(demo);
    setErrorMessage(null);
    showToast('Demo OTP 849201 filled ✓');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Gradient Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#173B2E] via-[#204d3c] to-[#267A5C] text-white relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>TOCA Traveler Passport & Account</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {authTab === 'signup'
              ? 'Create Traveler Profile'
              : authTab === 'forgot'
              ? 'Reset Your Password'
              : 'Sign In to TOCA'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            Sync your itineraries, offline guides, and 8-division travel badges across all devices.
          </p>

          {/* Tab Selector */}
          {authTab !== 'forgot' && (
            <div className="mt-4 flex items-center p-1 bg-black/30 backdrop-blur-md rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  setAuthTab('phone');
                  setOtpSent(false);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'phone'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mobile OTP</span>
              </button>
              <button
                onClick={() => setAuthTab('email')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'email'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Pass</span>
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authTab === 'signup'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* 1-Tap Google Sign-In Button */}
          {authTab !== 'signup' && authTab !== 'forgot' && (
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (siyam.gamerx2003@gmail.com)</span>
            </button>
          )}

          {/* Quick Demo Accounts Strip */}
          {authTab !== 'signup' && authTab !== 'forgot' && (
            <div className="space-y-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                ⚡ Quick Traveler Login Profiles
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('siyam.gamerx2003@gmail.com')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition-all shadow-2xs flex items-center gap-2"
                >
                  <img
                    src={avatarOptions[0].url}
                    alt="Siyam"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 truncate text-[11px]">Siyam Ahmed</p>
                    <p className="text-[10px] text-emerald-800 truncate">Urban Backpacker</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('anika.archaeology@heritage.bd')}
                  className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition-all shadow-2xs flex items-center gap-2"
                >
                  <img
                    src={avatarOptions[2].url}
                    alt="Anika"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 truncate text-[11px]">Dr. Anika</p>
                    <p className="text-[10px] text-amber-800 truncate">Heritage Scholar</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* MODE 1: Mobile SMS OTP */}
          {authTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Bangladesh Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-stone-600 font-bold text-xs pointer-events-none border-r border-stone-200 pr-2">
                        <span className="text-sm">🇧🇩</span>
                        <span>+880</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1712-345678"
                        maxLength={10}
                        required
                        className="w-full pl-22 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Works with all operators: Grameenphone, Banglalink, Robi, Teletalk, Airtel.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Send SMS Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* OTP Verification Screen */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                  {/* Simulated Incoming SMS Banner */}
                  <div className="p-3.5 bg-emerald-900 text-white rounded-xl shadow-md border border-emerald-700 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-200 font-mono">
                      <span>📲 SMS: +880-TOCA-BD</span>
                      <span>Just now</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">
                      Your TOCA verification code is: <strong className="text-amber-300 text-sm tracking-wider">{dispatchedOtp || '849201'}</strong>. Valid for 5 minutes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-2 text-center">
                      Enter 6-Digit Code sent to +880 {phoneNumber}
                    </label>

                    {/* 6 Digit Auto-Advancing Input Boxes */}
                    <div
                      className="flex items-center justify-center gap-2 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold font-mono rounded-xl border-2 border-emerald-600 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>⚡ Auto-fill 849201</span>
                    </button>

                    <span className="text-stone-500 font-mono">
                      {resendTimer > 0 ? (
                        `Resend in ${resendTimer}s`
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const { code } = authService.sendSmsOtp(phoneNumber);
                            setDispatchedOtp(code);
                            setResendTimer(45);
                            showToast(`New SMS code sent!`);
                          }}
                          className="text-emerald-800 font-bold hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setErrorMessage(null);
                    }}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-700 font-medium"
                  >
                    ← Change phone number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: Email & Password */}
          {authTab === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="siyam.gamerx2003@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(email);
                      setAuthTab('forgot');
                    }}
                    className="text-xs text-emerald-800 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Default demo password: <code className="text-emerald-800 font-bold">password123</code>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-700 rounded"
                  />
                  <span>Remember my login on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1 text-xs text-stone-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className="text-emerald-800 font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: New Account Registration */}
          {authTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g. Siyam Ahmed"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Email *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Mobile (+880)</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="1712-345678"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Home Division</label>
                  <select
                    value={homeDivision}
                    onChange={(e) => setHomeDivision(e.target.value as Division)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh'].map(
                      (div) => (
                        <option key={div} value={div}>
                          {div} Division
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Traveler Type</label>
                  <select
                    value={travelerType}
                    onChange={(e) => setTravelerType(e.target.value as TravelerType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Domestic Explorer">Domestic Explorer</option>
                    <option value="Student Backpacker">Student Backpacker</option>
                    <option value="Family Planner">Family Planner</option>
                    <option value="International Tourist">International Tourist</option>
                    <option value="Solo Adventurer">Solo Adventurer</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Select Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedAvatar(opt.url)}
                      className={`p-1 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedAvatar === opt.url
                          ? 'border-emerald-700 ring-2 ring-emerald-400 bg-emerald-50'
                          : 'border-transparent hover:border-stone-200'
                      }`}
                    >
                      <img
                        src={opt.url}
                        alt={opt.label}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-[9px] text-stone-600 font-medium truncate w-full text-center">
                        {opt.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Account & Start Traveling</span>
              </button>

              <div className="text-center text-xs text-stone-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthTab('email')}
                  className="text-emerald-800 font-bold hover:underline"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: Forgot Password */}
          {authTab === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 'input' ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <p className="font-bold">Password Recovery</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter the email or phone number associated with your TOCA account to set a new password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Email or Mobile (+880)
                    </label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                      placeholder="e.g. siyam.gamerx2003@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      New Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Update Password & Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthTab('email')}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-700"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Password Updated!</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      You can now log in with your updated credentials.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthTab('email');
                      setForgotStep('input');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
                  >
                    Sign In Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
