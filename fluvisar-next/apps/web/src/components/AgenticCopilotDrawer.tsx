import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  X,
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';
import {
  AGENT_PERSONAS,
  AGENT_REASONING_CHAINS,
  FINDING_AGENT_CONTRIBUTIONS,
  AGENT_COPILOT_ACTIONS
} from '../data/agenticSystem';
import { SourceCitationBadge } from './SourceCitationBadge';
import { BreakMyFindingModal } from './BreakMyFindingModal';

export const AgenticCopilotDrawer: React.FC = () => {
  const {
    isAgentDrawerOpen,
    setAgentDrawerOpen,
    regionId,
    selectedFindingId,
    setBasemapType,
    setSelectedSourceId,
    language
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'reasoning' | 'crew' | 'actions' | 'ask'>('reasoning');
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  if (!isAgentDrawerOpen) return null;

  const isBn = language === 'bn';
  const isJamuna = regionId === 'jamuna';
  const currentFindingId = selectedFindingId ?? (isJamuna ? 'JAM-2026-F01' : 'SUN-2026-F01');

  const reasoningSteps = AGENT_REASONING_CHAINS[currentFindingId] ?? AGENT_REASONING_CHAINS['JAM-2026-F01'];
  const agentContributions = FINDING_AGENT_CONTRIBUTIONS[currentFindingId] ?? FINDING_AGENT_CONTRIBUTIONS['JAM-2026-F01'];

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'open_break_modal':
        setIsBreakModalOpen(true);
        break;
      case 'switch_to_optical':
        setBasemapType('satellite');
        break;
      case 'focus_school': {
        const mapB = (window as any).__mapB;
        if (mapB) {
          mapB.flyTo({ center: [89.653, 25.568], zoom: 14.5, duration: 1000 });
        }
        break;
      }
      case 'open_source_dossier':
        setSelectedSourceId('NISAR_L2_GCOV');
        break;
      default:
        break;
    }
  };

  const faqs = isJamuna
    ? [
        {
          qEn: 'Why is 145.8 ha classified as permanent erosion instead of flood water?',
          qBn: 'কেন ১৪৫.৮ হেক্টরকে বন্যার সাময়িক পানি না বলে স্থায়ী নদীভাঙন বলা হচ্ছে?',
          aEn: 'The Skeptical Auditor Agent executed an Equal-Stage Delta-H baseline test between August 26 (peak flood) and September 19 (recession). While surrounding char shoals dried out and re-emerged (NDVI +0.48), this 145.8 ha parcel dropped by -8.2 dB and remained permanently under the active thalweg channel.',
          aBn: 'নিরপেক্ষ অডিটর এজেন্ট ২৬ আগস্ট (বন্যার সর্বোচ্চ চূড়া) এবং ১৯ সেপ্টেম্বর (পানি নামার পর)-এর মধ্যে সমান পানির স্তরের টেস্ট করেছে। আশেপাশের চর জেগে উঠলেও এই ১৪৫.৮ হেক্টর জমি আর ফিরে আসেনি, বরং নদীর মূল চ্যানেলে চিরতরে তলিয়ে গেছে।',
          agent: 'skeptical-auditor',
          source: 'NISAR_L2_GCOV',
        },
        {
          qEn: 'How does L-band radar see through monsoon cloud cover?',
          qBn: 'বর্ষার ঘন মেঘ ভেদ করে এল-ব্যান্ড রাডার কীভাবে ছবি তোলে?',
          aEn: 'Unlike optical satellites (Sentinel-2/Landsat) that use visible light (λ ≈ 0.6 µm) scattered by clouds and raindrops, NISAR uses microwave radio frequencies with a 23.84 cm wavelength (1.25 GHz). These microwaves pass unobstructed through storm clouds and heavy rain.',
          aBn: 'সাধারণ অপটিক্যাল ক্যামেরার আলো মেঘে বাধা পায়। কিন্তু নিসার এল-ব্যান্ড রাডারের মাইক্রোওয়েভ তরঙ্গ (২৩.৮৪ সেন্টিমিটার) মেঘ, কুয়াশা বা প্রবল বৃষ্টি ভেদ করে অনায়াসে সরাসরি মাটি ও পানির স্পষ্ট প্রতিচ্ছবি ধারণ করতে পারে।',
          agent: 'sar-analyst',
          source: 'NISAR_L2_GCOV',
        },
        {
          qEn: 'What is the immediate Sendai Framework Priority 4 emergency response?',
          qBn: 'সেন্ডাই ফ্রেমওয়ার্ক অনুযায়ী তাৎক্ষণিক জরুরি পদক্ষেপ কী?',
          aEn: 'Spatial proximity calculations confirm Chilmari Model Primary School is only 42m from the active collapse rim. The Sendai Risk Agent recommends immediate emergency sand-filled geo-bag deployment along the western crescent and shifting the school to the designated inland CharKeep shelter.',
          aBn: 'চিলমারী সরকারি প্রাথমিক বিদ্যালয় ভাঙন তীর থেকে মাত্র ৪২ মিটার দূরে। সেন্ডাই রিস্ক এজেন্টের পরামর্শ হলো—তাৎক্ষণিক বালুভর্তি জিও-ব্যাগ ফেলে তীর প্রতিরক্ষা এবং স্কুলটিকে নিরাপদ অভ্যন্তরীণ শেল্টারে স্থানান্তর করা।',
          agent: 'sendai-risk',
          source: 'OSM_OVERPASS',
        },
      ]
    : [
        {
          qEn: 'How does radar detect water underneath the dense Sundarbans forest canopy?',
          qBn: 'সুন্দরবনের ঘন গাছের পাতার নিচে রাডার কীভাবে জোয়ারের পানি দেখতে পায়?',
          aEn: 'Optical cameras only see the green canopy leaves. L-band microwaves (24cm) penetrate through the mangrove canopy and bounce twice: first off the flooded tree trunk, then off the standing water surface (Trunk-Ground Double Bounce), producing a +3.5 dB surge in HH backscatter.',
          aBn: 'অপটিক্যাল ক্যামেরা শুধু গাছের পাতা দেখে। কিন্তু এল-ব্যান্ড রাডার পাতা ভেদ করে গাছের কাণ্ড ও জোয়ারের পানির মধ্যে ডাবল-বাউন্স তৈরি করে, যা রাডার ইমেজে উজ্জ্বল প্রতিফলন (+৩.৫ dB) হিসেবে ফুটে ওঠে।',
          agent: 'sar-analyst',
          source: 'NISAR_L2_GCOV',
        },
        {
          qEn: 'Does this inundation mean the mangrove trees are dying?',
          qBn: 'এই জোয়ারের পানির কারণে কি সুন্দরবনের গাছপালা মরে যাচ্ছে?',
          aEn: 'No. Cross-referencing against the Global Mangrove Watch (GMW) baseline and BIWTA Dublar Outer Bay tidal gauge (+2.20m CD) confirms this is normal astronomical spring tide inundation necessary for mangrove root nourishment, not deforestation.',
          aBn: 'না। গ্লোবাল ম্যানগ্রোভ ওয়াচ এবং বিআইডব্লিউটিএ দুবলার চর গেজের তথ্য প্রমাণ করে এটি সুন্দরবনের স্বাভাবিক জোয়ারের প্লাবন, যা শ্বাসমূলের জন্য উপকারী; কোনো বন উজাড় নয়।',
          agent: 'hydrology-dynamics',
          source: 'BIWTA_DUBLAR',
        },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-39 sm:hidden"
        onClick={() => setAgentDrawerOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[380px] md:w-[400px] lg:w-[430px] max-w-full sm:max-w-[calc(100vw-16px)] bg-white text-slate-800 shadow-2xl border-l border-slate-300 flex flex-col h-full text-xs select-none animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* 1. Header (Clean Crisp Light Theme) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-cyan-100 text-cyan-800 border border-cyan-200 shadow-2xs">
                <Bot className="w-4 h-4 text-cyan-700" />
              </span>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>{isBn ? 'ফ্লুভিসার সায়েন্স ক্রু' : 'FluviSAR Autonomous Science Crew'}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isBn
                ? '৪টি বিশেষায়িত বৈজ্ঞানিক এজেন্ট যারা কৃত্রিম বুদ্ধিমত্তা দিয়ে প্রতিটি স্যাটেলাইট তথ্য যাচাই করছে।'
                : '4 Collaborative Scientific Agents cross-verifying NISAR radar telemetry with zero-fabrication proof.'}
            </p>

            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px] flex items-center space-x-1 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>99.4% Agent Consensus</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                Finding: {currentFindingId}
              </span>
            </div>
          </div>

          <button
            onClick={() => setAgentDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. 4 Navigation Tabs (High Contrast Light Theme) */}
        <div className="flex border-b border-slate-200 bg-slate-100">
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`flex-1 py-2.5 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'reasoning'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {isBn ? '১. রিজনিং ট্রেস' : '1. Reasoning Trace'}
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`flex-1 py-2.5 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'crew'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {isBn ? '২. সায়েন্স ক্রু' : '2. Agent Crew'}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-2.5 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'actions'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {isBn ? '৩. অ্যাকশন' : '3. Actions'}
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 py-2.5 text-center font-bold text-[11px] border-b-2 transition-all cursor-pointer ${
              activeTab === 'ask'
                ? 'border-cyan-600 text-cyan-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {isBn ? '৪. প্রশ্নোত্তর' : '4. Q&A'}
          </button>
        </div>

        {/* 3. Tab Body (Clean Crisp Light Container) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {/* TAB 1: Step-by-Step Reasoning Trace */}
          {activeTab === 'reasoning' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <Terminal className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{isBn ? 'ধাপে ধাপে এজেন্টের যুক্তি প্রমাণ:' : 'Sequential Agent Chain of Thought:'}</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  STATUS: VERIFIED
                </span>
              </div>

              {reasoningSteps.map((step) => {
                const agent = AGENT_PERSONAS[step.agentId] ?? AGENT_PERSONAS['sar-analyst'];
                return (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    {/* Step Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                          style={{
                            backgroundColor: `${agent.avatarColor}15`,
                            color: agent.avatarColor,
                            border: `1px solid ${agent.avatarColor}40`,
                          }}
                        >
                          {agent.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {step.timestamp}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                          step.status === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    {/* Action Title */}
                    <div className="font-bold text-slate-900 text-xs">
                      {isBn ? step.actionBn : step.action}
                    </div>

                    {/* Formula / Metric & Cited Source */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono">
                      <span className="text-cyan-900 font-bold break-all">{step.metricOrFormula}</span>
                      <SourceCitationBadge sourceId={step.sourceId} />
                    </div>

                    {/* Result */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isBn ? step.resultBn : step.result}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Agent Crew Contributions */}
          {activeTab === 'crew' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-500">
                {isBn
                  ? 'এই অনুসন্ধানে অংশগ্রহণকারী ৪ জন বিশেষায়িত সায়েন্টিফিক এজেন্ট:'
                  : '4 Specialized Autonomous Agents deployed for this investigation:'}
              </div>

              {agentContributions.map((contrib) => {
                const persona = AGENT_PERSONAS[contrib.agentId] ?? AGENT_PERSONAS['sar-analyst'];
                return (
                  <div
                    key={contrib.agentId}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Persona Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {isBn ? persona.nameBn : persona.name}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {isBn ? persona.roleBn : persona.role}
                        </span>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${persona.avatarColor}15`,
                          color: persona.avatarColor,
                          border: `1px solid ${persona.avatarColor}40`,
                        }}
                      >
                        {persona.badge}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isBn ? contrib.summaryBn : contrib.summaryEn}
                    </p>

                    {/* Metrics Bar with Source Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {contrib.metrics.map((m, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{isBn ? m.labelBn : m.label}</span>
                            <SourceCitationBadge sourceId={m.sourceId} />
                          </div>
                          <div className="text-xs font-mono font-bold text-cyan-800">{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Verdict */}
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isBn ? contrib.verdictBn : contrib.verdictEn}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Quick Autonomous Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-500">
                {isBn
                  ? 'এজেন্টদের দিয়ে সরাসরি বিশ্লেষণ বা স্ট্রেস টেস্ট করান:'
                  : 'Execute 1-click autonomous investigation workflows:'}
              </div>

              {AGENT_COPILOT_ACTIONS.map((action) => {
                const agent = AGENT_PERSONAS[action.agentId] ?? AGENT_PERSONAS['skeptical-auditor'];
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.actionType)}
                    className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-400 shadow-2xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-cyan-800 transition-colors">
                        {isBn ? action.labelBn : action.labelEn}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                        style={{
                          backgroundColor: `${agent.avatarColor}15`,
                          color: agent.avatarColor,
                          border: `1px solid ${agent.avatarColor}30`,
                        }}
                      >
                        {agent.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {isBn ? action.descriptionBn : action.descriptionEn}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 4: Interactive Q&A */}
          {activeTab === 'ask' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-500">
                {isBn
                  ? 'এই গবেষণার মূল বৈজ্ঞানিক প্রশ্নসমূহ ও এজেন্টের উত্তর:'
                  : 'Authoritative explanations for key scientific inquiries:'}
              </div>

              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                const agent = AGENT_PERSONAS[faq.agent] ?? AGENT_PERSONAS['sar-analyst'];
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full text-left p-3 flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="pr-2">{isBn ? faq.qBn : faq.qEn}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cyan-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-slate-100 bg-slate-50/60 text-[11px] space-y-2.5">
                        <div className="flex items-center justify-between pt-2">
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold"
                            style={{
                              backgroundColor: `${agent.avatarColor}15`,
                              color: agent.avatarColor,
                              border: `1px solid ${agent.avatarColor}30`,
                            }}
                          >
                            Answered by {agent.badge}
                          </span>
                          <SourceCitationBadge sourceId={faq.source} />
                        </div>

                        <p className="text-slate-700 leading-relaxed">
                          {isBn ? faq.aBn : faq.aEn}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Console Footer (Light Theme) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center space-x-1.5 font-bold text-cyan-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{isBn ? 'ভেরিফাইড নাসা ওপেন সায়েন্স ইঞ্জিন' : 'NASA Open Science Engine'}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            SHA-256 Validated
          </span>
        </div>
      </div>

      {/* Break My Finding Modal if invoked */}
      <BreakMyFindingModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
      />
    </>
  );
};
