import React, { useState } from 'react';
import { Destination } from '../types';
import { 
  Mountain, 
  Trees, 
  Waves, 
  Landmark, 
  Palmtree, 
  Compass, 
  ShieldCheck,
  Play,
  CloudSun
} from 'lucide-react';

interface DestinationVisualProps {
  destination: Destination;
  className?: string;
  showBadge?: boolean;
  aspect?: 'hero' | 'card' | 'compact';
  activeImageIndex?: number;
}

export const DestinationVisual: React.FC<DestinationVisualProps> = ({
  destination,
  className = '',
  showBadge = true,
  aspect = 'card',
  activeImageIndex = 0,
}) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const primaryImage = destination.images && destination.images[activeImageIndex] 
    ? destination.images[activeImageIndex] 
    : destination.images?.[0];

  const youtubeFallback = destination.shortVideo?.youtubeId
    ? `https://img.youtube.com/vi/${destination.shortVideo.youtubeId}/hqdefault.jpg`
    : null;

  const currentSrc = !imgError && primaryImage
    ? primaryImage.url
    : !fallbackError && youtubeFallback
    ? youtubeFallback
    : null;

  const getCategoryIcon = () => {
    switch (destination.category) {
      case 'Nature':
        return <Trees className="w-5 h-5 text-emerald-300" />;
      case 'Heritage':
        return <Landmark className="w-5 h-5 text-amber-300" />;
      case 'Wildlife & Waterways':
        return <Waves className="w-5 h-5 text-teal-300" />;
      case 'Hills & Adventure':
        return <Mountain className="w-5 h-5 text-sky-300" />;
      case 'Beaches':
        return <Palmtree className="w-5 h-5 text-cyan-300" />;
      default:
        return <Compass className="w-5 h-5 text-emerald-300" />;
    }
  };

  const aspectClass = 
    aspect === 'hero' 
      ? 'h-64 sm:h-80 md:h-96' 
      : aspect === 'compact' 
      ? 'h-32' 
      : 'h-48 sm:h-52';

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    } else {
      setFallbackError(true);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${destination.palette.bgGradient} ${aspectClass} ${className} select-none`}
    >
      {/* Real High-Resolution Photography Layer */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={destination.name_en}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}

      {/* Stylized Resilient SVG Vector Art Fallback Background (Always present as backdrop) */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${imgLoaded && currentSrc ? 'opacity-20' : 'opacity-100'}`}>
        <svg
          className="absolute inset-0 w-full h-full mix-blend-overlay pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M0,320 C150,280 350,380 500,310 C650,240 750,290 800,280 L800,500 L0,500 Z"
            fill="currentColor"
            className="text-white/30"
          />
          <path
            d="M0,240 C200,180 300,260 550,200 C700,160 780,210 800,190 L800,500 L0,500 Z"
            fill="currentColor"
            className="text-white/20"
          />
          <path
            d="M0,160 C120,120 280,180 480,130 C640,90 720,150 800,120 L800,500 L0,500 Z"
            fill="currentColor"
            className="text-white/10"
          />
        </svg>

        {/* Topographic Contour Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Atmospheric Vignette & Contrast Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

      {/* Live Weather Indicator Tag (Top Right) */}
      {destination.weather && showBadge && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white/95 border border-white/20 shadow-sm pointer-events-none">
          <CloudSun className="w-3.5 h-3.5 text-amber-300" />
          <span>{destination.weather.tempC}°C</span>
          <span className="text-white/60 text-[10px] hidden sm:inline">· {destination.weather.condition_en}</span>
        </div>
      )}

      {/* Category Icon & Authentic Badges (Top Left) */}
      {showBadge && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <div className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-sm">
            {getCategoryIcon()}
          </div>
          <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/20">
            {destination.division}
          </span>
          {destination.shortVideo && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>4K Reel</span>
            </span>
          )}
        </div>
      )}

      {/* Bottom Center / Verified Watermark */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white/80 pointer-events-none text-[10px]">
        <span className="flex items-center gap-1 font-mono tracking-wider uppercase text-emerald-300 font-bold drop-shadow">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          {destination.source_name.split('&')[0].trim()}
        </span>
        <span className="font-mono text-white/70">
          {destination.latitude.toFixed(2)}°N, {destination.longitude.toFixed(2)}°E
        </span>
      </div>
    </div>
  );
};
