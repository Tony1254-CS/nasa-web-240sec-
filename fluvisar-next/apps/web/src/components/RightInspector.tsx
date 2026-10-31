import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import {
  AlertTriangle,
  ShieldCheck,
  SlidersHorizontal,
  Share2,
  FileCheck2,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { BreakMyFindingModal } from './BreakMyFindingModal';
import { ChangePassportModal } from './ChangePassportModal';
import { DecisionBriefModal } from './DecisionBriefModal';

export const RightInspector: React.FC = () => {
  const { regionId, language, selectedFindingId, selectedSample } = useWorkspaceStore();
  const t = i18n[language];
  const [thresholdOffset, setThresholdOffset] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isBriefOpen, setIsBriefOpen] = useState<boolean>(false);

  const isJamuna = regionId === 'jamuna';

  return (
    <>
      <aside className="w-80 border-l border-[#CBD5E1] bg-white flex flex-col h-full select-none text-xs overflow-y-auto">
        {/* Inspector Header */}
        <div className="p-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[#155E75] font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.inspector.title}</span>
            </div>
            <span className="font-mono text-[10px] text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1]">
              {selectedFindingId ?? (isJamuna ? 'JAM-2026-F01' : 'SUN-2026-F02')}
            </span>
          </div>
          <div className="mt-1 font-semibold text-[#102A43] text-sm leading-snug">
            {isJamuna
              ? (language === 'bn' ? 'চিলমারী চরের পূর্ব পাড়ে রূপান্তর' : 'East Bank Transition Candidate — Chilmari')
              : (language === 'bn' ? 'দুবলার চরের ম্যানগ্রোভ জোয়ারের প্রতিক্রিয়া' : 'Dublar Char Mangrove Tidal Response')}
          </div>

          {/* Live Map Pixel Sampler Output (plan.md Section 16.3) */}
          {selectedSample && (
            <div className="mt-2.5 p-2 rounded bg-white border border-[#CBD5E1] shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px]">
                <Crosshair className="w-3.5 h-3.5 text-[#0284C7]" />
                <span className="font-mono text-[#475569]">
                  {selectedSample.lat.toFixed(4)}°N, {selectedSample.lon.toFixed(4)}°E
                </span>
              </div>
              <div className="font-mono font-bold text-xs">
                {selectedSample.masked ? (
                  <span className="text-[#EF4444]">Masked ({selectedSample.reason ?? 'Nodata'})</span>
                ) : (
                  <span className="text-[#0369A1]">{selectedSample.value?.toFixed(1)} {selectedSample.unit}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4-Step Narrative Lead (plan.md Section 7.1) */}
        <div className="p-3.5 space-y-4 flex-1">
          {/* Step 1: What was observed */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#155E75] flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-[10px]">
                1
              </span>
              <span>{t.inspector.leadQuestion}</span>
            </div>
            <p className="text-xs text-[#334155] leading-relaxed">
              {isJamuna
                ? (language === 'bn'
                    ? '২৬ আগস্ট এবং ১৯ সেপ্টেম্বরের মধ্যে যমুনার পূর্ব তীরে ব্যাকস্ক্যাটার -৭.২ dB থেকে কমে -১৫.৪ dB এ নেমেছে।'
                    : 'Between 26 Aug and 19 Sep 2026, calibrated backscatter dropped by 8.2 dB (from -7.2 dB to -15.4 dB).')
                : (language === 'bn'
                    ? 'পূর্ণ জোয়ারের সময় সুন্দরবনের ক্যানোপির নিচে ডাবল-বাউন্স সিগন্যাল ৩.৫ dB বৃদ্ধি পেয়েছে।'
                    : 'During high spring tide, HH-polarized return increased by 3.5 dB across sub-canopy root network.')}
            </p>
          </div>

          {/* Step 2: What is supported vs unresolved */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#155E75] flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-[10px]">
                2
              </span>
              <span>{t.inspector.meaning}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-start space-x-1.5 text-xs text-[#0F172A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009E73] mt-1.5 shrink-0" />
                <span>
                  {isJamuna
                    ? (language === 'bn' ? 'সমর্থিত: এটি একটি সক্রিয় পানি/প্লাবন রূপান্তর।' : 'Supported: Open water surface presence verified.')
                    : (language === 'bn' ? 'সমর্থিত: জোয়ারের পানিতে ক্যানোপির তলদেশ নিমজ্জন।' : 'Supported: Sub-canopy water presence verified.')}
                </span>
              </div>
              <div className="flex items-start space-x-1.5 text-xs text-[#64748B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D55E00] mt-1.5 shrink-0" />
                <span>
                  {isJamuna
                    ? (language === 'bn' ? 'অমীমাংসিত: স্থায়ী নদীভাঙন নাকি সাময়িক প্লাবন।' : 'Unresolved: Permanent erosion vs. transient sandbar submergence.')
                    : (language === 'bn' ? 'অমীমাংসিত: ঘূর্ণিঝড়ের ক্ষত নাকি নিয়মিত উচ্চ জোয়ার।' : 'Unresolved: Cyclonic canopy loss vs. regular spring tide.')}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Main source of uncertainty */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D55E00] flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center text-[10px]">
                3
              </span>
              <span>{t.inspector.uncertainty}</span>
            </div>
            <div className="text-xs text-[#475569] bg-[#FFF7ED] p-2 rounded border border-[#FFEDD5] flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-snug">
                {isJamuna
                  ? (language === 'bn'
                      ? 'নদীর পানির উচ্চতা (Gauge stage) একই ছিল কি না তা FFWC লাইভ ডাটা ছাড়া চূড়ান্ত নিশ্চিত করা যায় না। এটি সাময়িক প্লাবনও হতে পারে।'
                      : 'Equal stage cannot be independently verified without verified FFWC gauge series. Temporary flood cannot be mathematically ruled out.')
                  : (language === 'bn'
                      ? 'তীরে কাছাকাছি জোয়ারের স্টেশন থেকে স্থানীয় খালের পানির উচ্চতার পার্থক্য থাকতে পারে।'
                      : 'BIWTA tidal station is 14 km distant; local creek hydraulic gradient remains an unmodeled variable.')}
              </p>
            </div>
          </div>

          {/* Step 4: Next recommended check */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#009E73] flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#D1FAE5] text-[#047857] flex items-center justify-center text-[10px]">
                4
              </span>
              <span>{t.inspector.nextCheck}</span>
            </div>
            <p className="text-xs text-[#0F766E] font-medium bg-[#F0FDFA] p-2 rounded border border-[#CCFBF1]">
              {isJamuna
                ? (language === 'bn'
                    ? 'পরবর্তী ২১ অক্টোবরের পাসে এই অংশটি পানি আছে নাকি জেগে উঠেছে পরীক্ষা করুন।'
                    : 'Inspect subsequent observation on 21 Oct 2026 to verify water persistence.')
                : (language === 'bn'
                    ? 'ভাটার সময়ের একই পোলারাইজেশন ডেটার সাথে তুলনা করুন।'
                    : 'Acquire low-tide acquisition match to verify return to baseline backscatter.')}
            </p>
          </div>

          {/* Live "Break My Finding" Trigger Box */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#102A43] text-xs flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#155E75]" />
                <span>{t.inspector.testFinding}</span>
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 text-[11px] text-[#155E75] hover:text-[#0E7490] font-semibold cursor-pointer"
              >
                <span>Full Test & Checks</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
              <div className="flex justify-between text-[10px] text-[#64748B] mb-1">
                <span>More Strict (-2dB)</span>
                <span>Nominal (0dB)</span>
                <span>More Loose (+2dB)</span>
              </div>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.5}
                value={thresholdOffset}
                onChange={(e) => setThresholdOffset(Number(e.target.value))}
                className="w-full accent-[#155E75] cursor-pointer"
              />
              <div className="mt-2 text-[10px] text-[#64748B] flex justify-between">
                <span>Robust Core: <strong className="text-[#102A43]">11.4 ha</strong></span>
                <span>Contested Fringe: <strong className="text-[#D55E00]">{(3.4 + thresholdOffset * 0.8).toFixed(1)} ha</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector Bottom Actions */}
        <div className="p-3 border-t border-[#CBD5E1] bg-[#F8FAFC] flex items-center space-x-2">
          <button
            onClick={() => setIsPassportOpen(true)}
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#155E75] hover:bg-[#0E7490] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            title="Open Immutable Provenance Chain"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{t.inspector.passport}</span>
          </button>

          <button
            onClick={() => setIsBriefOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#102A43] font-medium text-xs transition-colors cursor-pointer"
            title="Export Decision Brief"
          >
            <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
      </aside>

      {/* Break My Finding Full Modal */}
      <BreakMyFindingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Change Passport Modal */}
      <ChangePassportModal isOpen={isPassportOpen} onClose={() => setIsPassportOpen(false)} />

      {/* Decision Brief Modal */}
      <DecisionBriefModal isOpen={isBriefOpen} onClose={() => setIsBriefOpen(false)} />
    </>
  );
};
