import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Info, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const CoverageCurtainOverlay: React.FC = () => {
  const { viewId, language } = useWorkspaceStore();
  const [isCurtainActive, setIsCurtainActive] = useState(false);
  const [selectedExclusion, setSelectedExclusion] = useState<string | null>(null);

  if (viewId === 'M0') return null;

  const isBn = language === 'bn';

  return (
    <>
      {/* Floating Toggle Button on Map */}
      <div className="absolute top-3 left-3 z-20">
        <button
          onClick={() => setIsCurtainActive(!isCurtainActive)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border transition-all cursor-pointer ${
            isCurtainActive
              ? 'bg-[#0F172A] text-[#38BDF8] border-[#38BDF8] ring-2 ring-[#38BDF8]/40'
              : 'bg-white/95 text-[#334155] border-[#CBD5E1] hover:bg-white'
          }`}
          title="Toggle Valid/Unobserved Support Mask (plan.md N02)"
        >
          {isCurtainActive ? <EyeOff className="w-3.5 h-3.5 text-[#38BDF8]" /> : <Eye className="w-3.5 h-3.5 text-[#155E75]" />}
          <span>{isBn ? 'কভারেজ কার্টেইন (N02)' : 'Coverage Curtain (N02)'}</span>
          <span className="font-mono text-[9px] bg-[#E0F2FE] text-[#0369A1] px-1 rounded">
            78% Valid
          </span>
        </button>
      </div>

      {/* Coverage Curtain Active Status Banner & Exclusion Inspector */}
      {isCurtainActive && (
        <div className="absolute top-12 left-3 z-20 bg-white/95 backdrop-blur-xs border border-[#CBD5E1] p-3 rounded-lg shadow-xl text-xs w-72 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5">
            <span className="font-bold text-[#102A43] flex items-center space-x-1 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Observation Denominator Mask</span>
            </span>
            <button
              onClick={() => setIsCurtainActive(false)}
              className="text-[#64748B] hover:text-[#102A43] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-[#475569] leading-tight">
            {isBn
              ? 'পালিশ করা স্যাটেলাইট ছবির নিচে লুকানো ফাঁক বা বাদ পড়া এলাকাগুলো প্রকাশ করা হয়েছে।'
              : 'Reveals valid observation footprint vs. pixels excluded by geometry, shadow, or specular loss.'}
          </p>

          {/* Exclusion Breakdown */}
          <div className="space-y-1 text-[10px]">
            {[
              {
                id: 'shadow',
                label: 'Radar Shadow / Layover',
                pct: '4.0%',
                color: '#EF4444',
                desc: 'Steep riverbank geometry blocks radar line-of-sight illumination.'
              },
              {
                id: 'far_range',
                label: 'Far-Range Antenna Roll-off',
                pct: '3.0%',
                color: '#F59E0B',
                desc: 'Swath outer edge drops below valid SNR threshold.'
              },
              {
                id: 'water',
                label: 'Specular Water Absorption',
                pct: '15.0%',
                color: '#3B82F6',
                desc: 'Calm water surface acts as specular mirror; masked from land analysis.'
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedExclusion(selectedExclusion === item.id ? null : item.id)}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  selectedExclusion === item.id ? 'bg-[#F1F5F9] border-[#94A3B8]' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-center font-medium">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#1E293B]">{item.label}</span>
                  </span>
                  <span className="font-mono text-[#64748B]">{item.pct}</span>
                </div>
                {selectedExclusion === item.id && (
                  <div className="text-[9px] text-[#475569] mt-1 pt-1 border-t border-[#E2E8F0] flex items-start space-x-1">
                    <Info className="w-3 h-3 text-[#155E75] shrink-0 mt-0.5" />
                    <span>{item.desc}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-[9px] font-mono text-[#64748B] bg-[#F1F5F9] p-1 rounded text-center">
            Click any pixel on map to inspect exclusion cause
          </div>
        </div>
      )}
    </>
  );
};
