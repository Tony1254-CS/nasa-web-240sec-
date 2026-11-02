import React, { useRef } from 'react';
import { Columns, Split, Calendar, Layers } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SwipeCompareProps {
  dateA: string;
  dateB: string;
}

const DATE_METRICS: Record<string, { stage: string; desc: string; descBn: string }> = {
  '2026-06-23': { stage: '14.1m', desc: 'Early Monsoon (Lean Channel)', descBn: 'প্রাক-মনসুন স্বাভাবিক প্রবাহ — ১৪.১মি' },
  '2026-07-17': { stage: '16.2m', desc: 'Monsoon Onset (Rising Channel)', descBn: 'মনসুন প্লাবন শুরু — ১৬.২মি' },
  '2026-08-10': { stage: '17.8m', desc: 'Pre-Peak Flood Swell', descBn: 'বন্যার বিস্তার — ১৭.৮মি' },
  '2026-08-26': { stage: '18.9m', desc: 'Flood Crest (Char Submerged)', descBn: 'মনসুন বন্যা শিখর — ১৮.৯মি' },
  '2026-09-19': { stage: '16.4m', desc: 'Recession (-2.5m) & Bank Retreat', descBn: 'পানি হ্রাস ও ১৪৫.৮ হে. ভাঙন — ১৬.৪মি' },
  '2026-10-21': { stage: '13.6m', desc: 'Winter Low Water & Dry Chars', descBn: 'শীতকালীন শুষ্ক চর — ১৩.৬মি' },
};

export const SwipeCompareMap: React.FC<SwipeCompareProps> = ({ dateA, dateB }) => {
  const {
    swipePosition,
    setSwipePosition,
    comparisonMode,
    setComparisonMode,
    language,
    isRightInspectorOpen,
    selectedFindingId,
    isAgentDrawerOpen
  } = useWorkspaceStore();
  const [isDualSplit, setIsDualSplit] = React.useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isBn = language === 'bn';
  const isDrawerOpen = isRightInspectorOpen || Boolean(selectedFindingId) || isAgentDrawerOpen;

  const metaA = DATE_METRICS[dateA] ?? { stage: '18.9m', desc: 'Monsoon Flood Peak', descBn: 'মনসুন বন্যা' };
  const metaB = DATE_METRICS[dateB] ?? { stage: '16.4m', desc: 'Post-Flood Recession', descBn: 'পানি হ্রাস' };

  // Responsive 1:1 mouse drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const parent = containerRef.current;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();

    const onMouseMove = (moveEv: MouseEvent) => {
      const currentX = moveEv.clientX - rect.left;
      const newPos = Math.max(5, Math.min(95, (currentX / rect.width) * 100));
      setSwipePosition(Math.round(newPos));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Touch drag handler
  const handleTouchStart = () => {
    const parent = containerRef.current;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();

    const onTouchMove = (moveEv: TouchEvent) => {
      const touch = moveEv.touches[0];
      const currentX = touch.clientX - rect.left;
      const newPos = Math.max(5, Math.min(95, (currentX / rect.width) * 100));
      setSwipePosition(Math.round(newPos));
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-15 pointer-events-none flex flex-col justify-end overflow-hidden"
    >
      {/* Top Controls Overlay (Centered over swipe divider) */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#CBD5E1] shadow-lg text-xs transition-all duration-200"
      >
        {/* Mode Selector */}
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => setComparisonMode('dates')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              comparisonMode === 'dates'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare Flood Peak (Aug 26) vs Post-Flood Recession (Sep 19)"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isBn ? 'তারিখ' : 'Dates'}</span>
          </button>
          <button
            onClick={() => setComparisonMode('sensors')}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              comparisonMode === 'sensors'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#102A43]'
            }`}
            title="Compare Optical Satellite Photo vs NISAR Radar X-Ray"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isBn ? 'রাডার বনাম অপটিক্যাল' : 'Sat vs Radar'}</span>
          </button>
        </div>

        <div className="h-4 w-px bg-[#CBD5E1]" />

        {/* Swipe vs Split Toggle */}
        <button
          onClick={() => setIsDualSplit(!isDualSplit)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
            isDualSplit ? 'bg-[#155E75] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
          title="Toggle Split-Screen vs Interactive Swipe Slider"
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
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Vertical Divider Line with Glow & Cyan Accents */}
          <div className="w-1 h-full bg-white shadow-[0_0_16px_rgba(0,0,0,0.85)] border-l border-r border-[#0284C7]" />

          {/* Draggable Circle Knob with Floating Mode Pill Above */}
          <div className="relative flex flex-col items-center">
            {/* Dynamic Label Badge directly above the knob */}
            <div className="absolute -top-12 whitespace-nowrap bg-[#0F172A]/95 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xl border border-[#38BDF8] pointer-events-none flex items-center space-x-2">
              <span className="text-[#38BDF8]">
                {comparisonMode === 'sensors'
                  ? (isBn ? '🛰️ অপটিক্যাল স্যাটেলাইট' : '🛰️ Optical Satellite')
                  : `📅 ${dateA} (${metaA.stage})`}
              </span>
              <span className="text-white/60">↔</span>
              <span className="text-[#F87171]">
                {comparisonMode === 'sensors'
                  ? (isBn ? '📡 নিসার রাডার' : '📡 NISAR Radar X-Ray')
                  : `📅 ${dateB} (${metaB.stage})`}
              </span>
            </div>

            {/* Draggable Knob */}
            <div
              className="w-10 h-10 rounded-full bg-white border-2 border-[#0284C7] shadow-2xl flex items-center justify-center text-[#0284C7] text-sm font-black hover:scale-115 active:scale-95 transition-all cursor-ew-resize"
              title="Drag left or right across the river"
            >
              ↔
            </div>
          </div>
        </div>
      )}

      {/* Bottom Corner Floating Info Badges (Responsive & Drawer-Aware) */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-[10px] sm:text-[11px] font-bold text-[#102A43] shadow-lg flex items-center space-x-1.5 max-w-[calc(50vw-20px)] sm:max-w-xs truncate select-none">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] ring-4 ring-[#E0F2FE] shrink-0" />
        <span className="truncate">
          {comparisonMode === 'dates'
            ? `◀ ${isBn ? 'পূর্বে' : 'Before'}: ${dateA} (${isBn ? metaA.descBn : `${metaA.desc} — ${metaA.stage}`})`
            : `◀ ${isBn ? 'বাম' : 'Left'}: 🛰️ ${isBn ? 'হাই-রেজ অপটিক্যাল স্যাটেলাইট' : 'High-Res Optical Satellite (Esri/NASA)'}`}
        </span>
      </div>

      <div
        className="absolute bottom-3 z-10 pointer-events-none bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-[10px] sm:text-[11px] font-bold text-[#102A43] shadow-lg flex items-center space-x-1.5 max-w-[calc(50vw-20px)] sm:max-w-xs truncate transition-all duration-200 select-none"
        style={{ right: isDrawerOpen ? "min(440px, calc(100vw - 340px))" : "12px" }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-4 ring-[#FEE2E2] shrink-0" />
        <span className="truncate">
          {comparisonMode === 'dates'
            ? `▶ ${isBn ? 'পরে' : 'After'}: ${dateB} (${isBn ? metaB.descBn : `${metaB.desc} — ${metaB.stage}`})`
            : `▶ ${isBn ? 'ডান' : 'Right'}: 📡 ${isBn ? 'মাইক্রোওয়েভ রাডার ও নদীভাঙন' : 'NISAR SAR Radar Microwave & Erosion'}`}
        </span>
      </div>
    </div>
  );
};
