import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Bot, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

export const AgentStatusBanner: React.FC = () => {
  const { isAgentDrawerOpen, setAgentDrawerOpen, language } = useWorkspaceStore();
  const isBn = language === 'bn';

  return (
    <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2 px-2.5 py-0.5 lg:py-1 rounded-full bg-white border border-[#CBD5E1] shadow-2xs text-xs select-none hover:border-cyan-500 transition-all shrink-0">
      {/* Pulsing Live Indicator */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-bold text-[11px] text-[#155E75] flex items-center space-x-1">
          <Bot className="w-3.5 h-3.5 text-cyan-600" />
          <span>{isBn ? 'সায়েন্স ক্রু' : 'Science Crew'}</span>
        </span>
      </div>

      {/* 4 Agent Mini Pills (Only on XL+ screens to prevent laptop layout breaking) */}
      <div className="hidden xl:flex items-center space-x-1 text-[10px] font-mono font-bold">
        <span className="text-slate-300">|</span>
        <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200">
          🛰️ SAR
        </span>
        <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
          🌊 Hydro
        </span>
        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200">
          🛡️ Sendai
        </span>
        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
          ⚖️ Auditor
        </span>
      </div>

      <span className="text-slate-300">|</span>

      {/* Consensus Score */}
      <div className="flex items-center space-x-1 text-[10px] lg:text-[11px] text-emerald-700 font-bold font-mono shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>99.4% {isBn ? 'ঐকমত্য' : 'Consensus'}</span>
      </div>

      {/* Trigger Button */}
      <button
        onClick={() => setAgentDrawerOpen(!isAgentDrawerOpen)}
        className="ml-1 px-2 py-0.5 rounded-full bg-[#155E75] hover:bg-[#0E7490] text-white font-bold text-[10px] flex items-center space-x-1 transition-all shadow-2xs cursor-pointer hover:scale-105 shrink-0"
        title="Open Full Autonomous Science Console"
      >
        <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
        <span className="hidden sm:inline">{isBn ? 'ট্রেস' : 'Trace'}</span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};
