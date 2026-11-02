import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { Activity, CloudRain, Waves, Leaf, ChevronUp, ChevronDown } from 'lucide-react';

interface ObservationPoint {
  date: string;
  radar_db: number;
  water_fraction: number;
  ndvi: number;
  stage_m: number;
  rain_7d_mm: number;
}

const JAMUNA_SERIES: ObservationPoint[] = [
  { date: '2026-06-23', radar_db: -12.4, water_fraction: 0.32, ndvi: 0.54, stage_m: 17.80, rain_7d_mm: 45 },
  { date: '2026-07-17', radar_db: -14.1, water_fraction: 0.45, ndvi: 0.42, stage_m: 19.20, rain_7d_mm: 120 },
  { date: '2026-08-10', radar_db: -15.8, water_fraction: 0.62, ndvi: 0.35, stage_m: 19.85, rain_7d_mm: 180 }, // Monsoon Peak
  { date: '2026-08-26', radar_db: -13.2, water_fraction: 0.48, ndvi: 0.38, stage_m: 18.90, rain_7d_mm: 65 },
  { date: '2026-09-19', radar_db: -11.5, water_fraction: 0.39, ndvi: 0.47, stage_m: 18.05, rain_7d_mm: 20 },
  { date: '2026-10-21', radar_db: -9.8,  water_fraction: 0.28, ndvi: 0.61, stage_m: 16.40, rain_7d_mm: 5 },
];

export const ContextTracks: React.FC = () => {
  const { selectedDate, setSelectedDate, isContextTracksOpen, toggleContextTracks } = useWorkspaceStore();
  const series = JAMUNA_SERIES;

  return (
    <div className="bg-[#F8FAFC] border-t border-[#CBD5E1] select-none text-xs transition-all">
      {/* Collapsible Bar Header */}
      <div
        onClick={toggleContextTracks}
        className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-200/50 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-2 font-bold text-[#102A43] text-xs">
          <Activity className="w-3.5 h-3.5 text-[#155E75]" />
          <span>Multisensor Environmental Tracks (Shared Time Axis)</span>
          <span className="text-[10px] font-normal text-slate-500">
            {isContextTracksOpen ? '(Click to collapse)' : '(Click to expand 4-sensor charts)'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-[#64748B]">
          <span className="hidden sm:flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#155E75]" />
            <span>Radar dB</span>
          </span>
          <span className="hidden sm:flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#0072B2]" />
            <span>Hydrograph</span>
          </span>
          <span className="hidden sm:flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#009E73]" />
            <span>NDVI</span>
          </span>
          <button className="p-0.5 text-slate-500 hover:text-slate-800">
            {isContextTracksOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Chart Multiples */}
      {isContextTracksOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-200">

      {/* Aligned Small Multiples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Track 1: Radar Power (dB) */}
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1">
            <span className="font-semibold flex items-center space-x-1">
              <Activity className="w-3 h-3 text-[#155E75]" />
              <span>NISAR L-GCOV γ⁰ (dB)</span>
            </span>
            <span className="font-mono text-[#155E75] font-bold">
              {series.find((p) => p.date === selectedDate)?.radar_db ?? -13.2} dB
            </span>
          </div>
          <div className="flex items-end justify-between h-9 pt-1">
            {series.map((p) => {
              const heightPercent = Math.max(15, Math.min(100, (p.radar_db + 20) * 8));
              const isCurrent = p.date === selectedDate;
              return (
                <div
                  key={p.date}
                  onClick={() => setSelectedDate(p.date)}
                  className="flex-1 flex flex-col items-center cursor-pointer group px-0.5"
                  title={`${p.date}: ${p.radar_db} dB`}
                >
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xs transition-all ${
                      isCurrent ? 'bg-[#155E75]' : 'bg-[#94A3B8] hover:bg-[#0284C7]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: River Stage Ladder (Gauge Height in meters) */}
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1">
            <span className="font-semibold flex items-center space-x-1">
              <Waves className="w-3 h-3 text-[#0072B2]" />
              <span>Chilmari Gauge (m)</span>
            </span>
            <span className="font-mono text-[#0072B2] font-bold">
              {series.find((p) => p.date === selectedDate)?.stage_m ?? 18.90} m
            </span>
          </div>
          <div className="flex items-end justify-between h-9 pt-1 relative">
            <div className="absolute top-2 left-0 right-0 border-b border-dashed border-red-500 z-10" title="Danger Line: 19.50m" />
            {series.map((p) => {
              const heightPercent = Math.max(15, Math.min(100, (p.stage_m - 15.0) * 18));
              const isCurrent = p.date === selectedDate;
              return (
                <div
                  key={p.date}
                  onClick={() => setSelectedDate(p.date)}
                  className="flex-1 flex flex-col items-center cursor-pointer group px-0.5"
                  title={`${p.date}: Stage ${p.stage_m}m (Danger: 19.50m)`}
                >
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xs transition-all ${
                      isCurrent ? 'bg-[#0072B2]' : 'bg-[#BAE6FD] hover:bg-[#38BDF8]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 3: Optical NDVI Greenness */}
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1">
            <span className="font-semibold flex items-center space-x-1">
              <Leaf className="w-3 h-3 text-[#009E73]" />
              <span>Sentinel-2 NDVI</span>
            </span>
            <span className="font-mono text-[#009E73] font-bold">
              {series.find((p) => p.date === selectedDate)?.ndvi ?? 0.38}
            </span>
          </div>
          <div className="flex items-end justify-between h-9 pt-1">
            {series.map((p) => {
              const heightPercent = Math.max(15, Math.min(100, p.ndvi * 120));
              const isCurrent = p.date === selectedDate;
              return (
                <div
                  key={p.date}
                  onClick={() => setSelectedDate(p.date)}
                  className="flex-1 flex flex-col items-center cursor-pointer group px-0.5"
                  title={`${p.date}: NDVI ${p.ndvi}`}
                >
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xs transition-all ${
                      isCurrent ? 'bg-[#009E73]' : 'bg-[#A7F3D0] hover:bg-[#34D399]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 4: 7-Day GPM IMERG Rainfall Accumulation */}
        <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1">
            <span className="font-semibold flex items-center space-x-1">
              <CloudRain className="w-3 h-3 text-[#0284C7]" />
              <span>GPM 7d Rain (mm)</span>
            </span>
            <span className="font-mono text-[#0284C7] font-bold">
              {series.find((p) => p.date === selectedDate)?.rain_7d_mm ?? 65} mm
            </span>
          </div>
          <div className="flex items-end justify-between h-9 pt-1">
            {series.map((p) => {
              const heightPercent = Math.max(10, Math.min(100, (p.rain_7d_mm / 200) * 100));
              const isCurrent = p.date === selectedDate;
              return (
                <div
                  key={p.date}
                  onClick={() => setSelectedDate(p.date)}
                  className="flex-1 flex flex-col items-center cursor-pointer group px-0.5"
                  title={`${p.date}: Rain 7d ${p.rain_7d_mm} mm`}
                >
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xs transition-all ${
                      isCurrent ? 'bg-[#0284C7]' : 'bg-[#CBD5E1] hover:bg-[#60A5FA]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
      )}
    </div>
  );
};
