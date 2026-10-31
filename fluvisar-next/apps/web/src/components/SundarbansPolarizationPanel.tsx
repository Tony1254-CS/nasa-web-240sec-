import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Waves, Leaf, Radio } from 'lucide-react';

export const SundarbansPolarizationPanel: React.FC = () => {
  const { regionId } = useWorkspaceStore();
  const [selectedPol, setSelectedPol] = useState<'HH' | 'HV' | 'Ratio' | 'Pauli'>('HV');
  const [tideFilter, setTideFilter] = useState<'all' | 'high' | 'low'>('all');

  if (regionId !== 'sundarbans') return null;

  return (
    <div className="bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-xs space-y-3 text-xs select-none m-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
        <span className="font-bold text-[#102A43] flex items-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-[#047857]" />
          <span>Sundarbans Radar Switchboard</span>
        </span>
        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-1.5 py-0.5 rounded border border-emerald-200">
          S1/S2 Lens
        </span>
      </div>

      {/* Polarization Switchboard (plan.md Section 6.2, 11.1) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#475569] flex justify-between">
          <span>Channel / Polarimetry:</span>
          <span className="font-mono text-[#047857] font-bold">{selectedPol}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(['HH', 'HV', 'Ratio', 'Pauli'] as const).map((pol) => (
            <button
              key={pol}
              onClick={() => setSelectedPol(pol)}
              className={`py-1.5 rounded text-xs font-semibold transition-all ${
                selectedPol === pol
                  ? 'bg-[#047857] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
              }`}
            >
              {pol === 'Ratio' ? 'HH/HV' : pol}
            </button>
          ))}
        </div>
      </div>

      {/* Tide Context Filter (plan.md Section 13.1 R11) */}
      <div className="space-y-1.5 pt-1 border-t border-[#F1F5F9]">
        <div className="text-[11px] font-semibold text-[#475569] flex items-center space-x-1">
          <Waves className="w-3 h-3 text-[#0284C7]" />
          <span>Tidal Stage Filter:</span>
        </div>
        <div className="flex rounded-lg border border-[#CBD5E1] p-0.5 bg-[#F8FAFC]">
          {[
            { id: 'all', label: 'All Passes' },
            { id: 'high', label: 'High Tide (>2.2m)' },
            { id: 'low', label: 'Low Tide (<2.2m)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTideFilter(t.id as any)}
              className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                tideFilter === t.id
                  ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                  : 'text-[#64748B] hover:text-[#102A43]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Joint Trajectory Quadrant Insight */}
      <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#166534] flex items-center space-x-1">
          <Leaf className="w-3 h-3 text-[#166534]" />
          <span>ROOTRETURN Fingerprint</span>
        </div>
        <p className="text-[11px] text-[#14532D] leading-snug">
          High Tide: <strong className="font-mono text-[#047857]">+2.3 dB HV</strong> backscatter with stable optical NDVI (0.68) indicates water beneath canopy without defoliation.
        </p>
      </div>
    </div>
  );
};
