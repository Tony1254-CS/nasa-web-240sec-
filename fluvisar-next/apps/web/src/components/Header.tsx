import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { WorkspaceMode, Audience } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Globe, Compass, BookOpen, GraduationCap, FileText, Languages, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    regionId,
    caseId,
    viewId,
    mode,
    language,
    audience,
    setRegion,
    setCase,
    setView,
    setMode,
    setLanguage,
    setAudience,
  } = useWorkspaceStore();

  const t = i18n[language];

  return (
    <header className="border-b border-[#CBD5E1] bg-white sticky top-0 z-30 select-none">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#F1F5F9]">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('M0')}>
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
            onClick={() => setView('M0')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewId === 'M0'
                ? 'bg-[#155E75] text-white shadow-xs'
                : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t.nav.atlas}</span>
          </button>

          <button
            onClick={() => setView(regionId === 'jamuna' ? 'J1' : 'S1')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewId !== 'M0'
                ? 'bg-[#E0F2FE] text-[#0369A1]'
                : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#102A43]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.nav.investigate}</span>
          </button>

          <button
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#F1F5F9]"
            title="Scientific Narratives"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.nav.stories}</span>
          </button>

          <button
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#F1F5F9]"
            title="SAR Lab & Physics Twin"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t.nav.learn}</span>
          </button>

          <button
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#F1F5F9]"
            title="Reproducible Reports & Briefs"
          >
            <FileText className="w-4 h-4" />
            <span>{t.nav.reports}</span>
          </button>
        </nav>

        {/* Right Tools (Lang & Audience) */}
        <div className="flex items-center space-x-2">
          {/* Audience Switcher */}
          <div className="flex items-center bg-[#F1F5F9] rounded-lg p-0.5 border border-[#E2E8F0]">
            {(['public', 'decision', 'analyst'] as Audience[]).map((aud) => (
              <button
                key={aud}
                onClick={() => setAudience(aud)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
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
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#102A43] hover:bg-[#F8FAFC]"
            title="Toggle Language (EN / বাংলা)"
          >
            <Languages className="w-3.5 h-3.5 text-[#155E75]" />
            <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Secondary Context & Mode Bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#F8FAFC] text-xs border-t border-[#F1F5F9]">
        {/* Region & Case Selection */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#64748B] font-medium">Region:</span>
            <div className="flex rounded-md bg-white border border-[#CBD5E1] p-0.5">
              <button
                onClick={() => setRegion('jamuna')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  regionId === 'jamuna'
                    ? 'bg-[#155E75] text-white'
                    : 'text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {t.regions.jamuna}
              </button>
              <button
                onClick={() => setRegion('sundarbans')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  regionId === 'sundarbans'
                    ? 'bg-[#155E75] text-white'
                    : 'text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {t.regions.sundarbans}
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-[#CBD5E1]" />

          {/* Case Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#64748B] font-medium">Case:</span>
            <select
              value={caseId}
              onChange={(e) => setCase(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded px-2 py-0.5 text-xs text-[#102A43] font-medium focus:outline-none focus:border-[#0284C7]"
            >
              {regionId === 'jamuna' ? (
                <>
                  <option value="river-memory">{t.cases['river-memory']}</option>
                  <option value="floodplain-recovery">{t.cases['floodplain-recovery']}</option>
                  <option value="service-continuity">{t.cases['service-continuity']}</option>
                </>
              ) : (
                <>
                  <option value="wetland-pulse">{t.cases['wetland-pulse']}</option>
                  <option value="forest-restoration">{t.cases['forest-restoration']}</option>
                </>
              )}
            </select>
          </div>

          <div className="h-4 w-px bg-[#CBD5E1]" />

          {/* Data Readiness Badge */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">GCOV Validated</span>
          </div>
        </div>

        {/* Workspace Mode (Explore -> Investigate -> Act) */}
        <div className="flex items-center space-x-1">
          {(['explore', 'investigate', 'act'] as WorkspaceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
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
  );
};
