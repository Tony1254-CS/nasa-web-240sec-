import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Play, SkipBack, SkipForward, Clock, AlertCircle, Sliders } from 'lucide-react';
import { PairSelectorModal } from './PairSelectorModal';

export const TimelinePlayer: React.FC = () => {
  const {
    language,
    selectedDate,
    availableDates,
    selectedPair,
    setSelectedDate,
  } = useWorkspaceStore();
  const t = i18n[language];
  const [isPairModalOpen, setIsPairModalOpen] = useState<boolean>(false);

  const formatDate = (d: string) => {
    const parts = d.split('-');
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const m = parseInt(parts[1]) - 6;
    return `${parseInt(parts[2])} ${months[m] ?? 'Oct'}`;
  };

  return (
    <>
      <div className="h-28 border-t border-[#CBD5E1] bg-white flex flex-col justify-between px-4 py-2 select-none z-10 shrink-0">
        {/* Top Header of Timeline */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-[#155E75]" />
            <span className="font-bold text-[#102A43] text-xs">{t.timeline.rhythmPlayer}</span>
            <span className="text-[11px] text-[#64748B] hidden md:inline">
              (True Temporal Timeline with Explicit Pass Gaps)
            </span>
          </div>

          {/* Selected Pair Summary & Modal Trigger */}
          <div
            onClick={() => setIsPairModalOpen(true)}
            className="flex items-center space-x-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer px-2.5 py-1 rounded-md border border-[#E2E8F0] transition-colors"
            title="Click to Choose Stage-Matched Compatible Pair"
          >
            <Sliders className="w-3.5 h-3.5 text-[#155E75]" />
            <span className="text-[11px] text-[#475569] font-medium">Comparison Pair:</span>
            <span className="font-mono text-xs font-semibold text-[#155E75]">
              {selectedPair ? `${selectedPair[0]} ➔ ${selectedPair[1]}` : 'Single Scene'}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1 rounded border border-emerald-200">
              Δt: 24d
            </span>
          </div>
        </div>

        {/* Interactive Time Axis with Real Satellite Ticks */}
        <div className="relative py-2 flex items-center justify-between px-6">
          <div className="absolute left-6 right-6 h-1 bg-[#E2E8F0] rounded-full z-0" />

          {availableDates.map((d) => {
            const isSelected = selectedDate === d;
            const isInPair = selectedPair && (selectedPair[0] === d || selectedPair[1] === d);

            return (
              <div
                key={d}
                onClick={() => setSelectedDate(d)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#155E75] border-white ring-2 ring-[#155E75] scale-125'
                      : isInPair
                      ? 'bg-[#0284C7] border-white ring-1 ring-[#0284C7]'
                      : 'bg-white border-[#94A3B8] hover:border-[#155E75] hover:scale-110'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>

                <div className="mt-1 flex flex-col items-center">
                  <span
                    className={`text-[11px] font-mono leading-none ${
                      isSelected ? 'font-bold text-[#155E75]' : 'text-[#64748B]'
                    }`}
                  >
                    {formatDate(d)}
                  </span>
                  <span className="text-[9px] text-[#94A3B8]">L-GCOV</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Timeline Controls */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#F1F5F9]">
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded hover:bg-[#F1F5F9] text-[#475569]">
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[#155E75] text-white font-medium hover:bg-[#0E7490]">
              <Play className="w-3 h-3 fill-current" />
              <span>{t.timeline.play}</span>
            </button>
            <button className="p-1 rounded hover:bg-[#F1F5F9] text-[#475569]">
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 text-[#64748B]">
            <AlertCircle className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{t.timeline.gapNotice}: Missing dates are never interpolated as water or land.</span>
          </div>
        </div>
      </div>

      {/* Compatible Pair Selection Modal */}
      <PairSelectorModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
    </>
  );
};
