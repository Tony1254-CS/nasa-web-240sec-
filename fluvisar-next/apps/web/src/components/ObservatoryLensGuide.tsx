import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { ViewId } from '../store/workspaceStore';
import {
  Compass,
  X,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { JamunaDecisionPanel } from './JamunaDecisionPanel';
import { InSARSpecialtyPanel } from './InSARSpecialtyPanel';
import { ScenarioLabPanel } from './ScenarioLabPanel';
import { SundarbansPolarizationPanel } from './SundarbansPolarizationPanel';

interface LensInfo {
  id: ViewId;
  titleEn: string;
  titleBn: string;
  taglineEn: string;
  taglineBn: string;
  whatYouSeeEn: string;
  whatYouSeeBn: string;
  takeawayEn: string;
  takeawayBn: string;
}

const LENS_DETAILS: Record<string, LensInfo> = {
  J1: {
    id: 'J1',
    titleEn: 'River Memory & Bankline Erosion',
    titleBn: 'নদীর অতীত গতিপথ ও স্থায়ী ভাঙন',
    taglineEn: 'Distinguishing temporary flood drop from permanent land loss.',
    taglineBn: 'সাময়িক বন্যার পানি নেমে যাওয়া ও স্থায়ী নদীভাঙনের মধ্যে পার্থক্য।',
    whatYouSeeEn: 'Red dashed outline shows 145.8 ha permanent land lost at Chilmari; Green dashed outline shows 88.4 ha new silt island emerging.',
    whatYouSeeBn: 'লাল ড্যাশড বক্সে ১৪৫.৮ হেক্টর স্থায়ী ভাঙন; সবুজ ড্যাশড বক্সে ৮৮.৪ হেক্টর নতুন জেগে ওঠা চর দেখা যাচ্ছে।',
    takeawayEn: 'Equal-stage hydrological baseline (Aug 26 vs Sep 19) confirms this is permanent bank collapse into the main channel.',
    takeawayBn: 'পানির স্তর সমান থাকা অবস্থায় নেওয়া রাডার ছবিতে নিশ্চিত প্রমাণ মিলেছে যে এটি স্থায়ী ভাঙন।',
  },
  J2: {
    id: 'J2',
    titleEn: 'Floodplain Farmland Recovery',
    titleBn: 'প্লাবনভূমি ও কৃষিজমির পুনরুজ্জীবন',
    taglineEn: 'Tracking the exact week farmland dries up for winter crop sowing.',
    taglineBn: 'বন্যার পানি নামার সঠিক সময় ট্র্যাক করে চরে রবি শস্য বপনের পরিকল্পনা।',
    whatYouSeeEn: 'Optical NDVI greenness overlay. Water-fraction dropped from 0.78 to 0.22 as monsoon rains subsided.',
    whatYouSeeBn: 'গাছপালা ও ফসলের সবুজত্ব (NDVI)। পানি নেমে যাওয়ায় সবুজ সূচক ০.৪৮ এ উন্নীত হয়েছে।',
    takeawayEn: '72% of pilot agricultural units are dry by late September. Priority seed distribution recommended for Chilmari depot.',
    takeawayBn: 'সেপ্টেম্বরের শেষে ৭২% জমি শুকিয়েছে। কৃষকদের দ্রুত বীজ ও সার সহায়তা দেওয়া প্রয়োজন।',
  },
  J3: {
    id: 'J3',
    titleEn: 'Service Continuity & Ferry Linkages',
    titleBn: 'খেয়াঘাট ও স্বাস্থ্যসেবা বিচ্ছিন্নতা',
    taglineEn: 'Finding severed roads and ferries that cut island communities off from hospitals.',
    taglineBn: 'ভাঙনের কারণে বিচ্ছিন্ন খেয়াঘাট ও স্বাস্থ্যকেন্দ্রে যাওয়ার পথ চিহ্নিতকরণ।',
    whatYouSeeEn: 'Orange dots are ferry ramps and community clinics. Red line indicates severed Chilmari-Roumari crossing.',
    whatYouSeeBn: 'কমলা পয়েন্টগুলো হলো খেয়াঘাট ও ক্লিনিক। লাল দাগ দিয়ে বিচ্ছিন্ন নৌপথ চিহ্নিত করা হয়েছে।',
    takeawayEn: 'Ferry ramp breach isolated 3,420 island villagers. Emergency engine boat shuttle must be deployed.',
    takeawayBn: 'খেয়াঘাট ভেসে যাওয়ায় ৩,৪২০ জন মানুষ বিচ্ছিন্ন হয়ে পড়েছে। জরুরি স্পিডবোট সার্ভিস চালু করা দরকার।',
  },
  X1: {
    id: 'X1',
    titleEn: 'Ground Motion & Soil Compaction (InSAR)',
    titleBn: 'ভূমির মিলিমিটার দেবে যাওয়া (InSAR ফ্রিঞ্জ)',
    taglineEn: 'Using radar phase interference to measure millimeter-level land movement.',
    taglineBn: 'রাডারের রঙিন ফ্রিঞ্জ দিয়ে নদীর পাড় ও বাঁধ মিলিমিটার হিসেবে দেবে যাওয়া পরিমাপ।',
    whatYouSeeEn: 'Rainbow interference fringes. Each full color cycle represents 11.9 cm of relative surface displacement.',
    whatYouSeeBn: 'রঙধনু ফ্রিঞ্জ রিং। প্রতি রঙ চক্রে ১১.৯ সেন্টিমিটার ভূমি দেবে যাওয়ার হিসাব করা হয়।',
    takeawayEn: '8.2 mm soil compaction measured on the outer char. Embankment foundation requires structural reinforcement.',
    takeawayBn: 'বাইরের চরে ৮.২ মিমি মাটি দেবে গেছে। নদী রক্ষা বাঁধ মজবুত করার ব্যবস্থা নেওয়া দরকার।',
  },
  C1: {
    id: 'C1',
    titleEn: 'Flood Scenario Laboratory (+1.0m Simulation)',
    titleBn: 'দৃশ্যপট ল্যাব (+১.০ মিটার বন্যা সিমুলেশন)',
    taglineEn: 'Simulating what-if scenarios when river stage rises by +0.5m to +2.0m.',
    taglineBn: 'নদীর পানির উচ্চতা আরও ১ মিটার বাড়লে কতটুকু ডুববে তা আগাম পরীক্ষা।',
    whatYouSeeEn: 'Purple highlighted flood extent indicating declared simulation (N03 watermark).',
    whatYouSeeBn: 'বেগুনি রঙের সিমুলেশন লেয়ার, যা সম্ভাব্য নতুন প্লাবন এলাকা প্রদর্শন করে।',
    takeawayEn: 'An extra +1.0m flood stage submerges an additional 42.5 ha and cuts off 1,850 more community members.',
    takeawayBn: 'আরও ১ মিটার পানি বাড়লে অতিরিক্ত ৪২.৫ হেক্টর জমি ডুববে এবং ১,৮৫০ মানুষ ঝুঁকিতে পড়বে।',
  },
  S1: {
    id: 'S1',
    titleEn: 'Wetland Pulse & Sub-Canopy Tidal Flooding',
    titleBn: 'সুন্দরবনের জোয়ার-ভাটা ও ক্যানোপি এক্স-রে',
    taglineEn: 'Penetrating dense mangrove foliage with L-band radar to detect tidal water.',
    taglineBn: 'গাছের ঘন পাতার নিচ দিয়ে এল-ব্যান্ড রাডারে জোয়ারের পানি শনাক্তকরণ।',
    whatYouSeeEn: 'HH radar channel highlights double-bounce reflection (+3.5 dB) between tree trunks and standing tidal water.',
    whatYouSeeBn: 'এইচএইচ পোলারাইজেশন চ্যানেলে গাছের গুঁড়ি ও পানির ডাবল-বাউন্স সংকেত উজ্জ্বল হয়ে ফুটে উঠেছে।',
    takeawayEn: 'Isolates 312 ha of sub-canopy tidal inundation completely invisible to standard optical cameras.',
    takeawayBn: 'সাধারণ ক্যামেরায় অদৃশ্য থাকলেও রাডারে ৩১২ হেক্টর বনাঞ্চলের তলায় জোয়ারের পানি নিশ্চিত হয়েছে।',
  },
  S2: {
    id: 'S2',
    titleEn: 'Mangrove Canopy Volume & Forest Health',
    titleBn: 'ম্যানগ্রোভ ক্যানোপির ঘনত্ব ও বন সুরক্ষা',
    taglineEn: 'Monitoring forest volume scattering and cyclone recovery across Dublar Char.',
    taglineBn: 'ঘূর্ণিঝড়-পরবর্তী ম্যানগ্রোভ বনের পাতার বৃদ্ধি ও সুরক্ষা পর্যবেক্ষণ।',
    whatYouSeeEn: 'HV cross-polarization highlighting multiple-scattering inside dense tree branches.',
    whatYouSeeBn: 'এইচভি চ্যানেলে ঘন ডালপালার ক্যানোপি আয়তন স্পষ্ট দেখা যাচ্ছে।',
    takeawayEn: 'Canopy density stable across core reserve; outer fringe exhibits natural post-monsoon leaf flush.',
    takeawayBn: 'মূল বনাঞ্চল সুরক্ষিত রয়েছে এবং বাইরের প্রান্তে নতুন পাতা গজানোর প্রমাণ মিলেছে।',
  },
};

export const ObservatoryLensGuide: React.FC = () => {
  const { regionId, viewId, setView, language } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(true);
  const [showTools, setShowTools] = useState(false);

  const isBn = language === 'bn';
  const isJamuna = regionId === 'jamuna';
  const info = LENS_DETAILS[viewId] ?? LENS_DETAILS[isJamuna ? 'J1' : 'S1'];

  const availableLenses: { id: ViewId; label: string; tag: string }[] = isJamuna
    ? [
        { id: 'J1', label: isBn ? 'নদীভাঙন ও গতিপথ' : 'River Memory & Erosion', tag: 'J1 Core' },
        { id: 'J2', label: isBn ? 'কৃষি ও প্লাবনভূমি' : 'Farmland Recovery', tag: 'J2 NDVI' },
        { id: 'J3', label: isBn ? 'খেয়াঘাট ও বিচ্ছিন্নতা' : 'Service Continuity', tag: 'J3 Access' },
        { id: 'X1', label: isBn ? 'মাটি দেবে যাওয়া' : 'Ground Motion (InSAR)', tag: 'X1 mm' },
        { id: 'C1', label: isBn ? 'বন্যা সিমুলেশন ল্যাব' : 'Scenario Lab (+1.0m)', tag: 'C1 Sim' },
      ]
    : [
        { id: 'S1', label: isBn ? 'জোয়ার-ভাটা এক্স-রে' : 'Wetland Tidal Pulse', tag: 'S1 Pol' },
        { id: 'S2', label: isBn ? 'ম্যানগ্রোভ সুরক্ষা' : 'Canopy Health', tag: 'S2 HV' },
        { id: 'X1', label: isBn ? 'উপকূলীয় আর্দ্রতা' : 'Phase Coherence', tag: 'X1 mm' },
        { id: 'C1', label: isBn ? 'রাডার বনাম অপটিক্যাল' : 'Cross-Sensor Duel', tag: 'C1 Duel' },
      ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-3 left-3 z-20 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/95 text-[#102A43] border border-[#CBD5E1] shadow-lg backdrop-blur-md hover:bg-slate-50 transition-all cursor-pointer text-xs font-bold"
        title="Open Mission Lens Guide"
      >
        <Compass className="w-4 h-4 text-[#0284C7] animate-spin-slow" />
        <span>{isBn ? `লেন্স: ${info.titleBn}` : `Lens: ${info.titleEn}`}</span>
      </button>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-20 w-[360px] sm:w-[400px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-100px)] rounded-2xl bg-white/95 backdrop-blur-xl border border-[#CBD5E1] shadow-2xl text-[#102A43] text-xs flex flex-col overflow-hidden select-none transition-all animate-in fade-in zoom-in-95 duration-150">
      {/* Top Header */}
      <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[#102A43] text-xs">{isBn ? info.titleBn : info.titleEn}</span>
              <span className="font-mono text-[9px] bg-[#F1F5F9] text-[#0369A1] px-1.5 py-0.2 rounded border border-[#CBD5E1]">
                {info.id}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B] line-clamp-1">{isBn ? info.taglineBn : info.taglineEn}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Minimize Lens Guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Lens Quick Switcher Buttons */}
      <div className="p-2 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0">
        {availableLenses.map((lens) => (
          <button
            key={lens.id}
            onClick={() => {
              setView(lens.id);
              setShowTools(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              viewId === lens.id
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#102A43] hover:bg-white'
            }`}
          >
            <span>{lens.label}</span>
          </button>
        ))}
      </div>

      {/* Plain Language Explanations & Scrollable Body */}
      <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1">
        {/* What to observe */}
        <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#166534] tracking-wider flex items-center space-x-1">
            <span>👁️</span>
            <span>{isBn ? 'মানচিত্রে কী দেখছেন?' : 'What to look for on the map:'}</span>
          </div>
          <p className="text-[11px] text-[#14532D] leading-relaxed">
            {isBn ? info.whatYouSeeBn : info.whatYouSeeEn}
          </p>
        </div>

        {/* Actionable Takeaway */}
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#1E40AF] tracking-wider flex items-center space-x-1">
            <span>💡</span>
            <span>{isBn ? 'মূল সিদ্ধান্ত ও অন্তর্দৃষ্টি:' : 'Scientific Takeaway:'}</span>
          </div>
          <p className="text-[11px] text-[#1E3A8A] leading-relaxed font-medium">
            {isBn ? info.takeawayBn : info.takeawayEn}
          </p>
        </div>

        {/* Specialized Tool Toggle (If lens has interactive sliders/switches) */}
        {(viewId === 'X1' || viewId === 'C1' || viewId === 'J3' || viewId === 'S1' || viewId === 'S2') && (
          <div>
            <button
              onClick={() => setShowTools(!showTools)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#102A43] border border-[#CBD5E1] font-bold text-xs transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>
                  {viewId === 'X1'
                    ? (isBn ? 'InSAR সেন্সর ও ফ্রিঞ্জ টুলস' : 'InSAR Sensor & Transect Tools')
                    : viewId === 'C1'
                    ? (isBn ? 'বন্যা সিমুলেশন কন্ট্রোল ল্যাব' : 'Scenario Flood Controls')
                    : viewId === 'J3'
                    ? (isBn ? 'খেয়াঘাট ও টিম বাজেট ক্যালকুলেটর' : 'Charkeep Ferry & Team Calculator')
                    : (isBn ? 'রাডার পোলারাইজেশন চ্যানেল (HH/HV)' : 'Radar Polarization Switchboard')}
                </span>
              </span>
              {showTools ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Embedded Specialized Tool Body */}
            {showTools && (
              <div className="mt-2 p-2 rounded-xl bg-white border border-[#CBD5E1] text-[#102A43] animate-in fade-in duration-150">
                {viewId === 'X1' ? (
                  <InSARSpecialtyPanel />
                ) : viewId === 'C1' ? (
                  <ScenarioLabPanel />
                ) : viewId === 'J3' ? (
                  <JamunaDecisionPanel />
                ) : (
                  <SundarbansPolarizationPanel />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
