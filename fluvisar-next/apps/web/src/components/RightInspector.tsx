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
} from 'lucide-react';

export const RightInspector: React.FC = () => {
  const { regionId, language, selectedFindingId, selectedSample } = useWorkspaceStore();
  const t = i18n[language];
  const [thresholdOffset, setThresholdOffset] = useState<number>(0);

  const isJamuna = regionId === 'jamuna';

  return (
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
            <div className="flex items-center space-x-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#155E75]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#64748B]">
                  {selectedSample.lon.toFixed(4)}°E, {selectedSample.lat.toFixed(4)}°N
                </span>
                <span className="font-semibold text-[11px] text-[#102A43]">
                  {selectedSample.masked ? (
                    <span className="text-amber-600">Masked Support</span>
                  ) : (
                    <span>Calibrated γ⁰: <strong className="font-mono text-[#155E75]">{selectedSample.value} {selectedSample.unit}</strong></span>
                  )}
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-[#E0F2FE] text-[#0369A1] font-mono px-1 rounded">20m NISAR</span>
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* Step 1: What was observed */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#155E75] flex items-center space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-[10px]">
              1
            </span>
            <span>{t.inspector.leadQuestion}</span>
          </div>
          <p className="text-xs text-[#102A43] leading-relaxed bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
            {isJamuna
              ? (language === 'bn'
                  ? '২৬ আগস্ট ও ১৯ সেপ্টেম্বর ২০২৬-এর L-band GCOV পর্যবেক্ষণে রাডার ব্যাকস্ক্যাটার -৭.২ dB থেকে কমে -১৬.৮ dB হয়েছে (পানির সমতুল্য মসৃণ প্রতিফলন)।'
                  : 'L-band GCOV backscatter dropped from -7.2 dB to -16.8 dB between 26 Aug & 19 Sep 2026 on 14.8 ha of riverbank.')
              : (language === 'bn'
                  ? 'উচ্চ জোয়ারের সময়ে HV পোলারাইজেশনে সিগন্যাল ২.৩ dB বৃদ্ধি পেয়েছে, যা ক্যানোপির নিচে পানির কারণে ডাবল-বাউন্স স্ক্যাটারিং নির্দেশ করে।'
                  : 'HV backscatter increased by +2.3 dB during high tide, indicating double-bounce scattering from water beneath the mangrove canopy.')}
          </p>
        </div>

        {/* Step 2: What it may mean */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#155E75] flex items-center space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>{t.inspector.meaning}</span>
          </div>
          <p className="text-xs text-[#334155] leading-relaxed">
            {isJamuna
              ? (language === 'bn'
                  ? 'প্রাথমিক বিশ্লেষণ অনুযায়ী এটি একটি সম্ভাব্য নদীভাঙন (Erosion Candidate)। জমি পানিতে পরিণত হয়েছে।'
                  : 'Categorical transition: non-water to water. Consistent with bankline recession or saturated active channel formation.')
              : (language === 'bn'
                  ? 'ম্যানগ্রোভের ভেতর পানি প্রবেশ করেছে কিন্তু বন ধ্বংস হয়নি। এটি স্বাভাবিক টাইডাল পালস।'
                  : 'Tidal pulse: inundation beneath standing vegetation rather than canopy loss or defoliation.')}
          </p>
        </div>

        {/* Step 3: What remains uncertain */}
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

        {/* Live "Break My Finding" Control (Signature W06 Interaction) */}
        <div className="pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#102A43] text-xs flex items-center space-x-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#155E75]" />
              <span>{t.inspector.testFinding}</span>
            </span>
            <span className="text-[11px] font-mono text-[#155E75] font-semibold">
              {thresholdOffset > 0 ? `+${thresholdOffset}` : thresholdOffset} dB
            </span>
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
              step={1}
              value={thresholdOffset}
              onChange={(e) => setThresholdOffset(Number(e.target.value))}
              className="w-full accent-[#155E75] cursor-pointer"
            />
            <div className="mt-2 text-[10px] text-[#64748B] flex justify-between">
              <span>Robust Core: <strong className="text-[#102A43]">11.4 ha</strong></span>
              <span>Contested Fringe: <strong className="text-[#D55E00]">3.4 ha</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Bottom Actions */}
      <div className="p-3 border-t border-[#CBD5E1] bg-[#F8FAFC] flex items-center space-x-2">
        <button
          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-[#155E75] hover:bg-[#0E7490] text-white font-semibold text-xs shadow-xs"
          title="Open Immutable Provenance Chain"
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>{t.inspector.passport}</span>
        </button>

        <button
          className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#102A43] font-medium text-xs"
          title="Export Decision Brief"
        >
          <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
        </button>
      </div>
    </aside>
  );
};
