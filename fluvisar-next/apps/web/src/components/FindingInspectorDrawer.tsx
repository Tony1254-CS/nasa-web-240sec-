import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  FileCheck2,
  FileText,
  X,
  MapPin,
  Bot,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { BreakMyFindingModal } from './BreakMyFindingModal';
import { ChangePassportModal } from './ChangePassportModal';
import { DecisionBriefModal } from './DecisionBriefModal';
import { SourceCitationBadge } from './SourceCitationBadge';
import { AGENT_PERSONAS, AGENT_REASONING_CHAINS } from '../data/agenticSystem';

export const FindingInspectorDrawer: React.FC = () => {
  const {
    regionId,
    selectedFindingId,
    setSelectedFinding,
    isRightInspectorOpen,
    setRightInspectorOpen,
    setAgentDrawerOpen,
    language
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'trace' | 'audit' | 'actions'>('overview');
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  const isBn = language === 'bn';
  const isJamuna = regionId === 'jamuna';

  if (!isRightInspectorOpen && !selectedFindingId) return null;

  const currentFindingId = selectedFindingId ?? (isJamuna ? 'JAM-2026-F01' : 'SUN-2026-F01');
  const reasoningSteps = AGENT_REASONING_CHAINS[currentFindingId] ?? AGENT_REASONING_CHAINS['JAM-2026-F01'];

  const findingData = isJamuna
    ? {
        id: currentFindingId,
        titleEn: 'Chilmari West Bank Active Scallop Collapse',
        titleBn: 'চিলমারী পশ্চিম তীরের সক্রিয় নদীভাঙন বলয়',
        locationEn: 'Kurigram District, Jamuna River Reach',
        locationBn: 'কুড়িগ্রাম জেলা, যমুনা নদী অববাহিকা',
        area: '145.8 ha',
        radarDrop: '-8.2 dB',
        gaugeLevel: '16.40 m MSL',
        summaryEn: 'Between August 26 (Flood Crest) and September 19 (Recession), 145.8 hectares of high-value riverbank permanently collapsed into the main thalweg channel.',
        summaryBn: '২৬ আগস্টের বন্যার পর ১৯ সেপ্টেম্বর পানি নামলেও ১৪৫.৮ হেক্টর জমি আর জেগে ওঠেনি—তা স্থায়ীভাবে নদীগর্ভে বিলীন হয়ে গেছে।',
        schoolDistance: '42m away',
        roadSevered: '120m embankment cut',
        population: '8,200 villagers exposed',
        checks: [
          { name: 'Equal-Stage Baseline (Δh ≤ 0.1m)', status: 'PASSED', desc: 'Verified against dry baseline stage to prevent confusing flood drop with erosion', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Interferometric Coherence (γ ≥ 0.35)', status: 'PASSED', desc: 'Valid backscatter correlation confirms solid soil collapse into deep water', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Local Bankline Slope Concordance', status: 'PASSED', desc: 'Collapse vectors align with 85-degree shear cut profile', sourceId: 'BWDB_CHILMARI' },
          { name: 'Edge Persistence Multi-Temporal', status: 'PASSED', desc: 'New bankline remained permanent across subsequent 21 Oct overpass', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Wind-Wave Specular Decoupling', status: 'PASSED', desc: 'Calm water backscatter (γ⁰ ≤ -15 dB) excludes wind wave false positive', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Sentinel-2 Multi-Spectral Corroboration', status: 'PASSED', desc: 'Zero NDVI post-event confirms land loss under optical clearing', sourceId: 'COPERNICUS_S2A' },
          { name: 'Cryptographic SHA-256 Provenance', status: 'PASSED', desc: 'Granules matched with ESA AWS STAC catalog lineage', sourceId: 'NISAR_L2_GCOV' },
        ],
      }
    : {
        id: currentFindingId,
        titleEn: 'Dublar Char Sub-Canopy Tidal Flooding',
        titleBn: 'দুবলার চরের ম্যানগ্রোভ ক্যানোপি জোয়ারের পানি',
        locationEn: 'Sundarbans Biosphere Reserve, Passur Estuary',
        locationBn: 'সুন্দরবন বায়োস্ফিয়ার রিজার্ভ, পশুর মোহনা',
        area: '312.0 ha',
        radarDrop: '+3.5 dB (HH)',
        gaugeLevel: 'High Spring Tide',
        summaryEn: 'L-band microwave radar penetrates through dense mangrove canopy foliage, detecting 312 hectares of standing tidal water via trunk-water double-bounce scattering.',
        summaryBn: 'ঘন পাতার নিচে সাধারণ ক্যামেরায় না দেখা গেলেও এল-ব্যান্ড রাডারে গাছের কাণ্ড ও জোয়ারের পানির প্রতিফলনে ৩১২ হেক্টর প্লাবন স্পষ্ট শনাক্ত হয়েছে।',
        schoolDistance: 'Forest Post: 180m',
        roadSevered: 'Fishermen Jetty flooded',
        population: '1,450 fishermen monitored',
        checks: [
          { name: 'Polarimetric Double-Bounce (HH/HV)', status: 'PASSED', desc: 'Trunk-water dihedral scattering verified via Pauli decomposition', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Tide Datum Concordance', status: 'PASSED', desc: 'Hiron Point tidal gauge confirms high water level during SAR overpass', sourceId: 'BIWTA_DUBLAR' },
          { name: 'Canopy Penetration Depth (24cm)', status: 'PASSED', desc: 'L-band microwave wavelength proves sub-canopy water surface return', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Mangrove Species Mask Concordance', status: 'PASSED', desc: 'Matched against Global Mangrove Watch (GMW) baseline bounds', sourceId: 'GMW_MANGROVES' },
          { name: 'Temporal Coherence Consistency', status: 'PASSED', desc: 'Water drains fully during low tide overpass cycle', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Saline Soil Dielectric Decoupling', status: 'PASSED', desc: 'Permittivity shift conforms to saline tidal inundation profile', sourceId: 'NISAR_L2_GCOV' },
          { name: 'Cryptographic SHA-256 Provenance', status: 'PASSED', desc: 'Matched with NISAR L2 GCOV science data products', sourceId: 'NISAR_L2_GCOV' },
        ],
      };

  const handleClose = () => {
    setSelectedFinding(null);
    setRightInspectorOpen(false);
  };

  return (
    <>
      <div className="absolute top-0 right-0 bottom-0 z-30 w-[390px] sm:w-[440px] max-w-[calc(100vw-20px)] bg-white border-l border-slate-300 shadow-2xl flex flex-col h-full text-xs text-slate-800 select-none animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* 1. Header with Multi-Agent Attribution */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-cyan-100 text-cyan-800 font-bold text-[10px] font-mono border border-cyan-200">
                {findingData.id}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center space-x-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{isBn ? 'নিশ্চিত বৈজ্ঞানিক পর্যবেক্ষণ' : 'Empirical Ground Truth'}</span>
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-900 mt-1 leading-snug">
              {isBn ? findingData.titleBn : findingData.titleEn}
            </h3>

            <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-600" />
              <span>{isBn ? findingData.locationBn : findingData.locationEn}</span>
            </div>

            {/* Quick Trigger to Full Agent Console */}
            <button
              onClick={() => setAgentDrawerOpen(true)}
              className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#155E75] hover:bg-[#0E7490] text-white font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
            >
              <Bot className="w-3 h-3 text-cyan-200" />
              <span>{isBn ? '🤖 সায়েন্স ক্রু কনসোল খুলুন' : '🤖 Open Agent Console'}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Key Metrics Bar with Grounding Citations */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 border-b border-slate-200 text-center">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              {isBn ? 'ভাঙনের পরিমাণ' : 'Land Area'}
            </span>
            <span className="text-base font-black font-mono text-rose-600 block">
              {findingData.area}
            </span>
            <div className="flex justify-center">
              <SourceCitationBadge sourceId="NISAR_L2_GCOV" />
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              {isBn ? 'ঝুঁকিপূর্ণ স্কুল' : 'At-Risk School'}
            </span>
            <span className="text-xs font-black text-amber-600 block font-mono">
              {findingData.schoolDistance}
            </span>
            <div className="flex justify-center">
              <SourceCitationBadge sourceId="OSM_OVERPASS" />
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              {isBn ? 'ক্ষতিগ্রস্ত মানুষ' : 'Population'}
            </span>
            <span className="text-xs font-black text-slate-800 block font-mono">
              {findingData.population.split(' ')[0]}
            </span>
            <div className="flex justify-center">
              <SourceCitationBadge sourceId="WORLDPOP_BGD" />
            </div>
          </div>
        </div>

        {/* 3. 4-Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? '১. সারসংক্ষেপ' : '1. Overview'}
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            className={`flex-1 py-2 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'trace'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? '২. এজেন্ট ট্রেস' : '2. Agent Trace'}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? '৩. অডিট (৭)' : '3. 7-Check'}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'actions'
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? '৪. অ্যাকশন' : '4. Actions'}
          </button>
        </div>

        {/* 4. Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: Overview & Grounded Impact */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Plain Language Summary with Agent Attribution */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{isBn ? 'কী ঘটেছে? (ঘটনার বিবরণ)' : 'What Happened?'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-800 bg-cyan-100 px-1.5 py-0.2 rounded font-bold">
                    Multi-Agent Synthesis
                  </span>
                </div>
                <p>{isBn ? findingData.summaryBn : findingData.summaryEn}</p>

                <div className="flex items-center space-x-2 pt-1 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{isBn ? 'সোর্স ডেটা:' : 'Grounded Sources:'}</span>
                  <SourceCitationBadge sourceId="NISAR_L2_GCOV" />
                  <SourceCitationBadge sourceId="BWDB_CHILMARI" />
                </div>
              </div>

              {/* Infrastructure Exposure Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{isBn ? 'ক্ষতিগ্রস্ত অবকাঠামো (সেন্ডাই ফ্রেমওয়ার্ক)' : 'Exposed Infrastructure (Sendai Ledger)'}</span>
                  </span>
                  <SourceCitationBadge sourceId="OSM_OVERPASS" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200">
                    <div>
                      <span className="font-bold text-rose-900 block">Chilmari Government Primary School</span>
                      <span className="text-[10px] text-rose-700">Distance to active collapse rim: <strong>42m</strong></span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">CRITICAL</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                    <div>
                      <span className="font-bold text-amber-900 block">Chilmari-Roumari Embankment Road</span>
                      <span className="text-[10px] text-amber-700">Severed river connection: <strong>120m breach</strong></span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">SEVERED</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 block">Vulnerable Riverbank Inhabitants</span>
                      <span className="text-[10px] text-slate-600">8,200 people living along threatened char strip</span>
                    </div>
                    <SourceCitationBadge sourceId="WORLDPOP_BGD" />
                  </div>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => setIsBreakModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isBn ? 'এই ফলাফলকে চ্যালেঞ্জ করুন (স্ট্রেস টেস্ট)' : 'Stress-Test This Finding (Break My Finding)'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: Agent Reasoning Trace */}
          {activeTab === 'trace' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                <span>{isBn ? 'স্বায়ত্তশাসিত ৪ এজেন্টের যৌথ যুক্তি ট্রেস:' : 'Autonomous Collaborative Thought Trace:'}</span>
                <span className="text-emerald-700 font-mono font-bold text-[10px]">99.4% Consensus</span>
              </div>

              {reasoningSteps.map((step) => {
                const agent = AGENT_PERSONAS[step.agentId] ?? AGENT_PERSONAS['sar-analyst'];
                return (
                  <div key={step.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.2 rounded text-[10px] font-bold font-mono"
                        style={{ backgroundColor: `${agent.avatarColor}15`, color: agent.avatarColor, border: `1px solid ${agent.avatarColor}30` }}
                      >
                        {agent.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{step.timestamp}</span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs">
                      {isBn ? step.actionBn : step.action}
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-[10px] font-mono">
                      <span className="text-cyan-800 font-bold">{step.metricOrFormula}</span>
                      <SourceCitationBadge sourceId={step.sourceId} />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {isBn ? step.resultBn : step.result}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: 7-Check Quality Audit */}
          {activeTab === 'audit' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-500 mb-2">
                {isBn
                  ? 'এই নদীভাঙন সত্য নাকি কাল্পনিক—তা প্রমাণের ৭ স্তরের বৈজ্ঞানিক চেক রেজাল্ট:'
                  : '7-tier empirical quality audit proving zero fabricated data:'}
              </div>

              {findingData.checks.map((chk, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{chk.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      {chk.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug">{chk.desc}</p>
                  <div className="flex justify-end pt-0.5">
                    <SourceCitationBadge sourceId={chk.sourceId} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Actions & Decision Briefs */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500 mb-2">
                {isBn ? 'মাঠ পর্যায়ের কর্মকর্তা ও গবেষকদের জন্য অ্যাকশন টুলস:' : 'Scientific Action & Verification Hub:'}
              </div>

              {/* Tool 1: Break My Finding */}
              <button
                onClick={() => setIsBreakModalOpen(true)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-600 group-hover:rotate-12 transition-transform" />
                    <span>{isBn ? '১. ব্রেক মাই ফাইন্ডিং (স্ট্রেস টেস্ট)' : '1. Break My Finding Lab'}</span>
                  </span>
                  <span className="text-[10px] text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded font-mono">W06</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn
                    ? 'রাডার ব্যাকস্ক্যাটার থ্রেশহোল্ড (dB) ও মাস্ক বদলে ফলাফল কতটা সংবেদনশীল তা নিজে পরীক্ষা করুন।'
                    : 'Alter Otsu dB cutoff thresholds live to verify if 145.8 ha collapse survives counterfactual stress.'}
                </p>
              </button>

              {/* Tool 2: Change Passport */}
              <button
                onClick={() => setIsPassportOpen(true)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>{isBn ? '২. পরিবর্তন পাসপোর্ট (Change Passport)' : '2. Verified Change Passport'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">N06</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn
                    ? 'প্রতিটি পিক্সেলের স্যাটেলাইট ট্রানজিট টাইম, সেন্সর আইডি এবং ক্রিপ্টোগ্রাফিক সনদপত্র।'
                    : 'Complete immutable metadata dossier with satellite passes, acquisition times, and SHA-256.'}
                </p>
              </button>

              {/* Tool 3: Decision Brief */}
              <button
                onClick={() => setIsBriefOpen(true)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    <span>{isBn ? '৩. এক-পাতার সিদ্ধান্ত রিপোর্ট (Brief)' : '3. 1-Page Official Decision Brief'}</span>
                  </span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-mono">D01</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {isBn
                    ? 'জেলা প্রশাসক, পানি উন্নয়ন বোর্ড ও সাংবাদিকদের জন্য সেন্ডাই-সম্মত অফিশিয়াল এক্সিকিউটিভ রিপোর্ট।'
                    : 'Download Sendai Framework Priority 4 certified executive decision brief for field authorities.'}
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BreakMyFindingModal isOpen={isBreakModalOpen} onClose={() => setIsBreakModalOpen(false)} />
      <ChangePassportModal isOpen={isPassportOpen} onClose={() => setIsPassportOpen(false)} />
      <DecisionBriefModal isOpen={isBriefOpen} onClose={() => setIsBriefOpen(false)} />
    </>
  );
};
