import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { WorkspaceMode, Audience } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Globe, Compass, BookOpen, GraduationCap, FileText, Languages, Volume2, VolumeX, Home, Bot, ShieldCheck } from 'lucide-react';
import { DecisionBriefModal } from './DecisionBriefModal';
import { AgentStatusBanner } from './AgentStatusBanner';
import { radarSonifier } from '../utils/sonification';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    regionId,
    caseId,
    mode,
    language,
    audience,
    isSonificationEnabled,
    setRegion,
    setCase,
    setMode,
    setLanguage,
    setAudience,
    toggleSonification,
    selectedSample,
    isAgentDrawerOpen,
    setAgentDrawerOpen,
    setSelectedSourceId,
  } = useWorkspaceStore();

  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const t = i18n[language];

  const handleToggleAudio = () => {
    toggleSonification();
    if (!isSonificationEnabled) {
      radarSonifier.playToneForDb(selectedSample?.value ?? -14.0);
    } else {
      radarSonifier.stop();
    }
  };

  return (
    <>
      <header className="border-b border-[#CBD5E1] bg-white sticky top-0 z-30 select-none">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 h-14 border-b border-[#F1F5F9] gap-2 overflow-x-auto scrollbar-none">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#155E75] flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              FS
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg text-[#102A43] tracking-tight">{t.appName}</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-medium border border-[#BAE6FD]">
                  NISAR v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#475569] hidden lg:block leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </Link>

          {/* Center Primary Nav */}
          <nav className="flex items-center space-x-0.5 sm:space-x-1 shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t.nav.home ?? (language === 'bn' ? 'হোম' : 'Home')}</span>
            </NavLink>

            <NavLink
              to="/observatory"
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive || location.pathname.startsWith('/observatory')
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.nav.investigate}</span>
            </NavLink>

            <NavLink
              to="/atlas"
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t.nav.atlas}</span>
            </NavLink>

            <NavLink
              to="/stories"
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
              title="Scientific Narratives"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t.nav.stories}</span>
            </NavLink>

            <NavLink
              to="/learn"
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
              title="SAR Lab & Physics Twin"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">{t.nav.learn}</span>
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
                }`
              }
              title="Reproducible Reports & Briefs"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">{t.nav.reports}</span>
            </NavLink>
          </nav>

          {/* Right Tools (Sonification, Lang & Audience) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Autonomous Science Crew Trigger */}
            <button
              onClick={() => setAgentDrawerOpen(!isAgentDrawerOpen)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
              title="Open Autonomous Scientific Multi-Agent Console"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">{language === 'bn' ? 'সায়েন্স ক্রু' : 'Agent Crew'}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>

            {/* Grounded Source Registry Trigger */}
            <button
              onClick={() => setSelectedSourceId('NISAR_L2_GCOV')}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#102A43] hover:bg-[#F8FAFC] text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="Inspect Verified NASA & Ground Sources Registry"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'bn' ? 'সোর্স রেজিস্ট্রি' : 'Sources'}</span>
            </button>

            {/* Audio Sonification Toggle (E22) */}
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                isSonificationEnabled
                  ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                  : 'border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
              title={isSonificationEnabled ? 'Mute Radar Sonification (E22)' : 'Enable Radar Sonification (E22)'}
            >
              {isSonificationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Audience Switcher */}
            <div className="hidden lg:flex items-center bg-[#F1F5F9] rounded-lg p-0.5 border border-[#E2E8F0] shrink-0">
              {(['public', 'decision', 'analyst'] as Audience[]).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudience(aud)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    audience === aud
                      ? 'bg-white text-[#102A43] shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#102A43]'
                  }`}
                >
                  {t.audience[aud]}
                </button>
              ))}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#102A43] hover:bg-[#F8FAFC] cursor-pointer shrink-0"
            >
              <Languages className="w-3.5 h-3.5 text-[#155E75]" />
              <span>{language === 'en' ? 'বাং' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Header: Region & Mission Switcher Strip (Responsive & Adaptive) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 min-h-[42px] bg-[#F8FAFC] text-xs gap-2 border-b border-[#CBD5E1] overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Region Selector */}
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-[#CBD5E1] shrink-0">
              <button
                onClick={() => {
                  setRegion('jamuna');
                  if (location.pathname.startsWith('/observatory')) {
                    navigate('/observatory/jamuna');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer text-xs ${
                  regionId === 'jamuna'
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#102A43]'
                }`}
              >
                {t.regions.jamuna}
              </button>
              <button
                onClick={() => {
                  setRegion('sundarbans');
                  if (location.pathname.startsWith('/observatory')) {
                    navigate('/observatory/sundarbans');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer text-xs ${
                  regionId === 'sundarbans'
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#102A43]'
                }`}
              >
                {t.regions.sundarbans}
              </button>
            </div>

            {/* Case Selection Pill */}
            <div className="hidden md:flex items-center space-x-1.5 text-[#475569] shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#64748B] hidden xl:inline">Mission:</span>
              <select
                value={caseId}
                onChange={(e) => setCase(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-md px-2 py-0.5 text-xs text-[#102A43] font-medium max-w-[150px] lg:max-w-[230px] truncate focus:outline-hidden focus:ring-1 focus:ring-[#155E75]"
              >
                {regionId === 'jamuna' ? (
                  <>
                    <option value="river-memory">Mission J1: River Memory</option>
                    <option value="floodplain-recovery">Mission J2: Floodplain Recovery</option>
                    <option value="service-continuity">Mission J3: Service Continuity</option>
                  </>
                ) : (
                  <>
                    <option value="wetland-pulse">Mission S1: Wetland Pulse</option>
                    <option value="forest-response">Mission S2: Mangrove Forest</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Live Autonomous Science Crew Telemetry Pill */}
          <AgentStatusBanner />

          {/* Mode Switcher: Explore / Investigate / Act */}
          <div className="flex items-center bg-[#E2E8F0] p-0.5 rounded-lg shrink-0">
            {(['explore', 'investigate', 'act'] as WorkspaceMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  mode === m
                    ? 'bg-[#102A43] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#102A43] hover:bg-[#E2E8F0]'
                }`}
              >
                {t.modes[m]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Decision Brief Modal */}
      <DecisionBriefModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
    </>
  );
};
