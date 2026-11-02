import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  Compass,
  BookOpen,
  GraduationCap,
  Waves,
  Trees,
  ShieldCheck,
  Activity,
  ArrowRight,
  Globe,
  Radio,
  Sparkles,
  Bot
} from 'lucide-react';
import { SourceCitationBadge } from './SourceCitationBadge';

export const LandingPageView: React.FC = () => {
  const navigate = useNavigate();
  const { setRegion, setView, language, setAgentDrawerOpen } = useWorkspaceStore();
  const isBn = language === 'bn';

  const handleLaunchDeck = (region: 'jamuna' | 'sundarbans') => {
    setRegion(region);
    setView(region === 'jamuna' ? 'J1' : 'S1');
    navigate(`/observatory/${region}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070D18] text-slate-100 select-none scroll-smooth">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Ambient cosmic gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none -z-0" />

        <div className="relative max-w-6xl mx-auto text-center z-10">
          {/* Badge & Autonomous Agent Presence */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isBn ? 'নাসা স্পেস অ্যাপস চ্যালেঞ্জ ২০২৬ • গ্লোবাল অবজারভেটরি' : 'NASA Space Apps Challenge 2026 • Global Observatory'}</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-200">NISAR L-Band Radar</span>
            </div>

            <button
              onClick={() => setAgentDrawerOpen(true)}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400/60 text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? '🤖 স্বায়ত্তশাসিত সায়েন্স ক্রু সক্রিয়' : '🤖 Autonomous AI Science Crew Active'}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            F l u v i <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">S A R</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            {isBn ? (
              <>
                বর্ষায় যখন ঘন মেঘে অপটিক্যাল স্যাটেলাইট অন্ধ হয়ে যায়, তখন <span className="text-cyan-300 font-medium">FluviSAR</span> রাডার মাইক্রোওয়েভ দিয়ে মেঘ ভেদ করে নদীভাঙন শনাক্ত করে, প্লাবনভূমির ক্ষতি নিরূপণ করে এবং প্রতিটি ফলাফল বৈজ্ঞানিকভাবে প্রমাণ করে।
              </>
            ) : (
              <>
                When heavy monsoon overcast blinds optical satellites, <span className="text-cyan-300 font-medium">FluviSAR</span> leverages cloud-penetrating L-band radar to distinguish permanent river erosion from flood recession with zero-fabricated empirical proof.
              </>
            )}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => handleLaunchDeck('jamuna')}
              className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Compass className="w-5 h-5" />
              <span>{isBn ? 'লাইভ অবজারভেটরি চালু করুন' : 'Launch Live Observatory'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/stories')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm backdrop-blur-md hover:scale-105 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{isBn ? 'সিনেমাটিক স্টোরি মোড' : 'Scientific Story Mode'}</span>
            </button>

            <button
              onClick={() => navigate('/learn')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm backdrop-blur-md hover:scale-105 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ইন্টারেক্টিভ SAR ল্যাব' : 'Interactive SAR Lab'}</span>
            </button>
          </div>

          {/* 4 Telemetry Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-rose-400">145.8 ha</span>
                  <SourceCitationBadge sourceId="NISAR_L2_GCOV" />
                </div>
                <div className="text-xs font-bold text-slate-300">{isBn ? 'চিলমারী নিশ্চিত নদীভাঙন' : 'Chilmari Confirmed Erosion'}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">γ⁰ ≤ -14 dB Core Cut</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400">8,200+</span>
                  <SourceCitationBadge sourceId="WORLDPOP_BGD" />
                </div>
                <div className="text-xs font-bold text-slate-300">{isBn ? 'ক্ষতিগ্রস্ত উপকূলীয় মানুষ' : 'Vulnerable Population'}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">1 School · 120m Road Cut</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">0% Cloud</span>
                  <SourceCitationBadge sourceId="NISAR_L2_GCOV" />
                </div>
                <div className="text-xs font-bold text-slate-300">{isBn ? 'সব আবহাওয়ায় দৃশ্যমান' : 'All-Weather SAR Radar'}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">24cm L-Band Microwave</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md text-left flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">7-Check</span>
                  <SourceCitationBadge sourceId="COPERNICUS_S2A" />
                </div>
                <div className="text-xs font-bold text-slate-300">{isBn ? 'বৈজ্ঞানিক অডিট সনদ' : 'Cryptographic Lineage'}</div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono">SHA-256 Provenance QC</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL OBSERVATION DECKS (GATEWAYS) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
            {isBn ? 'অঞ্চলের নির্বাচন' : 'Study Regions'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
            {isBn ? 'দুটি সংবেদনশীল পরিবেশগত পর্যবেক্ষণ কেন্দ্র' : 'Two High-Sensitivity Observation Decks'}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2">
            {isBn
              ? 'ব্রহ্মপুত্র-যমুনার খরস্রোতা ভাঙন বলয় অথবা সুন্দরবনের জোয়ার-ভাটা প্লাবিত ম্যানগ্রোভ ক্যানোপি পরীক্ষা করুন।'
              : 'Directly jump into calibrated Sentinel-2 optical and NISAR SAR radar time-series over Bangladesh.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Deck 1: Jamuna River */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0A1628] border border-cyan-500/20 hover:border-cyan-400/50 p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Waves className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{isBn ? 'যমুনা নদী অববাহিকা' : 'Jamuna River Basin'}</h3>
                  <span className="text-xs text-cyan-400 font-mono">Braided River Dynamics · Kurigram & Gaibandha</span>
                </div>
              </div>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-800">
                44 Granules
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {isBn
                ? 'তীব্র বর্ষার পর যমুনার গতিপথ পরিবর্তন, চিলমারী পশ্চিম পাড়ের ১৪৫.৮ হেক্টর ভাঙন এবং মন্ডলের চরের নতুন পলি জমার বৈজ্ঞানিক মানচিত্রায়ন।'
                : 'Braided thalweg migration, Chilmari 145.8 ha bankline retreat, and post-monsoon sandbar accretion verified with equal-stage hydrological pairs (Δh ≤ 0.1m).'}
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs mb-6 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Analysis BBox</span>
                <span className="text-slate-200">89.6° - 89.9°E</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">GCOV Backscatter</span>
                <span className="text-cyan-300">-14.2 dB</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Gauge Datum</span>
                <span className="text-emerald-400">18.90m MSL</span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchDeck('jamuna')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 cursor-pointer transition-colors"
            >
              <span>{isBn ? 'যমুনা পর্যবেক্ষণ ডেস্কে প্রবেশ করুন' : 'Enter Jamuna Deck'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Deck 2: Sundarbans Mangrove */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0A1F18] border border-emerald-500/20 hover:border-emerald-400/50 p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Trees className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{isBn ? 'সুন্দরবন ম্যানগ্রোভ জলাভূমি' : 'Sundarbans Mangrove Wetland'}</h3>
                  <span className="text-xs text-emerald-400 font-mono">Tidal Pulse & Canopy X-Ray · Dublar Char</span>
                </div>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800">
                64 Granules
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {isBn
                ? 'ঘন বনের পাতার চাঁদোয়ার নিচে জোয়ারের পানি কীভাবে বাড়ে ও কমে, তা অপটিক্যাল চোখে অদৃশ্য থাকলেও এল-ব্যান্ড রাডারের এইচএইচ পোলারাইজেশন দিয়ে উন্মোচন।'
                : 'World’s largest contiguous mangrove wetland. Dual-polarization (HH/HV) isolates double-bounce sub-canopy tidal inundation (+3.5 dB) invisible to standard cameras.'}
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs mb-6 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Analysis BBox</span>
                <span className="text-slate-200">21.75° - 22.0°N</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Pauli Channels</span>
                <span className="text-emerald-300">HH, HV, HH-HV</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Canopy Penetration</span>
                <span className="text-cyan-400">24cm Radar</span>
              </div>
            </div>

            <button
              onClick={() => handleLaunchDeck('sundarbans')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-colors"
            >
              <span>{isBn ? 'সুন্দরবন ডেস্কে প্রবেশ করুন' : 'Enter Sundarbans Deck'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. WHY SAR RADAR? (VISUAL COMPARISON BREAKTHROUGH) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50">
              {isBn ? 'বৈজ্ঞানিক শ্রেষ্ঠত্ব' : 'Scientific Breakthrough'}
            </span>
            <h2 className="text-3xl font-bold text-white mt-3">
              {isBn ? 'কেন অপটিক্যাল নয়, এল-ব্যান্ড রাডার?' : 'Why SAR Radar? Overcoming The Monsoon Blindspot'}
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
              {isBn
                ? 'বাংলাদেশে বর্ষার মৌসুমে ৮৫% সময় আকাশ মেঘে ঢাকা থাকে। প্রচলিত স্যাটেলাইট তখন অকেজো, কিন্তু রাডার সম্পূর্ণ কার্যকর।'
                : 'Bangladesh faces 80-90% monsoon cloud cover when peak floods and bankline collapse occur.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Optical Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">Traditional Optical Satellites</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">BLINDED IN MONSOON</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{isBn ? 'প্রচলিত ক্যামেরা: ১০০% সাদা মেঘের আবরণ' : 'Optical RGB: Blocked by Dense Cloud Decks'}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isBn
                    ? 'দৃশ্যমান আলো মেঘের জলকণায় বাধা পায়। ফলে জুলাই ও আগস্টের বন্যায় কোথায় নদী ভাঙছে তা অপটিক্যাল ছবিতে দেখা অসম্ভব।'
                    : 'Visible wavelengths (0.4–0.7 μm) scatter completely in monsoon cloud tops, yielding zero usable ground imagery during active emergencies.'}
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-[11px] text-rose-200">
                ⚠️ Sentinel-2 / Landsat Cloud Cover in August: <strong>88% - 100% Blind</strong>
              </div>
            </div>

            {/* SAR Radar Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 flex flex-col justify-between shadow-xl shadow-cyan-950/40">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">NISAR L-band SAR Microwave</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">100% PENETRATION</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{isBn ? 'FluviSAR এল-ব্যান্ড রাডার: স্পষ্ট এক্স-রে দৃষ্টি' : 'L-Band (24 cm): Direct Surface Backscatter'}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isBn
                    ? '২৪ সেন্টিমিটার দীর্ঘ মাইক্রোওয়েভ তরঙ্গ মেঘ, কুয়াশা ও ভারী বৃষ্টি ভেদ করে মাটির আর্দ্রতা ও পানির মসৃণ তলে বাধা পেয়ে ফিরে আসে।'
                    : 'Long microwave wavelengths pass freely through precipitation and clouds, measuring mirror specular bounce from water (γ⁰ ≤ -14 dB) vs rough soil.'}
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-[11px] text-cyan-200 font-mono">
                ✓ 24/7 Day-and-Night · Cloud-Free Empirical River Mapping
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM ARCHITECTURE & 27 FEATURES DIRECTORY (BENTO GRID) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
            {isBn ? 'পূর্ণাঙ্গ ফিচার তালিকা' : 'Complete 27-Feature System'}
          </span>
          <h2 className="text-3xl font-bold text-white mt-3">
            {isBn ? 'সায়েন্টিফিক অবজারভেটরির ৫টি মূল স্তম্ভ' : 'The 5 Scientific Pillars of FluviSAR'}
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2">
            {isBn
              ? 'প্ল্যাটফর্মের প্রতিটি ফিচার আন্তর্জাতিক সেন্ডাই ফ্রেমওয়ার্ক এবং কঠোর বৈজ্ঞানিক নিয়মানুযায়ী সাজানো হয়েছে।'
              : 'Zero fabricated pixels. Every polygon, statistic, and recommendation is anchored in verifiable remote sensing data.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Core Observatory */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{isBn ? 'স্তম্ভ ১: কোর অবজারভেটরি' : 'Pillar 1: Core Observatory'}</h4>
              <p className="text-slate-400 text-xs mb-4">
                {isBn ? 'রিয়েলটাইম মানচিত্র, সোয়াইপ কম্প্যারিজন এবং রাডার পোলারাইজেশন।' : 'Foundational spatial layers, temporal swipe machine, and dual-polarization decomposition.'}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-400">W1</span>
                  <span>Earth Change Atlas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-400">W2</span>
                  <span>SAR Time Machine (↔ Swipe)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-400">W3</span>
                  <span>Radar Lens (HH/HV/Pauli)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-400">W4</span>
                  <span>Change Detection Engine</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-cyan-400">W5</span>
                  <span>Evidence & Confidence Inspector</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-cyan-400 font-bold">
              Always-on spatial foundation
            </div>
          </div>

          {/* Pillar 2: Trust & Stress Testing */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{isBn ? 'স্তম্ভ ২: সত্যতা ও স্ট্রেস টেস্ট' : 'Pillar 2: Integrity & Stress Testing'}</h4>
              <p className="text-slate-400 text-xs mb-4">
                {isBn ? 'অ্যালগরিদমের ফলাফলকে স্বয়ং চ্যালেঞ্জ করার ল্যাব ও ক্রিপ্টোগ্রাফিক সনদ।' : 'Counterfactual perturbation, cryptographic lineage, and transparent rejection of false positives.'}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">W6</span>
                  <span>Break My Finding (Otsu Slider)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">W10</span>
                  <span>The Change Passport (SHA-256)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">M1</span>
                  <span>Equal-Stage Twin Pair Selector</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">M4</span>
                  <span>Null Result Room (Rejections)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">W7</span>
                  <span>River Memory (Historic Thalweg)</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-rose-400 font-bold">
              Scientific defensibility
            </div>
          </div>

          {/* Pillar 3: Human & Policy Impact */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{isBn ? 'স্তম্ভ ৩: মানুষ ও নীতিনির্ধারণ' : 'Pillar 3: Human & Policy Action'}</h4>
              <p className="text-slate-400 text-xs mb-4">
                {isBn ? 'ক্ষতিগ্রস্ত জনপদ, ১-পাতার অফিশিয়াল পিডিএফ এবং ফিল্ড কিউআর কোড।' : 'Sendai-aligned impact ledger, printable executive briefs, and smartphone field bridge.'}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="text-amber-400">W9</span>
                  <span>Exposure & Impact Lens</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-amber-400">W14</span>
                  <span>Decision Brief & Field QR Bridge</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-amber-400">W18</span>
                  <span>Instant High-Res Snapshot (PNG)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-amber-400">W20</span>
                  <span>3-Mode Audience Switcher</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-amber-400">W21</span>
                  <span>Bilingual Interface (EN / বাংলা)</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-amber-400 font-bold">
              Actionable for field officers
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pillar 4: Multi-Sensor Fusion & Future Scenarios */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{isBn ? 'স্তম্ভ ৪: পরিবেশগত ফিউশন ও ভবিষ্যত সিমুলেশন' : 'Pillar 4: Context Fusion & Scenarios'}</h4>
              <p className="text-slate-400 text-xs mb-4">
                {isBn ? 'রাডারের সাথে নদী গেজ, বৃষ্টিপাত, গাছপালা এবং +১.০ মিটার বন্যা সিমুলেশন।' : 'Synchronized 4-sensor timeline axis, InSAR centimeter motion, and flood scenario modeling.'}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="text-purple-400">W8</span>
                  <span>Multisensor Environmental Fusion (4-Track)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-400">W13</span>
                  <span>Scenario Laboratory (+1.0m Simulation)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-400">W24</span>
                  <span>InSAR Fringe Stage (cm ground motion)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-purple-400">W23</span>
                  <span>Coverage Curtain (78% orbit pass)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-purple-400 font-bold">
              Predictive & corroborative
            </div>
          </div>

          {/* Pillar 5: High-Impact Experience & Science Labs */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{isBn ? 'স্তম্ভ ৫: অভিজ্ঞতা ও বিজ্ঞান ল্যাব' : 'Pillar 5: Experience & Science Education'}</h4>
              <p className="text-slate-400 text-xs mb-4">
                {isBn ? 'শব্দে রাডার সংকেত শোনা, বাস্তব অপটিক্যাল তুলনা এবং ফিজিক্স সিমুলেটর।' : 'Web Audio sonification, optical-to-radar swipe, and 4 interactive laboratory physics experiments.'}
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">W11</span>
                  <span>Radar-to-Reality (Sat vs Radar toggle)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">W12</span>
                  <span>Scientific Story Mode (5 Chapters)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">W22</span>
                  <span>Web Audio Sonification ("Feel the River")</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">W27</span>
                  <span>Interactive SAR Lab (Speckle/Cloud/Fringe)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">W26</span>
                  <span>Split-Screen vs Swipe Switcher</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-emerald-400 font-bold">
              Immersive, educational & accessible
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER & NASA CREDENTIALS */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-[#050A14] text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold font-mono">
              FS
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">FluviSAR Web Observatory</span>
              <p className="text-[11px] text-slate-400">
                NASA Space Apps Challenge 2026 · Powered by NASA NISAR, ESA Sentinel-1/2, and FFWC Hydrology
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLaunchDeck('jamuna')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              {isBn ? 'যমুনা পর্যবেক্ষণ ➔' : 'Jamuna Deck ➔'}
            </button>
            <button
              onClick={() => handleLaunchDeck('sundarbans')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              {isBn ? 'সুন্দরবন পর্যবেক্ষণ ➔' : 'Sundarbans Deck ➔'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
