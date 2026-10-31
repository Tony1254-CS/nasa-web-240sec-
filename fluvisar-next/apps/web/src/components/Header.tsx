import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { WorkspaceMode, Audience } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Globe, Compass, BookOpen, GraduationCap, FileText, Languages, Volume2, VolumeX } from 'lucide-react';
import { DecisionBriefModal } from './DecisionBriefModal';
import { radarSonifier } from '../utils/sonification';

export const Header: React.FC = () => {
  const {
    activeTab,
    regionId,
    caseId,
    mode,
    language,
    audience,
    isSonificationEnabled,
    setActiveTab,
    setRegion,
    setCase,
    setView,
    setMode,
    setLanguage,
    setAudience,
    toggleSonification,
    selectedSample
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
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#F1F5F9]">
          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              setActiveTab('atlas');
              setView('M0');
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#155E75] flex items-center justify-center text-white font-bold shadow-xs">
              FS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-[#102A43] tracking-tight">{t.appName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1] font-medium border border-[#BAE6FD]">
                  NISAR v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#475569] hidden md:block leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Center Primary Nav */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => {
                setActiveTab('atlas');
                setView('M0');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'atlas'
                  ? 'bg-[#155E75] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t.nav.atlas}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('investigate');
                setView(regionId === 'jamuna' ? 'J1' : 'S1');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'investigate'
                  ? 'bg-[#155E75] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t.nav.investigate}</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-[#155E75] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
              }`}
              title="Scientific Narratives"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.nav.stories}</span>
            </button>

            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'learn'
                  ? 'bg-[#155E75] text-white shadow-xs'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
              }`}
              title="SAR Lab & Physics Twin"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.nav.learn}</span>
            </button>

            <button
              onClick={() => setIsReportsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43] transition-colors cursor-pointer"
              title="Reproducible Reports & Briefs"
            >
              <FileText className="w-4 h-4" />
              <span>{t.nav.reports}</span>
            </button>
          </nav>

          {/* Right Tools (Sonification, Lang & Audience) */}
          <div className="flex items-center space-x-2">
            {/* Audio Sonification Toggle (E22) */}
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSonificationEnabled
                  ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                  : 'border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
              title={isSonificationEnabled ? 'Mute Radar Sonification (E22)' : 'Enable Radar Sonification (E22)'}
            >
              {isSonificationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Audience Switcher */}
            <div className="flex items-center bg-[#F1F5F9] rounded-lg p-0.5 border border-[#E2E8F0]">
              {(['public', 'decision', 'analyst'] as Audience[]).map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudience(aud)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    audience === aud
                      ? 'bg-white text-[#102A43] shadow-xs'
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
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#102A43] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#155E75]" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Header: Region & Mission Switcher Strip */}
        <div className="flex items-center justify-between px-4 h-11 bg-[#F8FAFC] text-xs">
          <div className="flex items-center space-x-4">
            {/* Region Selector */}
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-[#CBD5E1]">
              <button
                onClick={() => setRegion('jamuna')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  regionId === 'jamuna'
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#102A43]'
                }`}
              >
                {t.regions.jamuna}
              </button>
              <button
                onClick={() => setRegion('sundarbans')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  regionId === 'sundarbans'
                    ? 'bg-[#155E75] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#102A43]'
                }`}
              >
                {t.regions.sundarbans}
              </button>
            </div>

            {/* Case Selection Pill */}
            <div className="hidden sm:flex items-center space-x-2 text-[#475569]">
              <span className="text-[11px] uppercase font-bold text-[#64748B]">Active Mission:</span>
              <select
                value={caseId}
                onChange={(e) => setCase(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded-md px-2 py-0.5 text-xs text-[#102A43] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#155E75]"
              >
                {regionId === 'jamuna' ? (
                  <>
                    <option value="river-memory">Mission J1: River Memory & Dynamics</option>
                    <option value="floodplain-recovery">Mission J2: Floodplain Recovery & Chars</option>
                    <option value="service-continuity">Mission J3: Service Continuity & Access</option>
                  </>
                ) : (
                  <>
                    <option value="wetland-pulse">Mission S1: Wetland Pulse & Canopy X-Ray</option>
                    <option value="forest-response">Mission S2: Mangrove Forest & Cyclone Recovery</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Mode Switcher: Explore / Investigate / Act */}
          <div className="flex items-center bg-[#E2E8F0] p-0.5 rounded-lg">
            {(['explore', 'investigate', 'act'] as WorkspaceMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
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
