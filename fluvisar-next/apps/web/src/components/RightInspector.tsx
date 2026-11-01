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
  Clock,
  ArrowRight,
  Compass,
  Users,
  Briefcase,
  Cpu,
  Building2,
  AlertCircle,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import { BreakMyFindingModal } from './BreakMyFindingModal';
import { ChangePassportModal } from './ChangePassportModal';
import { DecisionBriefModal } from './DecisionBriefModal';

export const RightInspector: React.FC = () => {
  const {
    regionId,
    language,
    audience,
    mode,
    selectedFindingId,
    selectedSample,
    setSelectedDate,
    toggleRightPanel,
  } = useWorkspaceStore();

  const t = i18n[language];
  const [thresholdOffset, setThresholdOffset] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isBriefOpen, setIsBriefOpen] = useState<boolean>(false);

  const isJamuna = regionId === 'jamuna';
  const isBn = language === 'bn';

  return (
    <>
      <aside className="w-84 border-l border-[#CBD5E1] bg-white flex flex-col h-full select-none text-xs overflow-y-auto">
        {/* Top Header: Finding Identity & Perspective Badge */}
        <div className="p-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[#155E75] font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.inspector.title}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-[10px] text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                {selectedFindingId ?? (isJamuna ? 'JAM-2026-F01' : 'SUN-2026-F02')}
              </span>
              <button
                onClick={toggleRightPanel}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="font-bold text-[#102A43] text-sm leading-snug">
            {isJamuna
              ? (isBn ? 'চিলমারী পশ্চিম তীরের ভাঙন ও চর রূপান্তর' : 'Chilmari West Bank Retreat & Char Dynamics')
              : (isBn ? 'দুবলার চরের ম্যানগ্রোভ জোয়ারের প্রতিক্রিয়া' : 'Dublar Char Mangrove Tidal Pulse')}
          </div>

          {/* Dynamic Audience Perspective Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            {audience === 'public' && (
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{isBn ? 'সাধারণ নাগরিক দৃষ্টিভঙ্গি' : 'Public Community View'}</span>
              </div>
            )}
            {audience === 'decision' && (
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isBn ? 'নীতিনির্ধারক ও প্রশাসনিক দৃষ্টিভঙ্গি' : 'Decision Maker / Official Brief'}</span>
              </div>
            )}
            {audience === 'analyst' && (
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] font-medium">
                <Cpu className="w-3.5 h-3.5" />
                <span>{isBn ? 'মহাকাশ বিজ্ঞানী ও রাডার এনালিস্ট' : 'Radar Scientist / Analyst Spec'}</span>
              </div>
            )}

            <span className="text-[10px] font-mono uppercase text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
              Mode: {mode}
            </span>
          </div>

          {/* Live Map Pixel Sampler Output */}
          {selectedSample && (
            <div className="p-2 rounded bg-white border border-[#CBD5E1] shadow-xs flex items-center justify-between">
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

        {/* MODE: ACT & EXPLAIN -> Critical Asset Exposure & Action List */}
        {mode === 'act' && (
          <div className="p-3 bg-[#FEF2F2] border-b border-[#FECACA] space-y-2">
            <div className="flex items-center space-x-1 text-[#991B1B] font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
              <span>{isBn ? 'জরুরি পদক্ষেপ ও অবকাঠামো ঝুঁকি' : 'Operational Action & Exposure'}</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-white p-2 rounded border border-[#FECACA] space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-[#102A43]">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>Chilmari Model Primary School</span>
                  </span>
                  <span className="text-[9px] bg-[#FEE2E2] text-[#DC2626] px-1 rounded font-bold">42m to bank</span>
                </div>
                <p className="text-[10px] text-[#475569]">
                  {isBn
                    ? 'তীর ভাঙন আশঙ্কাজনক সীমায়। ২১ অক্টোবরের পরবর্তী স্যাটেলাইট পাসের আগে জিও-ব্যাগ প্লেসমেন্ট প্রয়োজন।'
                    : 'Immediate embankment revetment (geo-bags) required before 21 Oct overpass.'}
                </p>
              </div>

              <div className="bg-white p-2 rounded border border-[#E2E8F0] space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-[#102A43]">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Roumari Community Clinic</span>
                  </span>
                  <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] px-1 rounded font-bold">Ferry Cut</span>
                </div>
                <p className="text-[10px] text-[#475569]">
                  {isBn
                    ? 'নদীভাঙনের ফলে চিলমারী–রৌমারী ফেরি রুট বিচ্ছিন্ন হওয়ার উপক্রম। বিকল্প নৌপথ প্রস্তুত রাখা জরুরি।'
                    : 'Ferry landing access endangered. Recommend prepositioning mobile transport craft.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBriefOpen(true)}
              className="w-full mt-2 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'এক-পাতার সিদ্ধান্ত ব্রিফ ডাউনলোড করুন' : 'Export 1-Page Decision Brief'}</span>
            </button>
          </div>
        )}

        {/* Evidence Multi-Clock Display (N05) */}
        <div className="px-3.5 py-2.5 bg-[#F1F5F9] border-b border-[#E2E8F0] space-y-1 text-[10px]">
          <div className="flex items-center justify-between font-bold text-[#334155] uppercase tracking-wider text-[9px]">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#155E75]" />
              <span>Evidence Multi-Clock (N05)</span>
            </span>
            <span className="text-[#64748B] font-mono">UTC</span>
          </div>
          <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
            <div className="bg-white p-1 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] block">Satellite SAR:</span>
              <strong className="text-[#155E75]">26 Aug 11:42</strong>
            </div>
            <div className="bg-white p-1 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] block">River Gauge:</span>
              <strong className="text-[#0284C7]">26 Aug 12:00</strong>
            </div>
            <div className="bg-white p-1 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] block">Pipeline Run:</span>
              <strong className="text-[#334155]">31 Oct 08:00</strong>
            </div>
            <div className="bg-white p-1 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] block">Field Survey:</span>
              <strong className="text-[#C2410C]">PENDING AUDIT</strong>
            </div>
          </div>
        </div>

        {/* 4-Step Narrative Lead (Dynamically Adapted by Audience Perspective) */}
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
              {audience === 'public' && (
                isJamuna
                  ? (isBn
                      ? 'স্যাটেলাইটে ধরা পড়েছে যে ২৬ আগস্ট থেকে ১৯ সেপ্টেম্বরের মধ্যে যমুনার চিলমারী তীরে ১৪৫.৮ হেক্টর জমি ভেঙে পানিতে বিলীন হয়ে গেছে।'
                      : 'The satellite observed that 145.8 hectares of farmland and riverbank collapsed into water at Chilmari between Aug 26 and Sep 19.')
                  : (isBn
                      ? 'জোয়ারের সময় সুন্দরবনের গাছের তলায় ৩১২ হেক্টর অংশ সাময়িকভাবে পানিতে প্লাবিত হয়েছে।'
                      : 'High ocean tide entered the mangrove forest, temporarily submerging 312 hectares of ground beneath the trees.')
              )}

              {audience === 'decision' && (
                isJamuna
                  ? (isBn
                      ? 'চিলমারী পশ্চিম বাঁধে মারাত্মক নদীভাঙন: ১৪৫.৮ হেক্টর সম্পূর্ণ বিনষ্ট। চিলমারী মডেল প্রাথমিক বিদ্যালয় ও ফেরি ঘাট প্রত্যক্ষ হুমকির মুখে।'
                      : 'Critical bankline failure detected along Chilmari West Embankment: 145.8 ha total loss. Primary school and ferry road directly threatened.')
                  : (isBn
                      ? 'পূর্ণ জোয়ারে দুবলার চরের অভ্যন্তরে ৩১২ হেক্টর এলাকা প্লাবিত। জোয়ারের মাত্রা BIWTA পূর্বাভাসের ০.১২ মিটারের মধ্যে ছিল। আশ্রয়কেন্দ্রগুলো নিরাপদ।'
                      : 'High spring tide inundated 312 ha within Dublar Char zone. Surge remained within 0.12m tolerance of BIWTA forecast. Cyclone shelters accessible.')
              )}

              {audience === 'analyst' && (
                isJamuna
                  ? (isBn
                      ? 'L-band GCOV ব্যাকস্ক্যাটার -৭.২ dB থেকে কমে -১৫.৪ dB এ নেমেছে (Δ = -৮.২ dB)। Otsu থ্রেশহোল্ড ≤ -১৪.০ dB দ্বারা ওপেন ওয়াটার চিহ্নিত (N=3,645 পিক্সেল)।'
                      : 'L2 GCOV backscatter dropped by 8.2 dB (-7.2 dB to -15.4 dB). Water threshold ≤ -14.0 dB confirmed via Otsu bimodal segmentation (N=3,645 20m cells).')
                  : (isBn
                      ? 'ট্রাঙ্ক-গ্রাউন্ড ডাবল-বাউন্সের কারণে HH পোলারাইজেশনে +৩.৫ dB বৃদ্ধি। ফ্রিম্যান-ডারডেন ভলিউম ডিকম্পোজিশনে ক্যানোপি অটুট নিশ্চিত (HV = -১৮.১ dB)।'
                      : 'HH return increased by +3.5 dB via trunk-ground dihedral double bounce. Freeman-Durden volume decomposition confirms stable canopy (HV = -18.1 dB).')
              )}
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
                <CheckCircle2 className="w-3.5 h-3.5 text-[#009E73] mt-0.5 shrink-0" />
                <span>
                  {audience === 'public'
                    ? (isJamuna ? (isBn ? 'নিশ্চিত: জমি ভেঙে নদীতে পরিণত হয়েছে।' : 'Confirmed: Farmland washed away into river.') : (isBn ? 'নিশ্চিত: গাছের নিচে জোয়ারের পানি ঢুকেছে।' : 'Confirmed: Normal tidal water beneath trees.'))
                    : audience === 'decision'
                    ? (isJamuna ? (isBn ? 'নিশ্চিত: ৩টি মৌজার কৃষিজমিতে অর্থনৈতিক ক্ষয়ক্ষতি।' : 'Confirmed: Direct asset and farmland loss across 3 Mauzas.') : (isBn ? 'নিশ্চিত: আশ্রয়কেন্দ্র নৌপথে সংযুক্ত।' : 'Confirmed: Cyclone shelter boat access maintained.'))
                    : (isJamuna ? (isBn ? 'যাচাইকৃত: স্পেকুলার ওয়াটার সিগন্যাচার (p < 0.001)।' : 'Verified: Specular water scattering signature (p < 0.001).') : (isBn ? 'যাচাইকৃত: ডাই-ইলেকট্রিক ওয়াটার বাউন্ডারি।' : 'Verified: Sub-canopy dielectric water boundary.'))}
                </span>
              </div>
              <div className="flex items-start space-x-1.5 text-xs text-[#64748B]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D55E00] mt-0.5 shrink-0" />
                <span>
                  {audience === 'public'
                    ? (isJamuna ? (isBn ? 'অমীমাংসিত: পানি নামলে চরে নতুন পলি জাগবে কি না।' : 'Unresolved: Whether new silt sandbars will emerge in winter.') : (isBn ? 'অমীমাংসিত: কোনো স্থায়ী গাছ নষ্ট হয়নি।' : 'Unresolved: No permanent mangrove defoliation.'))
                    : audience === 'decision'
                    ? (isJamuna ? (isBn ? 'অপারেশনাল সিদ্ধান্ত: তাৎক্ষণিক জিও-ব্যাগ ফেলা আবশ্যক।' : 'Operational: Priority 1 geo-bag revetment required.') : (isBn ? 'অপারেশনাল সিদ্ধান্ত: মৌসুমি টহল প্রস্তুত রাখা।' : 'Operational: Maintain seasonal forest patrol craft.'))
                    : (isJamuna ? (isBn ? 'অমীমাংসিত: সীমানার মিশ্র পিক্সেল (ফ্রিঞ্জ ৩.৪ হেক্টর)।' : 'Unresolved: Sub-pixel mixing within 20m contested fringe (3.4 ha).') : (isBn ? 'অমীমাংসিত: দুবলার গেজের ১৪ কিমি দূরবর্তী গ্রেডিয়েন্ট।' : 'Unresolved: Creek hydraulic head gradient from Dublar gauge (14 km).'))}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Main source of uncertainty / Hydrological Datum */}
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
                {audience === 'public' && (
                  isJamuna
                    ? (isBn
                        ? 'নদীর পানির উচ্চতা ২৬ আগস্ট ১৮.৯ মিটারে ছিল এবং সেপ্টেম্বরে ১৬.৪ মিটারে নেমেছিল।'
                        : 'River water level was 18.9 meters during peak flood, and fell to 16.4 meters in September.')
                    : (isBn
                        ? 'জোয়ারের উচ্চতা ছিল +২.২ মিটার এবং ভাটায় তা +০.৪ মিটারে নেমে যায়।'
                        : 'Tide height was +2.2 meters at high tide, and fell to +0.4 meters at low tide.')
                )}

                {audience === 'decision' && (
                  isJamuna
                    ? (isBn
                        ? 'BWDB চিলমারী গেজের বিপৎসীমা ১৯.৫০ মিটার। ২৬ আগস্টের পিক ছিল ১৮.৯০ মিটার (বিপৎসীমার ৬০ সেমি নিচে)।'
                        : 'BWDB Chilmari Danger Level DL = 19.50m. Peak crest was 18.90m (60cm below danger level).')
                    : (isBn
                        ? 'BIWTA দুবলার চর টাইডাল গেজ (TD12.4): হাই টাইড ক্রেস্ট +২.২০ মিটার CD। সাধারণ জোয়ারের সীমা।'
                        : 'BIWTA Dublar Char Tidal Gauge (TD12.4): High tide crest +2.20m CD. Within normal spring cycle.')
                )}

                {audience === 'analyst' && (
                  isJamuna
                    ? (isBn
                        ? 'SWOT KaRIn ওয়াটার হাইট hw = ১৮.৯০ মি WGS84, রিচ স্লোপ = ৭.২ সেমি/কিমি। ইনসার কোহেরেন্স γ = ০.৭৪।'
                        : 'SWOT KaRIn water surface height hw = 18.90m WGS84, reach slope = 7.2 cm/km. Temporal InSAR coherence γ = 0.74.')
                    : (isBn
                        ? 'Sentinel-1 C-band (Δ = +0.8 dB) বনাম NISAR L-band (Δ = +3.5 dB) দ্বিমুখী ক্যানোপি পেনিট্রেশন যাচাইকৃত।'
                        : 'Sentinel-1 C-band (Δ = +0.8 dB) vs NISAR L-band (Δ = +3.5 dB) dual-frequency canopy penetration verified.')
                )}
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
              {audience === 'public' && (
                isJamuna
                  ? (isBn ? 'পরবর্তী ২১ অক্টোবরের স্যাটেলাইট পাসে পানির সীমা আবার পরীক্ষা করুন।' : 'Check next satellite pass on 21 Oct 2026 to see if bank remains flooded.')
                  : (isBn ? 'ভাটার সময়ের স্যাটেলাইট ছবিতে পানি নেমে গেছে কি না দেখুন।' : 'Inspect low-tide satellite image to verify that water receded from the forest.')
              )}

              {audience === 'decision' && (
                isJamuna
                  ? (isBn ? 'উপজেলা প্রকৌশল দল পাঠিয়ে সরেজমিনে জরিপ করুন ও জিও-ব্যাগ বাজেট অনুমোদন দিন।' : 'Dispatch Upazila engineering team with TRACE mobile survey kit. Approve geo-bag allocation.')
                  : (isBn ? 'পোস্ট-মনসুন বন বিভাগীয় টহল পরিচালনা করুন।' : 'Schedule post-monsoon forestry patrol. Verify ranger station boat moorings.')
              )}

              {audience === 'analyst' && (
                isJamuna
                  ? (isBn ? 'অবশিষ্ট বাঁধ ধ্বসের জন্য রিপিট-পাস GUNW ইনসার ফেজ আনর‍্যাপিং সম্পন্ন করুন।' : 'Execute repeat-pass GUNW InSAR phase unwrapping for residual crest subsidence.')
                  : (isBn ? 'ভাটার ডেটায় ক্লাউড-পটিয়ার H/alpha আইগেনভ্যালু বিশ্লেষণ সম্পন্ন করুন।' : 'Compute Cloude-Pottier H/alpha eigenvalue decomposition across low-tide acquisition.')
              )}
            </p>
          </div>

          {/* Guided Comparison Prompts (plan.md N04) */}
          <div className="p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg space-y-1.5">
            <div className="font-bold text-[#1E40AF] text-[10px] uppercase flex items-center space-x-1">
              <Compass className="w-3 h-3 text-[#2563EB]" />
              <span>Guided Actions (N04)</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedDate('2026-10-21')}
                className="w-full text-left p-1.5 bg-white rounded border border-[#DBEAFE] hover:bg-[#F8FAFC] text-[10px] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Check 21 Oct Subsequent Overpass</span>
                <ArrowRight className="w-3 h-3 text-[#2563EB]" />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full text-left p-1.5 bg-white rounded border border-[#DBEAFE] hover:bg-[#F8FAFC] text-[10px] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>Perturb Threshold (Break My Finding)</span>
                <ArrowRight className="w-3 h-3 text-[#2563EB]" />
              </button>
            </div>
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
                <span>Robust Core: <strong className="text-[#102A43]">145.8 ha</strong></span>
                <span>Contested Fringe: <strong className="text-[#D55E00]">{(12.4 + thresholdOffset * 2.8).toFixed(1)} ha</strong></span>
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
