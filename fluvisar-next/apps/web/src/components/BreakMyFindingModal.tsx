import React, { useState } from 'react';
import { X, SlidersHorizontal, CheckCircle2, AlertTriangle, ShieldCheck, BookmarkCheck } from 'lucide-react';

interface BreakMyFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckItem {
  id: string;
  name: string;
  group: string;
  status: 'pass' | 'warn' | 'fail';
  reason: string;
  impact: string;
}

const CHECKS_DATA: CheckItem[] = [
  {
    id: 'CHK-01',
    name: 'Orbit Geometry Compatibility',
    group: 'Product & Geometry',
    status: 'pass',
    reason: 'Both acquisitions share Track 135 Descending path and identical incidence geometry',
    impact: 'Valid radiometric backscatter comparison',
  },
  {
    id: 'CHK-02',
    name: 'Sub-pixel Coregistration Check',
    group: 'Spatial Alignment',
    status: 'pass',
    reason: 'Stable ground control feature correlation RMSE < 0.22 pixels',
    impact: 'Transition represents genuine boundary displacement, not shifting',
  },
  {
    id: 'CHK-03',
    name: 'Parameter Stability (Break My Finding)',
    group: 'Classification Sensitivity',
    status: 'pass',
    reason: 'Contested fringe is 23% of robust core across [-2dB, +2dB] offset range',
    impact: 'Finding survives parameter perturbation within declared bounds',
  },
  {
    id: 'CHK-04',
    name: 'Equal-Stage Twin Water Level Match',
    group: 'Hydrological Context',
    status: 'pass',
    reason: 'Stage delta is 0.85m at Chilmari gauge (well below 1.0m flood threshold)',
    impact: 'Minimizes seasonal water-level inflation bias',
  },
  {
    id: 'CHK-05',
    name: 'Subsequent Pass Water Persistence',
    group: 'Subsequent Observations',
    status: 'pass',
    reason: 'Water state persisted in subsequent 21 Oct observation',
    impact: 'Permanent erosion candidate supported over temporary standing water',
  },
  {
    id: 'CHK-06',
    name: 'Sentinel-2 Optical Cross-Check',
    group: 'Independent Comparison',
    status: 'warn',
    reason: 'AOI clear-sky fraction is 42% due to monsoon cloud cover',
    impact: 'Multispectral validation partially obstructed; radar remains primary evidence',
  },
  {
    id: 'CHK-07',
    name: 'Topographic Floodplain Barrier (HAND)',
    group: 'Controls & Plausibility',
    status: 'pass',
    reason: 'Candidate sits within active braid belt (< 3.2m above riverbed elevation)',
    impact: 'Physically plausible bankline erosion zone',
  },
];

export const BreakMyFindingModal: React.FC<BreakMyFindingModalProps> = ({ isOpen, onClose }) => {
  const [offset, setOffset] = useState<number>(0);
  const [savedVariant, setSavedVariant] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseThreshold = -14.2;
  const currentThreshold = (baseThreshold + offset).toFixed(1);

  // Dynamic area estimation based on offset
  const robustCoreHa = 11.4;
  const contestedFringeHa = Math.max(1.2, Number((3.4 + offset * 0.8).toFixed(1)));
  const totalWaterHa = (robustCoreHa + contestedFringeHa).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-2xl max-w-2xl w-full overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#155E75] text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102A43]">
                Break My Finding: Sensitivity & 7 Adversarial Checks
              </h3>
              <p className="text-[11px] text-[#64748B]">
                W06 Engine: Perturb classification parameters to reveal Robust Core vs Contested Fringe.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Interactive Histogram & Otsu Threshold Slider */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#102A43] text-xs">Otsu Backscatter Threshold Adjustment</span>
                <p className="text-[10px] text-[#64748B]">
                  Base Otsu: <strong className="font-mono text-[#102A43]">-14.2 dB</strong> | Current Setting: <strong className="font-mono text-[#155E75]">{currentThreshold} dB</strong>
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#155E75]">
                {offset > 0 ? `+${offset}` : offset} dB
              </span>
            </div>

            {/* Bimodal Histogram Visualization */}
            <div className="h-16 flex items-end justify-between px-2 pt-2 border-b border-[#CBD5E1] bg-white rounded">
              {[4, 8, 18, 35, 54, 75, 92, 80, 52, 28, 15, 12, 14, 22, 40, 68, 95, 100, 85, 60, 42, 25, 14, 8, 4].map((h, i) => {
                const isWater = i < 11 + offset * 2;
                return (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-full mx-0.5 rounded-t-xs transition-colors ${
                      isWater ? 'bg-[#0072B2]' : 'bg-[#CBD5E1]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={-2}
                max={2}
                step={0.5}
                value={offset}
                onChange={(e) => {
                  setOffset(Number(e.target.value));
                  setSavedVariant(false);
                }}
                className="w-full accent-[#155E75] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B]">
                <span>-2.0 dB (Strict Water)</span>
                <span>0.0 dB (Nominal Otsu)</span>
                <span>+2.0 dB (Inclusive Water)</span>
              </div>
            </div>

            {/* Quantitative Sensitivity Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B]">Robust Core (Agreed)</div>
                <div className="text-sm font-bold text-[#102A43] font-mono">{robustCoreHa} ha</div>
              </div>
              <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                <div className="text-[10px] text-[#D55E00]">Contested Fringe</div>
                <div className="text-sm font-bold text-[#D55E00] font-mono">{contestedFringeHa} ha</div>
              </div>
              <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                <div className="text-[10px] text-[#155E75]">Total Evaluated</div>
                <div className="text-sm font-bold text-[#155E75] font-mono">{totalWaterHa} ha</div>
              </div>
            </div>
          </div>

          {/* Section 2: The 7 Documented Check Groups (plan.md Section 7.3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102A43] text-xs flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#155E75]" />
                <span>The 7 Scientific Check Groups</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                6 / 7 Passed
              </span>
            </div>

            <div className="space-y-1.5">
              {CHECKS_DATA.map((chk) => (
                <div
                  key={chk.id}
                  className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white flex items-start justify-between space-x-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#102A43] text-[11px]">{chk.name}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-[#F1F5F9] text-[#64748B]">
                        {chk.group}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">{chk.reason}</p>
                    <div className="text-[10px] text-[#0284C7] mt-0.5 font-medium">Impact: {chk.impact}</div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center space-x-0.5 shrink-0 ${
                      chk.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {chk.status === 'pass' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>{chk.status.toUpperCase()}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#F8FAFC] border-t border-[#CBD5E1] flex items-center justify-between">
          <span className="text-[10px] text-[#64748B]">
            Previews do not mutate base run; saved variants become versioned immutable runs.
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSavedVariant(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#155E75] text-white font-semibold hover:bg-[#0E7490] transition-colors"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{savedVariant ? 'Variant Saved (var-01)' : 'Save Tested Variant'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
