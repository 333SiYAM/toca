import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-4 sm:py-8 px-2">

      {/* Outer Phone Shell */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-stone-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-white/20 border-4 border-stone-800 flex flex-col overflow-hidden">
        {/* Android Punch Hole & Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-stone-800" />
        </div>

        {/* Inner Screen Canvas */}
        <div className="relative w-full h-full bg-[#F6F4ED] rounded-[36px] overflow-hidden flex flex-col">
          {/* Android Status Bar */}
          <div className="shrink-0 h-8 px-6 pt-1.5 flex items-center justify-between text-[11px] font-semibold text-stone-800 bg-[#F6F4ED]/90 backdrop-blur-sm z-40 select-none">
            <span className="font-mono">10:45</span>
            <div className="flex items-center gap-1.5 text-stone-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Scrollable App Screen Content */}
          <div className="flex-1 overflow-y-auto px-3 pt-2 pb-6">
            {children}
          </div>

          {/* Integrated Phone Bottom Tab Bar */}
          <BottomNav isContainedInFrame={true} />

          {/* Android Gesture Pill Navigation Handle */}
          <div className="shrink-0 h-4 bg-white flex items-center justify-center pb-1">
            <div className="w-28 h-1 bg-stone-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
