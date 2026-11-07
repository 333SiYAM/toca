import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { DESTINATIONS } from '../data/destinations';
import { Destination } from '../types';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  CloudSun,
  MapPin,
  ExternalLink,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedDestinations?: Destination[];
  source?: string;
}

const QUICK_PROMPTS = [
  {
    en: 'Is Sajek Valley safe to travel right now and what is the army convoy time?',
    bn: 'সাজেক ভ্যালি ভ্রমণের বর্তমান নিরাপত্তা এবং আর্মি কনভয় সময় কখন?',
    icon: '🌄',
  },
  {
    en: 'Suggest a 3-day Sreemangal & Sylhet tea garden trip under 10,000 BDT',
    bn: '১০,০০০ টাকার মধ্যে ৩ দিনের শ্রীমঙ্গল ও সিলেট চা বাগান ভ্রমণ পরিকল্পনা দিন',
    icon: '🍵',
  },
  {
    en: 'Sundarbans tour: boat safety, armed guards & best season',
    bn: 'সুন্দরবন ভ্রমণ: নৌ-নিরাপত্তা, বনরক্ষী ও ভ্রমণের সেরা সময়',
    icon: '🐅',
  },
  {
    en: 'Cox’s Bazar beach safety, red flags and Marine Drive route',
    bn: 'কক্সবাজার সমুদ্র সৈকত নিরাপত্তা, লাল পতাকা এবং মেরিন ড্রাইভ রুট',
    icon: '🌊',
  },
  {
    en: 'How to book intercity train tickets in Bangladesh from Dhaka?',
    bn: 'ঢাকা থেকে আন্তঃনগর ট্রেনের টিকিট কীভাবে সহজ অ্যাপে কাটব?',
    icon: '🚂',
  },
  {
    en: 'Tanguar Haor houseboat tour safety rules & budget',
    bn: 'টাঙ্গুয়ার হাওর হাউসবোট ভ্রমণের নিরাপত্তা নিয়ম ও বাজেট',
    icon: '🛶',
  },
];

export const AiChatbotModal: React.FC = () => {
  const { language } = useLanguage();
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    chatInitialPrompt,
    setSelectedDestination,
    setIsWeatherModalOpen,
  } = useApp();

  const [chatLanguage, setChatLanguage] = useState<'en' | 'bn'>(language);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'ai',
      text:
        language === 'bn'
          ? 'নমস্কার / আসসালামু আলাইকুম! আমি টোকা এআই — আপনার সার্বক্ষণিক বাংলাদেশ ভ্রমণ ও নিরাপত্তা পরামর্শক।\n\nযাতায়াত, বাজেট (BDT), দর্শনীয় স্থান, লাইভ আবহাওয়া বা পাহাড়ি/নৌ নিরাপত্তা সংক্রান্ত যেকোনো প্রশ্ন করুন!'
          : 'Welcome! I am TOCA AI — your real-time Bangladesh travel & safe exploration assistant.\n\nAsk me about verified itineraries, BDT budgets, train/bus routes, live weather alerts, or safety advisories for any division!',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle incoming initial prompt from context (e.g. from destination card or weather modal)
  useEffect(() => {
    if (chatInitialPrompt && isAiChatOpen) {
      handleSendMessage(chatInitialPrompt);
    }
  }, [chatInitialPrompt, isAiChatOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: chatLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'I am ready to assist with your Bangladesh trip!';
      const recommendedDestIds: string[] = data.recommendedDestinationIds || [];

      // Find matching destinations to show interactive cards
      const matchedDests = DESTINATIONS.filter((d) => recommendedDestIds.includes(d.id));

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDestinations: matchedDests,
        source: data.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Helpful fallback message
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text:
          chatLanguage === 'bn'
            ? '### 🇧🇩 টোকা ভ্রমণ পরামর্শ\n- **জরুরি হটলাইন:** ৯৯৯ (জাতীয় জরুরি সেবা) ও ০১৩২০-১৬০০০০ (বাংলাদেশ ট্যুরিস্ট পুলিশ)।\n- সাজেক, কক্সবাজার বা সুন্দরবনের রিয়েল-টাইম আবহাওয়া ও পর্যটন তথ্য জানতে নিচের বাটনগুলোতে চাপুন!'
            : '### 🇧🇩 TOCA Travel Advisory\n- **Emergency Lifelines:** Dial 999 for National Emergency and 01320-160000 for Tourist Police.\n- Feel free to click on any suggested topic below for instant guidance!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-welcome',
        sender: 'ai',
        text:
          chatLanguage === 'bn'
            ? 'নতুন চ্যাট শুরু হয়েছে! আপনার পছন্দের গন্তব্য বা ভ্রমণের পরিকল্পনা সম্পর্কে জানতে চান?'
            : 'New session started! Which destination or safety advisory would you like to explore today?',
        timestamp: 'Just now',
      },
    ]);
  };

  if (!isAiChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl h-[88vh] max-h-[750px] bg-[#FDFBF7] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-stone-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-chat-title"
      >
        {/* Header */}
        <div className="bg-[#173B2E] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/90 flex items-center justify-center border border-emerald-600/50 shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#173B2E] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-chat-title" className="font-bold text-sm sm:text-base tracking-tight">
                  TOCA Travel AI
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Real-time & Weather Aware
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                {chatLanguage === 'bn'
                  ? 'বাংলাদেশ ভ্রমণ, আবহাওয়া ও নিরাপত্তা সহচর'
                  : 'Real-time Bangladesh travel, safety & weather guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <button
              onClick={() => setChatLanguage((prev) => (prev === 'en' ? 'bn' : 'en'))}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors"
              title="Toggle Bengali / English"
            >
              {chatLanguage === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* Clear history */}
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              onClick={() => setIsAiChatOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Weather & Safety Quick Link Strip */}
        <div className="bg-emerald-950/80 text-emerald-100 px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">
              {chatLanguage === 'bn'
                ? '৮ বিভাগের লাইভ আবহাওয়া ও পর্যটন সতর্কতা সক্রিয়'
                : 'Live weather & safe travel status active across all 8 divisions'}
            </span>
          </div>
          <button
            onClick={() => {
              setIsAiChatOpen(false);
              setIsWeatherModalOpen(true);
            }}
            className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>View Weather</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? 'bg-[#173B2E] text-amber-300 border border-emerald-700/60 shadow-xs'
                      : 'bg-stone-700 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white text-stone-800 border border-stone-200/80 shadow-2xs'
                      : 'bg-[#173B2E] text-white rounded-tr-none'
                  }`}
                >
                  {/* Markdown-like whitespace and formatting */}
                  <div className="whitespace-pre-wrap space-y-1.5 font-normal">
                    {msg.text}
                  </div>

                  {/* Embedded interactive destination cards if AI recommended spots */}
                  {msg.recommendedDestinations && msg.recommendedDestinations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Recommended Spots in TOCA:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.recommendedDestinations.map((dest) => (
                          <button
                            key={dest.id}
                            onClick={() => {
                              setIsAiChatOpen(false);
                              setSelectedDestination(dest);
                            }}
                            className="p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-all flex items-center justify-between group"
                          >
                            <div className="truncate mr-2">
                              <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-900 truncate">
                                {chatLanguage === 'bn' ? dest.name_bn : dest.name_en}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate">
                                {dest.division} · ৳{dest.budget_min_bdt.toLocaleString()}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 ${
                      isAi ? 'text-stone-400 text-right' : 'text-emerald-200/70 text-right'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-[#173B2E] text-amber-300 flex items-center justify-center border border-emerald-700/60 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-stone-200/80 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-stone-500 font-medium ml-1">
                  {chatLanguage === 'bn' ? 'তথ্য যাচাই ও অনুসন্ধান করা হচ্ছে...' : 'Analyzing Bangladesh travel data...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-stone-100/90 border-t border-stone-200 shrink-0">
          <div className="text-[11px] font-bold text-stone-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-700" />
            <span>{chatLanguage === 'bn' ? 'জনপ্রিয় প্রশ্নসমূহ:' : 'Popular Questions & Suggestions:'}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {QUICK_PROMPTS.map((prompt, idx) => {
              const text = chatLanguage === 'bn' ? prompt.bn : prompt.en;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(text)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium shrink-0 flex items-center gap-1.5 shadow-2xs hover:border-emerald-600 transition-colors"
                >
                  <span>{prompt.icon}</span>
                  <span className="truncate max-w-[220px]">{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              chatLanguage === 'bn'
                ? 'সাজেক, সুন্দরবন, আবহাওয়া বা বাজেট নিয়ে প্রশ্ন লিখুন...'
                : 'Ask about Sajek, Sundarbans, safe travel weather, train routes...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="min-h-[42px] px-4 rounded-xl bg-[#173B2E] hover:bg-[#225744] disabled:opacity-40 disabled:hover:bg-[#173B2E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
