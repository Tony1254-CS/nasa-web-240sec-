import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Route, AlertOctagon, ArrowRightLeft, Users } from 'lucide-react';

export const JamunaDecisionPanel: React.FC = () => {
  const { regionId } = useWorkspaceStore();
  const [budget, setBudget] = useState<number>(2);
  const [severedCrossing, setSeveredCrossing] = useState<boolean>(true);

  if (regionId !== 'jamuna') return null;

  return (
    <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-xs space-y-3 text-xs select-none m-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
        <span className="font-bold text-[#102A43] flex items-center space-x-1.5">
          <Route className="w-3.5 h-3.5 text-[#155E75]" />
          <span>Decision Flip Engine (J3)</span>
        </span>
        <span className="text-[10px] bg-[#E0F2FE] text-[#0369A1] font-mono px-1.5 py-0.5 rounded border border-[#BAE6FD]">
          CHARKEEP
        </span>
      </div>

      {/* Inspection Budget Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-semibold text-[#475569]">
          <span>Inspection Team Budget:</span>
          <span className="font-mono text-[#155E75] font-bold">{budget} Sites</span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          step={1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-[#155E75] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[#94A3B8]">
          <span>1 Team (Strict Priority)</span>
          <span>4 Teams (Full Survey)</span>
        </div>
      </div>

      {/* Uncertain Crossing Assumption Toggle (plan.md Section 11.2) */}
      <div className="pt-1 border-t border-[#F1F5F9] space-y-1.5">
        <div className="text-[11px] font-semibold text-[#475569]">Tested Operational Scenario:</div>
        <label className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] cursor-pointer">
          <div className="flex items-center space-x-1.5">
            <AlertOctagon className={`w-3.5 h-3.5 ${severedCrossing ? 'text-[#D55E00]' : 'text-[#64748B]'}`} />
            <span className="text-[11px] font-medium text-[#102A43]">Roumari Ferry Severed</span>
          </div>
          <input
            type="checkbox"
            checked={severedCrossing}
            onChange={(e) => setSeveredCrossing(e.target.checked)}
            className="rounded text-[#155E75] focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Decision Flip Receipt (plan.md Section 13.3 N03) */}
      <div className="p-2.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[10px] uppercase tracking-wide text-[#C2410C] flex items-center space-x-1">
            <ArrowRightLeft className="w-3 h-3" />
            <span>Decision Flip Receipt</span>
          </span>
          <span className="text-[9px] font-semibold px-1 rounded bg-[#FFEDD5] text-[#9A3412]">
            {severedCrossing ? 'FLIP DETECTED' : 'NOMINAL'}
          </span>
        </div>

        {severedCrossing ? (
          <>
            <div className="text-[11px] text-[#7C2D12] leading-snug">
              Priority flipped from <strong>Char Unit B (Cropland)</strong> ➔ <strong>Roumari East Ferry Cutoff</strong> due to 4,200 residents isolated from Upazila Health Complex.
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#9A3412] bg-white/70 p-1.5 rounded">
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-[#D55E00]" />
                <span>Isolated Population:</span>
              </span>
              <strong className="font-mono">4,200 people</strong>
            </div>

            <div className="text-[10px] text-[#431407] font-medium pt-1 border-t border-[#FFEDD5]">
              Next Resolving Check: <em>Is Roumari East crossing passable by country boat during post-peak stage?</em>
            </div>
          </>
        ) : (
          <div className="text-[11px] text-[#7C2D12] leading-snug">
            All ferry crossings assumed operational. Standard area-weighted ranking is active.
          </div>
        )}
      </div>
    </div>
  );
};
