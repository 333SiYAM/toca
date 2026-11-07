import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client with 'aistudio-build' User-Agent per guidelines
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('GoogleGenAI client initialized successfully with GEMINI_API_KEY');
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY in environment. Intelligent Bangladesh Travel Engine fallback active.');
}

const SYSTEM_INSTRUCTION = `You are "TOCA Travel AI" — the official, friendly, and highly knowledgeable Bangladesh Travel & Safe Exploration Assistant.
Your mission is to provide accurate, real-time travel recommendations, safety advisories, weather guidance, transport instructions, budgeting in BDT, and cultural tips for travelers exploring Bangladesh.

Core Knowledge Base:
1. Top Destinations:
   - Sreemangal & Lawachara Forest (Tea gardens, hoolock gibbons, 7-layer tea at Nilkantha cabin, Finlay estates, cycling trails, leech socks in wet season).
   - Sundarbans Mangrove Forest (World Heritage, Royal Bengal Tigers, dolphin sanctuaries, registered launch/trawler boats from Khulna/Mongla, mandatory armed forest guards).
   - Sajek Valley & Rungmoy (Khagrachhari hill tract, sea of clouds, Konglak Para, Army convoy escorts strictly at 10:00 AM & 03:00 PM from Dighinala, 4WD Chander Gari jeep).
   - Cox's Bazar & Marine Drive (World's longest unbroken natural sea beach 120km, Himchari hills, Inani coral beach, maritime flags: Green=safe, Red=danger/high surf).
   - Saint Martin's Island & Chera Dwip (Coral island, ships run Nov-March from Teknaf/Nuniyar, fresh coconuts, scuba & snorkeling, eco-rules against coral removal).
   - Tanguar Haor & Sunamganj (Ramsar wetland, luxury wooden houseboats from Tahirpur ghat, Shimul Bagan, Jadukata river, life jackets mandatory).
   - Old Dhaka & Lalbagh Fort (Mughal heritage, Ahsan Manzil Pink Palace, Armenian Church, Tara Masjid, Bakarkhani, Star Kabab, Haji Biryani, rickshaws).
   - Somapura Mahavihara at Paharpur (8th-century UNESCO Buddhist vihara in Naogaon/Rajshahi).
   - Sixty Dome Mosque in Bagerhat (15th-century Khan Jahan Ali terracotta architecture).
   - Kuakata Beach (Daughter of the Sea in Patuakhali, sunrise and sunset from the same beach, Gangamati mangrove).
   - Nilgiri & Thanchi (Bandarban highest hill peaks, cloud viewpoints, Nafakhum waterfalls, indigenous Marma/Murong culture).
   - Birisiri & Shomeshwari River (Ceramic lake with turquoise water, Garo indigenous culture in Netrokona).
   - Kantajew Temple (Exquisite terracotta temple in Dinajpur).

2. Safe Travel & Weather Advisories:
   - Monsoon Season (June - September): Heavy rain & flash floods in haor/hilly areas. Slippery trails; carry waterproof bags & umbrellas. Avoid small non-decked river boats.
   - Cyclone Warnings: Bay of Bengal cyclones (May-June & Oct-Nov). Strictly monitor Bangladesh Meteorological Department (BMD) warning signals 1 to 10.
   - Winter Season (Nov - Feb): Best travel season (12°C–26°C), crisp morning fog. Note: dense fog can delay Padma/Jamuna river launches & morning flights.
   - Summer Season (March - May): Warm & humid (30°C–38°C). Carry hydration electrolytes, sun hats, mineral water.

3. Emergency Contacts:
   - National Emergency: 999 (Police, Ambulance, Fire)
   - Bangladesh Tourist Police Hotline: 01320-160000 / 01769-690740
   - Disaster Warning Hotline: 1090
   - Railway Information: 131 / Bangladesh Railway app

4. Language:
   - Respond in English or Bengali (বাংলা) depending on what language the user asks in, or provide bilingual key terms.
   - Be concise, structured, warm, and encourage respectful eco-tourism! Use bullet points, bold key spots, and mention estimated costs in BDT (৳).`;

// Fallback generator for smart offline/unkeyed responses
function generateFallbackTravelResponse(prompt: string, language: 'en' | 'bn'): string {
  const p = prompt.toLowerCase();
  const isBn = language === 'bn' || /[\u0980-\u09FF]/.test(prompt);

  if (p.includes('sajek') || p.includes('সাজেক')) {
    if (isBn) {
      return `### 🌄 সাজেক ভ্যালি ভ্রমণ ও নিরাপত্তা গাইড
**বর্তমান আবহাওয়া ও নিরাপত্তা:**
- **আর্মি কনভয় সময়সূচি:** দীঘিনালা থেকে সকাল ১০:০০ এবং দুপুর ০৩:০০ টায় কনভয় ছাড়া হয়। কনভয় ছাড়া কোনো চান্দের গাড়ি সাজেক প্রবেশ করতে পারে না।
- **উপযুক্ত সময়:** অক্টোবর থেকে মার্চ (মেঘের ভেলা দেখার সেরা সময়)।
- **নিরাপত্তা টিপস:** পাহাড়ি আঁকাবাঁকা রাস্তায় অভিজ্ঞ চালকযুক্ত চান্দের গাড়ি নিন। কংলাক পাহাড়ে ওঠার সময় গ্রিপযুক্ত জুতো পরুন।
- **আনুমানিক বাজেট:** জনপ্রতি ৪,৫০০ - ৮,০০০ টাকা (২ রাত ৩ দিন)।`;
    }
    return `### 🌄 Sajek Valley Travel & Safety Guide
**Current Safety & Travel Notice:**
- **Army Convoy Timing:** Chander Gari jeeps depart Dighinala strictly with military escort at **10:00 AM** and **03:00 PM**. Do not miss the convoy.
- **Best Season:** October to March for the famous "sea of clouds" rolling below your balcony.
- **Safety Tips:** Hire an authorized Chander Gari driver. Wear shoes with deep tread when climbing Konglak Para. Bring power banks and cash (ATMs are rare on the hilltop).
- **Estimated Budget:** BDT 4,500 – 8,500 per person (2 Nights / 3 Days).`;
  }

  if (p.includes('sundarban') || p.includes('সুন্দরবন')) {
    if (isBn) {
      return `### 🐅 সুন্দরবন ম্যানগ্রোভ ট্যুর ও নিরাপত্তা গাইড
- **বনবিভাগ নিরাপত্তা নিয়ম:** প্রতি ট্যুরিস্ট বোটে বনবিভাগের লাইসেন্সপ্রাপ্ত দুজন সশস্ত্র বনরক্ষী থাকা বাধ্যতামূলক।
- **সেরা সময়:** নভেম্বর থেকে ফেব্রুয়ারি। এই সময়ে নদী শান্ত থাকে ও হরিণ-বাঘ দেখার সম্ভাবনা বেশি।
- **গুরুত্বপূর্ণ পরামর্শ:** দলছুট হয়ে গভীরে যাবেন না। নদীতে জোয়ার-ভাটার সময় লক্ষ্য রাখুন এবং লাইফ জ্যাকেট ব্যবহার করুন।
- **বাজেট:** খুলনা/মোংলা থেকে ৩ দিনের প্যাকেজ ৮,০০০ - ১৫,০০০ টাকা।`;
    }
    return `### 🐅 Sundarbans Mangrove Forest Safety & Tour Guide
- **Safety Regulations:** Every tourist vessel must hire licensed armed forest guards from the Forest Department at Mongla or Khulna ghats.
- **Best Travel Window:** November to February when winter waters are calm and wildlife sighting (spotted deer, crocodiles, Bengal tigers) is highest.
- **Safety Advisory:** Never wander off designated wooden boardwalks at Kotka or Harbaria. Life jackets are mandatory on open water.
- **Tour Cost:** BDT 8,000 – 16,000 per person for an all-inclusive 3-day boat expedition.`;
  }

  if (p.includes('weather') || p.includes('আবহাওয়া') || p.includes('safe') || p.includes('নিরাপদ')) {
    if (isBn) {
      return `### 🌦️ বাংলাদেশ ভ্রমণ আবহাওয়া ও নিরাপত্তা সতর্কতা
- **বর্তমান অবস্থা:** বাংলাদেশের অধিকাংশ অঞ্চলে আবহাওয়া ভ্রমণের অনুকূল (তাপমাত্রা প্রায় ২৫°–৩২° সে.)।
- **পাহাড় ও নদী সতর্কতা:** পাহাড়ি অঞ্চলে (সাজেক, বান্দরবান) বৃষ্টির সময় ধসের ঝুঁকি থাকে। মেঘলা আবহাওয়ায় নৌযানে অবশ্যই লাইফ জ্যাকেট রাখুন।
- **জরুরি হটলাইন:**
  - জাতীয় জরুরি সেবা: **৯৯৯**
  - ট্যুরিস্ট পুলিশ বাংলাদেশ: **০১৩২০-১৬০০০০**`;
    }
    return `### 🌦️ Bangladesh Travel Weather & Safety Briefing
- **Current Conditions:** Generally optimal travel weather across major divisions (25°C – 32°C).
- **Sea & River Precautions:** For Cox's Bazar, Kuakata, and haor houseboats, follow local maritime safety flags. Always wear certified life jackets on speedboats and wooden launches.
- **Hilly Trails:** Sajek and Bandarban trails require footwear with good traction during rainy spells.
- **Emergency Lifelines:**
  - National Emergency: **999**
  - Tourist Police Bangladesh Hotline: **01320-160000**`;
  }

  if (p.includes('sreemangal') || p.includes('শ্রীমঙ্গল') || p.includes('sylhet') || p.includes('সিলেট')) {
    if (isBn) {
      return `### 🍵 শ্রীমঙ্গল ও সিলেট চা বাগান ভ্রমণ টিপস
- **যাতায়াত:** ঢাকা কমলাপুর থেকে পারাবত, জয়ন্তিকা বা উপবন এক্সপ্রেস ট্রেনে মাত্র ৪.৫ ঘণ্টায় শ্রীমঙ্গল পৌঁছানো যায় (ভাড়া ৩৫০–৮০০ টাকা)।
- **দর্শনীয় স্থান:** লাউয়াছড়া জাতীয় উদ্যান (উল্লুক বানর), ফিনলে চা বাগান, বাইক্কা বিল এবং নীলকণ্ঠ সাতরঙা চা।
- **নিরাপত্তা পরামর্শ:** বনে জোঁক প্রতিরোধী মোজা বা লবণ সাথে রাখুন। সকাল সকাল পাখি দেখার জন্য বের হোন।
- **খাবার:** বিখ্যাত সাতকড়া গরুর মাংস এবং স্থানীয় মণিপুরী মিষ্টি আস্বাদন করতে ভুলবেন না!`;
    }
    return `### 🍵 Sreemangal & Sylhet Tea Garden Expedition
- **Transport:** Direct intercity train (Parabat, Jayantika, Upaban Express) from Dhaka Kamalapur to Sreemangal in 4.5 hours (BDT 350 – 850).
- **Top Highlights:** Lawachara National Park (home to Western Hoolock Gibbons), Finlay & Zareen terraced tea hills, Baikka Beel wetland bird sanctuary, and the iconic Nilkantha 7-layer tea.
- **Safety Tips:** Leeches are common in damp forest leaves; carry salt or anti-leech socks. Rent a bicycle for serene morning rides through tea estates!
- **Local Food:** Try authentic Shatkora beef and fresh Sylheti tea.`;
  }

  if (p.includes('cox') || p.includes('কক্সবাজার') || p.includes('beach') || p.includes('সমুদ্র')) {
    if (isBn) {
      return `### 🌊 কক্সবাজার ও মেরিন ড্রাইভ ভ্রমণ গাইড
- **সমুদ্র নিরাপত্তা:** সৈকতে নামার আগে লাইফগার্ডদের লাল/সবুজ পতাকা দেখুন। লাল পতাকা থাকা অবস্থায় গভীরে নামা সম্পূর্ণ নিষিদ্ধ।
- **মেরিন ড্রাইভ ড্রাইভ:** খোলা চাঁদের গাড়ি বা অটো নিয়ে ৮০ কিমি মেরিন ড্রাইভে হিমছড়ি ও ইনানী পাথুরে সৈকত ঘুরে দেখুন।
- **যাতায়াত:** ঢাকা থেকে নতুন আধুনিক কক্সবাজার এক্সপ্রেস বা পর্যটক এক্সপ্রেস ট্রেনের মাধ্যমে আরামদায়ক ভ্রমণ সম্ভব।
- **বাজেট:** ২ রাত ৩ দিন ৭,০০০ – ১২,০০০ টাকা।`;
    }
    return `### 🌊 Cox's Bazar & Marine Drive Coastal Guide
- **Beach Safety:** Always follow lifeguard warning flags. Never enter the water during high tide or red flag warnings.
- **Marine Drive:** Take an open-roof auto or jeep along the breathtaking 80km Marine Drive to Himchari and Inani Coral Beach.
- **Train Route:** Direct non-stop trains (Cox's Bazar Express / Parjatak Express) run from Dhaka with world-class oyster-shaped railway station amenities.
- **Budget:** BDT 7,000 – 14,000 per person for a 3-day beach retreat.`;
  }

  // General helpful response
  if (isBn) {
    return `### 🇧🇩 টোকা এআই ভ্রমণ সহচর
আপনার বাংলাদেশ ভ্রমণকে নিরাপদ ও আনন্দময় করতে আমি প্রস্তুত!
- **নিরাপদ যাতায়াত:** আন্তঃনগর ট্রেন ও দূরপাল্লার গ্রিন লাইন/শ্যামলী বাসের অগ্রিম টিকিট কাটুন।
- **আবহাওয়া পরামর্শ:** বর্তমান মৌসুমে হালকা পোশাক, ছাতা ও ফিল্টার করা পানির বোতল সাথে রাখুন।
- **জরুরি সহায়তা:** বাংলাদেশ ট্যুরিস্ট পুলিশ সর্বদা পর্যটকদের সেবায় নিয়োজিত (হটলাইন: ০১৩২০-১৬০০০০)।

আপনি নির্দিষ্ট কোনো স্থান (যেমন: সাজেক, শ্রীমঙ্গল, সুন্দরবন, কক্সবাজার, সেন্টমার্টিন বা পুরান ঢাকা) সম্পর্কে জানতে চাইলে নির্দ্বিধায় জিজ্ঞাসা করুন!`;
  }

  return `### 🇧🇩 TOCA AI Bangladesh Travel Companion
I am your dedicated real-time travel and safety advisor for Bangladesh!
- **Safe Journey Checklist:** Book intercity train tickets in advance via Bangladesh Railway/Shohoz. Keep verified ID and emergency contacts handy.
- **Weather Advisory:** Check real-time weather in our app before heading out to coastal or mountain hill tracts.
- **Top Inquiries:**
  - 🌄 **Sajek Valley:** Convoy timing (10 AM & 3 PM) and jeep rentals.
  - 🍵 **Sreemangal:** Tea estates, cycling trails, and Lawachara rainforest.
  - 🐅 **Sundarbans:** Certified river launches and armed guard safety rules.
  - 🌊 **Cox's Bazar:** Marine drive routes and beach lifeguard flags.
  - 🛶 **Tanguar Haor:** Houseboat bookings in Sunamganj.

Ask me about itineraries, exact costs in BDT, local delicacies, or safety advisories for any location!`;
}

// POST /api/chat — Real-time AI Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], language = 'en', locationContext = '' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Try Gemini API if client is available
    if (aiClient) {
      try {
        const fullPrompt = `${SYSTEM_INSTRUCTION}

User Language Preference: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}
User Current Location / Selected Place Context: ${locationContext || 'General Bangladesh'}

User Inquiry: ${message}`;

        const geminiResponse = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });

        const replyText = geminiResponse.text || '';
        if (replyText.trim()) {
          // Identify recommended destinations to show interactive cards in UI
          const recommendedDestinationIds: string[] = [];
          const lower = replyText.toLowerCase();
          if (lower.includes('sreemangal') || lower.includes('lawachara')) recommendedDestinationIds.push('sreemangal-tea-gardens');
          if (lower.includes('sundarban')) recommendedDestinationIds.push('sundarbans-mangrove');
          if (lower.includes('sajek')) recommendedDestinationIds.push('sajek-valley');
          if (lower.includes("cox's bazar") || lower.includes('inani')) recommendedDestinationIds.push('coxs-bazar-beach');
          if (lower.includes('saint martin') || lower.includes('chera dwip')) recommendedDestinationIds.push('saint-martins-island');
          if (lower.includes('tanguar haor') || lower.includes('sunamganj')) recommendedDestinationIds.push('tanguar-haor');
          if (lower.includes('lalbagh')) recommendedDestinationIds.push('lalbagh-fort');
          if (lower.includes('ahsan manzil')) recommendedDestinationIds.push('ahsan-manzil');
          if (lower.includes('paharpur') || lower.includes('somapura')) recommendedDestinationIds.push('paharpur-vihara');
          if (lower.includes('sixty dome') || lower.includes('shat gombuj')) recommendedDestinationIds.push('sixty-dome-mosque');
          if (lower.includes('kuakata')) recommendedDestinationIds.push('kuakata-beach');
          if (lower.includes('nilgiri') || lower.includes('bandarban')) recommendedDestinationIds.push('nilgiri-bandarban');

          res.json({
            reply: replyText,
            recommendedDestinationIds: Array.from(new Set(recommendedDestinationIds)),
            source: 'gemini-2.5-flash',
          });
          return;
        }
      } catch (geminiError: any) {
        console.warn('Gemini generateContent call failed, using intelligent travel engine:', geminiError?.message || geminiError);
      }
    }

    // Fallback response with rich travel advice
    const fallbackReply = generateFallbackTravelResponse(message, language);
    const recommendedDestinationIds: string[] = [];
    const lower = message.toLowerCase();
    if (lower.includes('sreemangal')) recommendedDestinationIds.push('sreemangal-tea-gardens');
    if (lower.includes('sundarban')) recommendedDestinationIds.push('sundarbans-mangrove');
    if (lower.includes('sajek')) recommendedDestinationIds.push('sajek-valley');
    if (lower.includes('cox')) recommendedDestinationIds.push('coxs-bazar-beach');
    if (lower.includes('martin')) recommendedDestinationIds.push('saint-martins-island');
    if (lower.includes('tanguar')) recommendedDestinationIds.push('tanguar-haor');

    res.json({
      reply: fallbackReply,
      recommendedDestinationIds,
      source: 'toca-travel-engine',
    });
  } catch (err: any) {
    console.error('Server error in /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process chat query',
      reply: 'An error occurred while generating suggestions. Please check emergency contacts or try again.',
    });
  }
});

// GET /api/weather — Proxy for weather data with safe error handling
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ error: 'lat and lon are required' });
      return;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FDhaka`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather upstream returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'Failed to fetch weather' });
  }
});

// GET /api/config/maps — Expose Google Maps Platform key if configured
app.get('/api/config/maps', (req: Request, res: Response) => {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  res.json({ apiKey });
});

// GET /api/download-source — Download complete project source code archive
app.get('/api/download-source', (req: Request, res: Response) => {
  const archivePath = path.resolve(__dirname, 'public', 'toca-bangladesh-source.tar.gz');
  res.download(archivePath, 'toca-bangladesh-project.tar.gz', (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Source archive not found' });
    }
  });
});

// Vite Integration: Dev vs Production
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TOCA Server running on http://0.0.0.0:${PORT} [mode: ${process.env.NODE_ENV || 'development'}]`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
