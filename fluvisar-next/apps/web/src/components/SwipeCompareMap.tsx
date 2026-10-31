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
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-lg">
        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-[#F1F5F9] p-0.5 rounded border border-[#E2E8F0] text-xs">
          <button
            onClick={() => setComparisonMode('dates')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium transition-colors ${
              comparisonMode === 'dates'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare flood peak vs recession dates"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dates</span>
          </button>
          <button
            onClick={() => setComparisonMode('sensors')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium transition-colors ${
              comparisonMode === 'sensors'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare Real Optical Satellite vs NISAR Radar SAR Backscatter"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satellite vs SAR</span>
          </button>
        </div>

        <div className="h-4 w-px bg-[#CBD5E1]" />

        {/* Dynamic Label Header */}
        <div className="flex items-center space-x-1 text-xs font-semibold text-[#102A43]">
          {comparisonMode === 'dates' ? (
            <>
              <span>Left: <strong className="font-mono text-[#155E75]">{dateA}</strong></span>
              <span className="text-[#94A3B8] px-1">vs</span>
              <span>Right: <strong className="font-mono text-[#0284C7]">{dateB}</strong></span>
            </>
          ) : (
            <>
              <span className="text-[#0D9488]">Left: <strong>🛰️ Satellite Photo</strong></span>
              <span className="text-[#94A3B8] px-1">vs</span>
              <span className="text-[#0284C7]">Right: <strong>📡 NISAR SAR Mask</strong></span>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-[#CBD5E1]" />

        <button
          onClick={() => setIsDualSplit(!isDualSplit)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            isDualSplit ? 'bg-[#155E75] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
          title="Toggle Split-Screen vs Swipe Slider"
        >
          {isDualSplit ? <Columns className="w-3.5 h-3.5" /> : <Split className="w-3.5 h-3.5" />}
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
          {/* Vertical Split Line */}
          <div className="w-1 h-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] border-l border-r border-[#155E75]" />

          {/* Draggable Circle Knob */}
          <div
            className="absolute w-9 h-9 rounded-full bg-white border-2 border-[#155E75] shadow-xl flex items-center justify-center text-[#155E75] text-xs font-bold hover:scale-110 active:scale-95 transition-transform"
            title="Drag left or right to swipe compare"
          >
            ↔
          </div>
        </div>
      )}

      {/* Date & Sensor Labels on Map Sides */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-md flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-[#155E75]" />
        <span>
          {comparisonMode === 'dates'
            ? `${dateA} (Pre-Peak Inundation)`
            : '🛰️ Real Satellite Imagery (Esri / USGS / NASA)'}
        </span>
      </div>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-bold text-[#102A43] shadow-md flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
        <span>
          {comparisonMode === 'dates'
            ? `${dateB} (Post-Monsoon Recession & Erosion)`
            : '📡 NASA NISAR SAR Backscatter & Water Mask'}
        </span>
      </div>
    </div>
  );
};
