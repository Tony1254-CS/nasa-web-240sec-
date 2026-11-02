import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { ViewId } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Layers, Activity, Navigation, X } from 'lucide-react';
import { SundarbansPolarizationPanel } from './SundarbansPolarizationPanel';
import { JamunaDecisionPanel } from './JamunaDecisionPanel';
import { InSARSpecialtyPanel } from './InSARSpecialtyPanel';
import { ScenarioLabPanel } from './ScenarioLabPanel';

export const LeftPanel: React.FC = () => {
  const { regionId, viewId, setView, language, mode, layerVisibility, toggleLayer, setLeftPanelOpen } = useWorkspaceStore();
  const t = i18n[language];
  const isBn = language === 'bn';

  // Specific views available per region (plan.md Section 6)
  const views: { id: ViewId; label: string; tag: string }[] =
    regionId === 'jamuna'
      ? [
          { id: 'J1', label: t.views.J1, tag: 'Radar / Transitions' },
          { id: 'J2', label: t.views.J2, tag: 'Floodplain / Recurrence' },
          { id: 'J3', label: t.views.J3, tag: 'OSM Services / Graph' },
          { id: 'X1', label: t.views.X1, tag: 'Relative LOS Motion' },
          { id: 'C1', label: t.views.C1, tag: 'Decision Scenario' },
        ]
      : [
          { id: 'S1', label: t.views.S1, tag: 'Dual-Pol / Tide Context' },
          { id: 'S2', label: t.views.S2, tag: 'Canopy / Restoration' },
          { id: 'X1', label: t.views.X1, tag: 'Phase Coherence' },
          { id: 'C1', label: t.views.C1, tag: 'Cross-Sensor Duel' },
        ];

  return (
    <div className="w-84 bg-white border-r border-[#CBD5E1] flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Workspace Mode Indicator Pill */}
      <div className={`px-3 py-2 border-b text-[11px] font-medium flex items-center justify-between ${
        mode === 'explore'
          ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
          : mode === 'investigate'
          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
      }`}>
        <span className="font-bold flex items-center space-x-1">
          <span>
            {mode === 'explore' ? '🔭 Explore' : mode === 'investigate' ? '🔬 Investigate' : '⚡ Act & Explain'}
          </span>
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
          {mode === 'explore' ? 'Discovery' : mode === 'investigate' ? 'Deep Physics' : 'Field Actions'}
          </span>
          <button
            onClick={() => setLeftPanelOpen(false)}
            className="p-1 rounded-md hover:bg-black/10 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MODE: EXPLORE -> Quick Focal Points Navigator */}
      {mode === 'explore' && (
        <div className="p-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="text-[#102A43] font-bold text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#155E75]" />
              <span>{isBn ? 'দ্রুত পর্যবেক্ষণ কেন্দ্র' : 'Quick Focal Points'}</span>
            </span>
            <span className="text-[10px] text-[#0284C7] font-semibold bg-[#E0F2FE] px-1.5 py-0.5 rounded">
              {regionId === 'jamuna' ? 'Jamuna Reach' : 'Sundarbans'}
            </span>
          </div>

          <div className="space-y-1.5">
            {regionId === 'jamuna' ? (
              <>
                <button
                  onClick={() => {
                    setView('J1');
                    const mapB = (window as any).__mapB;
                    if (mapB) mapB.flyTo({ center: [89.668, 25.568], zoom: 13.5, duration: 900 });
                  }}
                  className="w-full text-left p-2 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-[#DC2626]">
                    <span>🔴 {isBn ? 'চিলমারী পশ্চিম তীর ভাঙন' : 'Chilmari West Bank Retreat'}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">145.8 ha</span>
                  </div>
                  <div className="text-[10px] text-[#475569] mt-0.5">
                    {isBn ? 'বাঁধের দিকে ভাঙন অগ্রসর হচ্ছে (-৮.২ dB)' : 'Active cutbank retreating at 2.4m/day (-8.2 dB drop)'}
                  </div>
                </button>

                <button
                  onClick={() => {
                    setView('J2');
                    const mapB = (window as any).__mapB;
                    if (mapB) mapB.flyTo({ center: [89.735, 25.595], zoom: 13.2, duration: 900 });
                  }}
                  className="w-full text-left p-2 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#059669] hover:bg-[#F0FDF4] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-[#059669]">
                    <span>🌱 {isBn ? 'মন্ডলের চর নতুন পলি চর' : 'Mandaler Char Emergent Silt'}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">88.4 ha</span>
                  </div>
                  <div className="text-[10px] text-[#475569] mt-0.5">
                    {isBn ? 'পানি হ্রাস পেয়ে রবি ফসলের উপযোগী চর সৃষ্টি' : 'Emergent shoal post-flood with rising NDVI (+0.48)'}
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setView('S1');
                    const mapB = (window as any).__mapB;
                    if (mapB) mapB.flyTo({ center: [89.725, 21.825], zoom: 13.0, duration: 900 });
                  }}
                  className="w-full text-left p-2 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#EA580C] hover:bg-[#FFF7ED] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-[#EA580C]">
                    <span>🌊 {isBn ? 'দুবলার চর জোয়ার প্লাবন' : 'Dublar Sub-Canopy Tidal Pulse'}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">312 ha</span>
                  </div>
                  <div className="text-[10px] text-[#475569] mt-0.5">
                    {isBn ? 'পূর্ণ জোয়ারের সময় ডাবল বাউন্স (+৩.৫ dB)' : 'Trunk-ground double bounce return under canopy (+3.5 dB HH)'}
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Switcher Section */}
      <div className="p-3 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between text-[#64748B] font-bold uppercase tracking-wider text-[11px] mb-2">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#155E75]" />
            <span>Investigation Lenses</span>
          </span>
          <span className="font-mono text-[10px] text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded">
            {views.length} MODES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex flex-col text-left px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                viewId === v.id
                  ? 'bg-[#155E75] text-white shadow-xs font-semibold'
                  : 'text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] leading-tight">{v.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    viewId === v.id ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {v.id}
                </span>
              </div>
              <span className={`text-[10px] mt-0.5 ${viewId === v.id ? 'text-white/80' : 'text-[#64748B]'}`}>
                {v.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Specialized Panels */}
      {viewId === 'C1' ? (
        <ScenarioLabPanel />
      ) : viewId === 'X1' ? (
        <InSARSpecialtyPanel />
      ) : (
        <>
          {regionId === 'jamuna' && <JamunaDecisionPanel />}
          {regionId === 'sundarbans' && <SundarbansPolarizationPanel />}
        </>
      )}

      {/* Layers & Lenses Section */}
      <div className="p-3 border-b border-[#F1F5F9] flex-1">
        <div className="flex items-center justify-between text-[#64748B] font-bold uppercase tracking-wider text-[11px] mb-2">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-[#155E75]" />
            <span>Layer Stack</span>
          </span>
        </div>

        <div className="space-y-2">
          {[
            { id: 'radar', label: 'Calibrated Radar (γ⁰ dB)', desc: 'L-band NISAR GCOV amplitude' },
            { id: 'water', label: 'Classified Water Mask', desc: 'Otsu exploratory candidate' },
            { id: 'transitions', label: 'Land-to-Water Transition', desc: 'Erosion / Recurrence candidate' },
            { id: 'boundaries', label: 'Historical Ghost Boundaries', desc: 'Dated riverbank / forest edges' },
            { id: 'assets', label: 'OSM Infrastructure & Settlements', desc: 'Schools, clinics, roads' },
            { id: 'context', label: 'Environmental Context', desc: 'Stage gauge & GPM rain track' },
          ].map((layer) => (
            <label
              key={layer.id}
              className="flex items-start space-x-2.5 p-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layerVisibility[layer.id] ?? true}
                onChange={() => toggleLayer(layer.id)}
                className="mt-0.5 rounded border-[#CBD5E1] text-[#155E75] focus:ring-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-[#102A43] leading-tight text-[11px]">{layer.label}</div>
                <div className="text-[10px] text-[#64748B] mt-0.5">{layer.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Methods & QC Quick Drawer */}
      <div className="p-3 bg-[#F8FAFC] border-t border-[#CBD5E1]">
        <div className="flex items-center justify-between text-[11px] text-[#475569]">
          <span className="font-medium">Analysis Run:</span>
          <span className="font-mono text-[#155E75] font-semibold">run-2026-prod-01</span>
        </div>
        <div className="mt-1 text-[10px] text-[#64748B]">
          CRS: EPSG:32645 (UTM 45N) | Method: v1.0.0
        </div>
      </div>
    </div>
  );
};
