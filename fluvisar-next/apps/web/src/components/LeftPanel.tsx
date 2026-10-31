import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { ViewId } from '../store/workspaceStore';
import { i18n } from '../i18n/translations';
import { Layers, Activity } from 'lucide-react';
import { SundarbansPolarizationPanel } from './SundarbansPolarizationPanel';

export const LeftPanel: React.FC = () => {
  const { regionId, viewId, setView, language, layerVisibility, toggleLayer } = useWorkspaceStore();
  const t = i18n[language];

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
    <aside className="w-64 border-r border-[#CBD5E1] bg-white flex flex-col h-full select-none text-xs overflow-y-auto">
      {/* Views Switcher Section */}
      <div className="p-3 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between text-[#64748B] font-bold uppercase tracking-wider text-[11px] mb-2">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-[#155E75]" />
            <span>Map Views ({regionId})</span>
          </span>
          <span className="text-[10px] bg-[#E2E8F0] px-1.5 py-0.5 rounded font-mono">{viewId}</span>
        </div>

        <div className="space-y-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg font-medium transition-all flex flex-col ${
                viewId === v.id
                  ? 'bg-[#155E75] text-white shadow-xs'
                  : 'text-[#102A43] hover:bg-[#F8FAFC] hover:text-[#0E7490]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">{v.label}</span>
                <span
                  className={`text-[10px] font-mono px-1 py-0.2 rounded ${
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

      {/* Special Sundarbans Polarization Panel (if region is sundarbans) */}
      {regionId === 'sundarbans' && <SundarbansPolarizationPanel />}

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
    </aside>
  );
};
