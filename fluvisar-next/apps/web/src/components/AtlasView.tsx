import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Compass, Eye, Calendar, Database, CheckCircle2 } from 'lucide-react';

export const AtlasView: React.FC = () => {
  const { language, setRegion, setView } = useWorkspaceStore();
  const t = i18n[language];

  const handleSelectRegion = (region: 'jamuna' | 'sundarbans', view: 'J1' | 'S1') => {
    setRegion(region);
    setView(view);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-start p-6 overflow-y-auto bg-gradient-to-b from-white/95 via-[#F4F7FA]/90 to-[#F4F7FA]/95 backdrop-blur-sm">
      {/* Hero Header */}
      <div className="max-w-4xl w-full text-center mt-4 mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] text-xs font-semibold mb-3 border border-[#BAE6FD]">
          <span>NASA-ISRO SAR (NISAR) Bangladesh Observatory</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#102A43] tracking-tight">
          {language === 'bn' ? 'নদী ও সুন্দরবনের রূপান্তর পর্যবেক্ষণ' : 'Observing Bangladesh in the Radar Mirror'}
        </h1>
        <p className="mt-3 text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
          {language === 'bn'
            ? 'যমুনা ও সুন্দরবনের বাস্তব NISAR satellite observations থেকে পরিবর্তন দেখুন, কেন এমন হতে পারে পরীক্ষা করুন এবং মানুষের ও পরিবেশের জন্য কোন সিদ্ধান্ত জরুরি তা নির্ধারণ করুন।'
            : 'Track braided river changes and mangrove tidal dynamics using calibrated NISAR L-band observations. Test physical hypotheses and discover actionable field decisions.'}
        </p>
      </div>

      {/* Two Regional Exploration Cards (plan.md Section 4.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Jamuna Region Card */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
          <div className="h-44 bg-gradient-to-tr from-[#0F172A] to-[#1E3A8A] p-5 flex flex-col justify-between text-white relative">
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
                {language === 'bn'
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
                  <span>L-band GCOV, GUNW, SME2</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => handleSelectRegion('jamuna', 'J1')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#155E75] hover:bg-[#0E7490] text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'bn' ? 'তদন্ত শুরু করুন' : 'Start Investigation'}</span>
              </button>
              <button
                onClick={() => handleSelectRegion('jamuna', 'J1')}
                className="flex items-center space-x-1 px-3 py-2.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] text-sm font-medium transition-colors"
                title="Explore Map Directly"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sundarbans Region Card */}
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
          <div className="h-44 bg-gradient-to-tr from-[#064E3B] to-[#047857] p-5 flex flex-col justify-between text-white relative">
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
                {language === 'bn'
                  ? 'জোয়ারের সময় বনের ভেতরের পানি, সবুজত্ব ও রাডার সিগন্যাল কীভাবে পরিবর্তিত হয়? পুনরুদ্ধার দাবির সত্যতা কী?'
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

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={() => handleSelectRegion('sundarbans', 'S1')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-[#047857] hover:bg-[#065F46] text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'bn' ? 'তদন্ত শুরু করুন' : 'Start Investigation'}</span>
              </button>
              <button
                onClick={() => handleSelectRegion('sundarbans', 'S1')}
                className="flex items-center space-x-1 px-3 py-2.5 rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] text-sm font-medium transition-colors"
                title="Explore Map Directly"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Distinction Footer */}
      <div className="mt-8 text-center text-xs text-[#64748B] max-w-xl">
        <p>
          {language === 'bn'
            ? 'FluviSAR প্রতিটি পরিমাপের উৎস, মেথড এবং লিমিটেশন দৃশ্যমান রাখে। কোনো ফলাফল শতভাগ নিশ্চিত বলে দাবি করা হয় না যতক্ষণ না তা স্বতন্ত্র যাচাইয়ে উত্তীর্ণ হয়।'
            : 'FluviSAR preserves full data provenance, parameters, and limitations. Robustness across settings is explicitly separated from ground-truth probability.'}
        </p>
      </div>
    </div>
  );
};
