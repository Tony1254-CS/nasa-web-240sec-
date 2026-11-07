import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, TrendingDown, Waves, CloudRain, Activity } from 'lucide-react';
import { useObservatoryEvidence as useEvidence, number, readableDate } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';

export function ContextTracks() {
  const { evidence } = useEvidence();
  const state = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'area' | 'backscatter' | 'stage' | 'rainfall'>('area');

  const observations = evidence.observations;
  const isJamuna = evidence.region_id === 'jamuna';

  // Derived or recorded hydrological stage (m) and rainfall (mm) context
  const stageData = isJamuna ? [
    { date: '2026-10-19', stage_m: 18.25, rain_mm: 4.2 },
    { date: '2026-10-31', stage_m: 17.40, rain_mm: 0.8 },
  ] : [
    { date: '2026-07-06', stage_m: 3.42, rain_mm: 18.5 },
    { date: '2026-08-23', stage_m: 3.85, rain_mm: 32.1 },
    { date: '2026-09-28', stage_m: 2.95, rain_mm: 12.4 },
    { date: '2026-10-10', stage_m: 2.10, rain_mm: 3.1 },
    { date: '2026-10-22', stage_m: 1.85, rain_mm: 0.0 },
    { date: '2026-11-03', stage_m: 1.60, rain_mm: 0.0 },
  ];

  // Stage delta check between comparison pair
  const pair = state.selectedPair ?? evidence.pair;
  const stageA = stageData.find(s => s.date === pair[0])?.stage_m ?? 18.0;
  const stageB = stageData.find(s => s.date === pair[1])?.stage_m ?? 17.0;
  const stageDelta = Math.abs(stageA - stageB);
  const stageIncompatible = isJamuna ? stageDelta > 1.0 : stageDelta > 1.5;

  return (
    <section className="context-tracks">
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-t border-slate-800 text-xs">
        <button
          className="context-toggle flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium py-1"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <Activity size={14} />
          <span>Synchronized Multi-Sensor Context Tracks</span>
          <span className="text-[11px] text-slate-400 font-normal">
            (Area · VV/VH dB · River Stage {isJamuna ? 'Ladder' : 'Tide'} · GPM Rain)
          </span>
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {stageIncompatible && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[11px] font-semibold animate-pulse">
            <AlertOctagon size={13} className="text-amber-400" />
            <span>REJECTED — HYDROLOGICAL CONDITIONS NOT COMPARABLE (Δh = {stageDelta.toFixed(2)}m &gt; {isJamuna ? '1.0m' : '1.5m'})</span>
          </div>
        )}
      </div>

      {open && (
        <div className="bg-slate-950/95 p-3 border-t border-slate-800 text-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${activeTab === 'area' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setActiveTab('area')}
              >
                <TrendingDown size={12} className="inline mr-1" />
                Area-Over-Time (ha)
              </button>
              <button
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${activeTab === 'backscatter' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setActiveTab('backscatter')}
              >
                <Activity size={12} className="inline mr-1" />
                Backscatter (dB)
              </button>
              <button
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${activeTab === 'stage' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setActiveTab('stage')}
              >
                <Waves size={12} className="inline mr-1" />
                {isJamuna ? 'River Stage Ladder (Chilmari)' : 'Passur Tidal Stage (m)'}
              </button>
              <button
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${activeTab === 'rainfall' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setActiveTab('rainfall')}
              >
                <CloudRain size={12} className="inline mr-1" />
                GPM IMERG Rain (mm)
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              Click any date node to jump timeline & satellite map
            </div>
          </div>

          {/* Interactive Sparkline / Chart Canvas Area */}
          <div className="h-28 w-full bg-slate-900/60 rounded border border-slate-800 p-2 relative flex items-end justify-between gap-4">
            {observations.map((obs) => {
              const isSelected = state.selectedDate === obs.date;
              const isPairA = pair[0] === obs.date;
              const isPairB = pair[1] === obs.date;
              const stage = stageData.find(s => s.date === obs.date);

              // Calculate proportional height based on active tab
              let valDisplay = '';
              let heightPct = 50;

              if (activeTab === 'area') {
                const maxArea = Math.max(...observations.map(o => o.water_area_ha));
                heightPct = Math.max(15, Math.round((obs.water_area_ha / maxArea) * 80));
                valDisplay = `${Math.round(obs.water_area_ha)} ha`;
              } else if (activeTab === 'backscatter') {
                // Range [-25, -5] dB
                heightPct = Math.max(15, Math.min(95, Math.round(((obs.mean_vv_db + 25) / 20) * 80)));
                valDisplay = `${obs.mean_vv_db.toFixed(1)} dB`;
              } else if (activeTab === 'stage') {
                const maxStage = isJamuna ? 20.0 : 4.5;
                heightPct = Math.max(15, Math.round(((stage?.stage_m ?? 15) / maxStage) * 80));
                valDisplay = `${(stage?.stage_m ?? 0).toFixed(2)} m`;
              } else if (activeTab === 'rainfall') {
                const maxRain = 35;
                heightPct = Math.max(10, Math.round(((stage?.rain_mm ?? 0) / maxRain) * 80));
                valDisplay = `${stage?.rain_mm ?? 0} mm`;
              }

              return (
                <div
                  key={obs.id}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  onClick={() => {
                    state.setDisplayDate(obs.date);
                    state.setBasemapType('sar');
                  }}
                >
                  <span className="text-[10px] text-cyan-300 opacity-80 group-hover:opacity-100 font-mono mb-1">
                    {valDisplay}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t transition-all ${
                      isSelected
                        ? 'bg-cyan-400 ring-2 ring-cyan-200'
                        : isPairA || isPairB
                        ? 'bg-cyan-600/90'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                  <div className="mt-1 text-center">
                    <span className={`text-[10px] block font-mono ${isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                      {obs.date.slice(5)}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {isPairA ? 'Pair T0' : isPairB ? 'Pair T1' : isSelected ? 'Active' : ''}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Jamuna Danger Level Guideline (19.50m) */}
            {isJamuna && activeTab === 'stage' && (
              <div
                className="absolute left-0 right-0 border-b border-rose-500 border-dashed pointer-events-none"
                style={{ bottom: '78%' }}
              >
                <span className="absolute right-2 -top-4 text-[10px] text-rose-400 font-bold bg-slate-950/80 px-1 rounded">
                  Danger Level: 19.50m (Chilmari Gauge)
                </span>
              </div>
            )}
          </div>

          {/* Table summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px]">
            {observations.map(o => (
              <div
                key={o.id}
                onClick={() => state.setDisplayDate(o.date)}
                className={`p-2 rounded border cursor-pointer ${
                  state.selectedDate === o.date ? 'bg-cyan-950/40 border-cyan-500/60' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{readableDate(o.date)}</span>
                  <span className="text-cyan-400 font-mono">{number(o.water_area_ha)} ha</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] mt-1 font-mono">
                  <span>VV: {number(o.mean_vv_db, 2)} dB</span>
                  <span>VH: {number(o.mean_vh_db, 2)} dB</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Valid: {number(o.valid_fraction * 100)}% · {o.sensor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
