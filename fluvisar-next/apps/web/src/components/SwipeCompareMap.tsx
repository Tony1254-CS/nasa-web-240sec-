import React from 'react';
import { Columns, Split, Calendar, Layers } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SwipeCompareProps {
  dateA: string;
  dateB: string;
}

export const SwipeCompareMap: React.FC<SwipeCompareProps> = ({ dateA, dateB }) => {
  const { swipePosition, setSwipePosition, comparisonMode, setComparisonMode } = useWorkspaceStore();
  const [isDualSplit, setIsDualSplit] = React.useState<boolean>(false);

  return (
    <div className="absolute inset-0 z-15 pointer-events-none flex flex-col justify-end">
      {/* Top Center Controls Overlay (Compact, non-overlapping) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#CBD5E1] shadow-md text-xs">
        {/* Mode Selector */}
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded border border-[#E2E8F0]">
          <button
            onClick={() => setComparisonMode('dates')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              comparisonMode === 'dates'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare Flood Peak (Aug 26) vs Post-Flood Erosion (Sep 19)"
          >
            <Calendar className="w-3 h-3" />
            <span>Dates</span>
          </button>
          <button
            onClick={() => setComparisonMode('sensors')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              comparisonMode === 'sensors'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare Real Satellite Photo vs NISAR Radar SAR Backscatter"
          >
            <Layers className="w-3 h-3" />
            <span>Satellite vs SAR</span>
          </button>
        </div>

        <div className="h-4 w-px bg-[#CBD5E1]" />

        {/* Swipe vs Split Toggle */}
        <button
          onClick={() => setIsDualSplit(!isDualSplit)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
            isDualSplit ? 'bg-[#155E75] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
          title="Toggle Split-Screen vs Swipe Slider"
        >
          {isDualSplit ? <Columns className="w-3 h-3" /> : <Split className="w-3 h-3" />}
          <span>{isDualSplit ? 'Split' : 'Swipe'}</span>
        </button>
      </div>

      {/* Swipe Divider Bar (When in swipe mode) */}
      {!isDualSplit && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-auto flex items-center justify-center cursor-ew-resize select-none"
          style={{ left: `${swipePosition}%` }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startPos = swipePosition;
            const onMouseMove = (moveEv: MouseEvent) => {
              const delta = moveEv.clientX - startX;
              const containerWidth = window.innerWidth;
              const newPos = Math.max(5, Math.min(95, startPos + (delta / containerWidth) * 100));
              setSwipePosition(Math.round(newPos));
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startPos = swipePosition;
            const onTouchMove = (moveEv: TouchEvent) => {
              const t = moveEv.touches[0];
              const delta = t.clientX - startX;
              const containerWidth = window.innerWidth;
              const newPos = Math.max(5, Math.min(95, startPos + (delta / containerWidth) * 100));
              setSwipePosition(Math.round(newPos));
            };
            const onTouchEnd = () => {
              window.removeEventListener('touchmove', onTouchMove);
              window.removeEventListener('touchend', onTouchEnd);
            };
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
          }}
        >
          {/* Vertical Divider Line with Glow */}
          <div className="w-1 h-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.7)] border-l border-r border-[#155E75]" />

          {/* Draggable Circle Knob */}
          <div
            className="absolute w-9 h-9 rounded-full bg-white border-2 border-[#155E75] shadow-2xl flex items-center justify-center text-[#155E75] text-xs font-black hover:scale-110 active:scale-95 transition-transform"
            title="Drag left or right to swipe compare"
          >
            ↔
          </div>
        </div>
      )}

      {/* Date & Sensor Badges at Bottom Corners */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-md flex items-center space-x-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#155E75]" />
        <span>
          {comparisonMode === 'dates'
            ? `Before: ${dateA} (Flood Peak — Stage 18.9m)`
            : 'Left: 🛰️ High-Res Satellite Photo (Esri / NASA)'}
        </span>
      </div>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-md flex items-center space-x-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <span>
          {comparisonMode === 'dates'
            ? `After: ${dateB} (Recession & 145.8 ha Active Erosion)`
            : 'Right: 📡 NISAR SAR Microwave Radar Mask'}
        </span>
      </div>
    </div>
  );
};
