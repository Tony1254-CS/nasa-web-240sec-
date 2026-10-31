import React, { useState } from 'react';
import { Columns, Split, Calendar } from 'lucide-react';

interface SwipeCompareProps {
  dateA: string;
  dateB: string;
}

export const SwipeCompareMap: React.FC<SwipeCompareProps> = ({ dateA, dateB }) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDualSplit, setIsDualSplit] = useState<boolean>(false);

  return (
    <div className="absolute inset-0 z-15 pointer-events-none flex flex-col justify-end">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-xs">
        <div className="flex items-center space-x-1 text-xs font-semibold text-[#102A43]">
          <Calendar className="w-3.5 h-3.5 text-[#155E75]" />
          <span>Before: <strong className="font-mono text-[#155E75]">{dateA}</strong></span>
          <span className="text-[#94A3B8] px-1">vs</span>
          <span>After: <strong className="font-mono text-[#0284C7]">{dateB}</strong></span>
        </div>

        <div className="h-4 w-px bg-[#CBD5E1]" />

        <button
          onClick={() => setIsDualSplit(!isDualSplit)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            isDualSplit ? 'bg-[#155E75] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
          title="Toggle Split-Screen vs Swipe Slider"
        >
          {isDualSplit ? <Columns className="w-3.5 h-3.5" /> : <Split className="w-3.5 h-3.5" />}
          <span>{isDualSplit ? 'Split View' : 'Swipe Mode'}</span>
        </button>
      </div>

      {/* Swipe Divider Bar (When in swipe mode) */}
      {!isDualSplit && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-auto flex items-center justify-center cursor-ew-resize select-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] border-l border-r border-[#155E75]" />

          <div
            className="absolute w-8 h-8 rounded-full bg-white border-2 border-[#155E75] shadow-md flex items-center justify-center text-[#155E75] text-[10px] font-bold"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startPos = sliderPos;
              const onMouseMove = (moveEv: MouseEvent) => {
                const delta = moveEv.clientX - startX;
                const containerWidth = window.innerWidth;
                const newPos = Math.max(10, Math.min(90, startPos + (delta / containerWidth) * 100));
                setSliderPos(newPos);
              };
              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };
              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          >
            ↔
          </div>
        </div>
      )}

      {/* Date Labels on Map Sides */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-xs">
        {dateA} (Pre-Peak Inundation)
      </div>
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-xs">
        {dateB} (Post-Monsoon Transition)
      </div>
    </div>
  );
};
