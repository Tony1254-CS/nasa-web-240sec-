import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import {
  Compass,
  Eye,
  Calendar,
  Database,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Activity,
  Trees,
  Layers,
} from 'lucide-react';

export const AtlasView: React.FC = () => {
  const { language, setRegion, setView, setActiveFeature } = useWorkspaceStore();
  const t = i18n[language];
  const isBn = language === 'bn';

  const handleSelectRegion = (region: 'jamuna' | 'sundarbans', view: 'J1' | 'S1') => {
    setRegion(region);
    setView(view);
  };

  const handleQuickFeature = (featureId: string) => {
    setActiveFeature(featureId);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-start p-6 overflow-y-auto bg-gradient-to-b from-white/95 via-[#F4F7FA]/90 to-[#F4F7FA]/95 backdrop-blur-sm">
      {/* 1. Hero Header */}
      <div className="max-w-4xl w-full text-center mt-3 mb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] text-xs font-semibold mb-3 border border-[#BAE6FD]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>NASA-ISRO SAR (NISAR) Bangladesh Observatory</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight">
          {isBn ? 'নদী ও সুন্দরবনের রূপান্তর পর্যবেক্ষণ' : 'Observing Bangladesh in the Radar Mirror'}
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
          {isBn
            ? 'যমুনা নদীভাঙন ও সুন্দরবনের বাস্তব স্যাটেলাইট পর্যবেক্ষণ। মেঘের আড়ালে মাটির ক্ষয় ও ক্যানোপি ভেদ করে পানির প্রবাহ দেখার দ্বৈত-সেন্সর প্ল্যাটফর্ম।'
            : 'Track braided river changes and mangrove tidal dynamics using calibrated NISAR L-band & Sentinel-2 observations. Test physical hypotheses and discover actionable field decisions.'}
        </p>

        {/* Live Impact Counters Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'যমুনা নদীভাঙন' : 'Bank Collapse'}</span>
            <span className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">145.8 ha</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'ক্যানোপি জোয়ার' : 'Tidal Sub-Canopy'}</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">312 ha</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'স্যাটেলাইট ট্রানজিট' : 'Observation Passes'}</span>
            <span className="text-sm font-extrabold text-[#155E75] font-mono mt-0.5">6 Passes</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'স্বয়ংক্রিয় অডিট' : 'QC Validation'}</span>
            <span className="text-sm font-extrabold text-purple-600 font-mono mt-0.5">7/7 Checks</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Feature Spotlight Cards */}
      <div className="max-w-4xl w-full mb-6">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center sm:text-left">
          {isBn ? '✨ দ্রুত যেকোনো ফিচার সরাসরি পরীক্ষা করুন:' : '✨ Explore Specific Features Directly:'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleQuickFeature('time-machine')}
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#155E75] hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-[#155E75] group-hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A43]">{isBn ? 'টাইম মেশিন' : 'Time Machine'}</div>
              <div className="text-[10px] text-slate-500">{isBn ? 'বন্যা সোয়াইপ' : 'Before vs After'}</div>
            </div>
          </button>

          <button
            onClick={() => handleQuickFeature('chilmari-erosion')}
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A43]">{isBn ? 'চিলমারী ভাঙন' : 'Chilmari Erosion'}</div>
              <div className="text-[10px] text-slate-500">145.8 ha retreat</div>
            </div>
          </button>

          <button
            onClick={() => handleQuickFeature('mangrove-pulse')}
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A43]">{isBn ? 'সুন্দরবন জোয়ার' : 'Mangrove Pulse'}</div>
              <div className="text-[10px] text-slate-500">312 ha canopy X-ray</div>
            </div>
          </button>

          <button
            onClick={() => handleQuickFeature('sat-vs-radar')}
            className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#102A43]">{isBn ? 'স্যাট বনাম রাডার' : 'Sat vs Radar'}</div>
              <div className="text-[10px] text-slate-500">Sensor Duel</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Two Regional Exploration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full">
        {/* Jamuna Region Card */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
          <div className="h-40 bg-gradient-to-tr from-[#0F172A] to-[#1E3A8A] p-5 flex flex-col justify-between text-white relative">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#0284C7]/80 backdrop-blur-xs">
                BRAIDED RIVER DYNAMICS
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>44 GCOV Granules</span>
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.regions.jamuna}</h2>
              <p className="text-xs text-slate-300 mt-1">Chilmari–Roumari Reach (25.40°N–25.75°N, 89.60°E–89.90°E)</p>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#155E75] uppercase tracking-wide">Primary Investigation</div>
              <p className="text-sm font-semibold text-[#102A43] mt-1">
                {isBn
                  ? 'কোথায় স্থায়ী নদীভাঙন ঘটেছে আর কোথায় সাময়িক পানি? চরের কৃষিজমি ও স্কুল-ক্লিনিকের সংযোগে কী প্রভাব পড়ছে?'
                  : 'What changed in river & floodplain land? How does agricultural recovery differ, and which service link needs checking?'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#475569] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#155E75]" />
                  <span>Jun 17 – Oct 30, 2026</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-[#155E75]" />
                  <span>L-band GCOV, GUNW, S2</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                onClick={() => handleSelectRegion('jamuna', 'J1')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#155E75] hover:bg-[#0E7490] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isBn ? 'যমুনা পর্যবেক্ষণ শুরু করুন' : 'Launch Jamuna Observatory'}</span>
              </button>
              <button
                onClick={() => handleSelectRegion('jamuna', 'J1')}
                className="flex items-center space-x-1 px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] text-sm font-medium transition-colors cursor-pointer"
                title="Direct Map"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sundarbans Region Card */}
        <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
          <div className="h-40 bg-gradient-to-tr from-[#064E3B] to-[#047857] p-5 flex flex-col justify-between text-white relative">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#059669]/80 backdrop-blur-xs">
                MANGROVE WETLAND & CANOPY
              </span>
              <span className="flex items-center space-x-1 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>64 GCOV Granules</span>
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.regions.sundarbans}</h2>
              <p className="text-xs text-emerald-200 mt-1">Dublar Char – Passur Channel (21.75°N–22.00°N, 89.55°E–89.85°E)</p>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#047857] uppercase tracking-wide">Primary Investigation</div>
              <p className="text-sm font-semibold text-[#102A43] mt-1">
                {isBn
                  ? 'জোয়ারের সময় বনের ভেতরের পানি ও রাডার সিগন্যাল কীভাবে পরিবর্তিত হয়? গাছের তলার প্লাবিত জমির পরিমাণ কত?'
                  : 'How do wetland water, radar response, greenness and forest boundaries change under tidal context?'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#475569] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Jun 17 – Oct 30, 2026</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Dual-Pol HH/HV, Pauli, S2</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center space-x-3">
              <button
                onClick={() => handleSelectRegion('sundarbans', 'S1')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isBn ? 'সুন্দরবন পর্যবেক্ষণ শুরু করুন' : 'Launch Sundarbans Observatory'}</span>
              </button>
              <button
                onClick={() => handleSelectRegion('sundarbans', 'S1')}
                className="flex items-center space-x-1 px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] text-sm font-medium transition-colors cursor-pointer"
                title="Direct Map"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Distinction Footer */}
      <div className="mt-6 text-center text-xs text-[#64748B] max-w-xl pb-6">
        <p>
          {isBn
            ? 'FluviSAR প্রতিটি পরিমাপের উৎস, মেথড এবং লিমিটেশন দৃশ্যমান রাখে। কোনো ফলাফল শতভাগ নিশ্চিত বলে দাবি করা হয় না যতক্ষণ না তা স্বতন্ত্র যাচাইয়ে উত্তীর্ণ হয়।'
            : 'FluviSAR preserves full data provenance, parameters, and limitations. Robustness across settings is explicitly separated from ground-truth probability.'}
        </p>
      </div>
    </div>
  );
};
