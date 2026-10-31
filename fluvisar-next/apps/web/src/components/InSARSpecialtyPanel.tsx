import React, { useState } from 'react';
import { Activity, Compass, AlertCircle, Waves, CheckCircle2, ChevronRight } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const InSARSpecialtyPanel: React.FC = () => {
  const { viewId } = useWorkspaceStore();
  
  // Controls
  const [sensor, setSensor] = useState<'nisar' | 'sentinel1'>('nisar');
  const [product, setProduct] = useState<'displacement' | 'wrapped' | 'unwrapped' | 'coherence'>('displacement');
  const [minCoherence, setMinCoherence] = useState<number>(0.35);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  // Wavelength in mm: NISAR L-band (238.4mm) / Sentinel-1 C-band (55.5mm)
  const wavelengthMm = sensor === 'nisar' ? 238.4 : 55.46;
  const dispPerFringeMm = wavelengthMm / 2;

  // Mock transect data points (1.2 km cross-section across char & channel)
  const transectPoints = [
    { dist: 0, disp: 2.1, coh: 0.72, comp: 1, valid: true },
    { dist: 120, disp: 1.8, coh: 0.68, comp: 1, valid: true },
    { dist: 240, disp: 0.5, coh: 0.61, comp: 1, valid: true },
    { dist: 360, disp: -2.3, coh: 0.42, comp: 1, valid: true },
    // River channel breach - low coherence break
    { dist: 480, disp: null, coh: 0.12, comp: 0, valid: false },
    { dist: 600, disp: null, coh: 0.15, comp: 0, valid: false },
    { dist: 720, disp: null, coh: 0.18, comp: 0, valid: false },
    // Emerging char - stable land component 2
    { dist: 840, disp: -5.4, coh: 0.55, comp: 2, valid: true },
    { dist: 960, disp: -6.8, coh: 0.58, comp: 2, valid: true },
    { dist: 1080, disp: -8.2, coh: 0.64, comp: 2, valid: true },
    { dist: 1200, disp: -7.9, coh: 0.69, comp: 2, valid: true },
  ];

  const validPoints = transectPoints.filter(p => p.coh >= minCoherence && p.valid);
  const maxDisp = Math.max(...validPoints.map(p => p.disp ?? 0));
  const minDisp = Math.min(...validPoints.map(p => p.disp ?? 0));
  const totalPhaseSpanMm = Math.abs(maxDisp - minDisp);
  const estimatedFringes = (totalPhaseSpanMm / dispPerFringeMm).toFixed(2);

  return (
    <div className="p-3 bg-white border-b border-[#CBD5E1] text-[11px] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
        <div className="flex items-center space-x-1.5 font-bold text-[#102A43] uppercase tracking-wider text-[11px]">
          <Activity className="w-3.5 h-3.5 text-[#155E75]" />
          <span>{viewId === 'C1' ? 'C1: Sensor Benchmark' : 'X1: InSAR Fringe & Motion'}</span>
        </div>
        <span className="text-[9px] font-mono bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded font-semibold">
          GUNW L2 / 80m
        </span>
      </div>

      {/* Sensor Switch */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-[#64748B] uppercase">Interferometric Sensor</label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setSensor('nisar')}
            className={`p-1.5 rounded text-left border transition-all ${
              sensor === 'nisar'
                ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="font-bold text-[10px]">NISAR L-band</div>
            <div className={`text-[9px] ${sensor === 'nisar' ? 'text-white/80' : 'text-[#64748B]'}`}>
              λ=23.84cm (High Coherence)
            </div>
          </button>
          <button
            onClick={() => setSensor('sentinel1')}
            className={`p-1.5 rounded text-left border transition-all ${
              sensor === 'sentinel1'
                ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="font-bold text-[10px]">Sentinel-1 C-band</div>
            <div className={`text-[9px] ${sensor === 'sentinel1' ? 'text-white/80' : 'text-[#64748B]'}`}>
              λ=5.55cm (Vegetation Loss)
            </div>
          </button>
        </div>
      </div>

      {/* InSAR Product Layer Selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-[#64748B] uppercase">Phase & Motion Product</label>
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: 'displacement', label: 'LOS Motion (mm)', code: 'Δd' },
            { id: 'wrapped', label: 'Wrapped Fringes', code: '[-π, π]' },
            { id: 'unwrapped', label: 'Unwrapped Phase', code: 'rad' },
            { id: 'coherence', label: 'Coherence Mask', code: 'γ ≥ 0.35' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setProduct(item.id as typeof product)}
              className={`px-2 py-1 rounded text-left flex items-center justify-between border ${
                product === item.id
                  ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1] font-semibold'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[9px] font-mono text-[#64748B]">{item.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Coherence Mask Threshold Slider */}
      <div className="bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0] space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-[#334155]">Coherence Cutoff (γ)</span>
          <span className="font-mono text-[#155E75] font-bold">{minCoherence.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.20"
          max="0.60"
          step="0.05"
          value={minCoherence}
          onChange={(e) => setMinCoherence(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#155E75]"
        />
        <div className="flex justify-between text-[9px] text-[#64748B]">
          <span>0.20 (Noisy/Water)</span>
          <span>0.35 (Standard)</span>
          <span>0.60 (Strict Bedrock)</span>
        </div>
      </div>

      {/* Transect Profiler (R16) */}
      <div className="border border-[#E2E8F0] rounded p-2 bg-[#FDFEFE] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 font-semibold text-[#102A43] text-[10px]">
            <Compass className="w-3 h-3 text-[#155E75]" />
            <span>Transect Profile (1.2 km Cross-Section)</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748B]">Chilmari Bank → Outer Char</span>
        </div>

        {/* SVG Profile Chart */}
        <div className="relative h-20 w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded overflow-hidden p-1">
          <svg className="w-full h-full" viewBox="0 0 240 70">
            {/* Zero line */}
            <line x1="0" y1="35" x2="240" y2="35" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />
            
            {/* Decoherent Channel Gap Highlight (480m to 720m) */}
            <rect x="96" y="0" width="48" height="70" fill="#EF4444" fillOpacity="0.10" />
            <text x="120" y="20" textAnchor="middle" fill="#DC2626" fontSize="6" fontWeight="bold">
              WATER GAP (BREAK)
            </text>

            {/* Profile Line Segment 1 (Bank) */}
            <polyline
              points="0,30 24,31 48,34 72,40"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            {/* Profile Line Segment 2 (Char) */}
            <polyline
              points="168,46 192,49 216,51 240,51"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
            />

            {/* Point Markers */}
            {transectPoints.map((pt, i) => {
              const cx = (pt.dist / 1200) * 240;
              const cy = pt.disp !== null ? 35 - pt.disp * 2 : 35;
              const isValid = pt.coh >= minCoherence && pt.valid;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={hoveredPointIdx === i ? 3 : 1.5}
                  fill={isValid ? '#0284C7' : '#EF4444'}
                  onMouseEnter={() => setHoveredPointIdx(i)}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                  className="cursor-pointer transition-all"
                />
              );
            })}
          </svg>
        </div>

        {/* Hovered point inspection */}
        {hoveredPointIdx !== null && (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-1.5 rounded flex items-center justify-between text-[10px]">
            <span className="font-semibold text-[#166534]">
              Dist: {transectPoints[hoveredPointIdx].dist}m
            </span>
            <span className="font-mono text-[#0F172A]">
              LOS: {transectPoints[hoveredPointIdx].disp !== null ? `${transectPoints[hoveredPointIdx].disp} mm` : 'DISCONTINUITY (WATER)'}
            </span>
            <span className="text-[9px] text-[#64748B]">
              γ: {transectPoints[hoveredPointIdx].coh} (Comp {transectPoints[hoveredPointIdx].comp})
            </span>
          </div>
        )}

        {/* Fringe Counter Metric (E15) */}
        <div className="flex items-center justify-between text-[10px] bg-[#F1F5F9] p-1.5 rounded">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-[#334155]">Fringe Cycle Count:</span>
            <span className="font-mono font-bold text-[#155E75]">{estimatedFringes} λ</span>
          </div>
          <div className="text-[9px] text-[#64748B]">
            Span: {totalPhaseSpanMm.toFixed(1)} mm ({dispPerFringeMm.toFixed(1)} mm/fringe)
          </div>
        </div>
      </div>

      {/* SWOT Water Elevation Context (R14) */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-2 rounded space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#166534] flex items-center space-x-1">
            <Waves className="w-3 h-3 text-[#16A34A]" />
            <span>SWOT KaRIn Water Elevation (R14)</span>
          </span>
          <span className="text-[9px] font-semibold bg-[#DCFCE7] text-[#15803D] px-1 py-0.5 rounded">
            READY (σ_h ≤ 0.15m)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] text-[#1E293B]">
          <div>Reach Height: <span className="font-mono font-bold">18.42 m</span> (EGM2008)</div>
          <div>Reach Slope: <span className="font-mono font-bold">0.075 m/km</span></div>
        </div>
        <div className="text-[9px] text-[#64748B]">
          Screened Ka-band interferometry over Jamuna main channel.
        </div>
      </div>

      {/* Compound Observation Profile (R15) */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-2 rounded space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-[#102A43]">Compound 3-Axis Physical Profile (R15)</span>
          <span className="text-[9px] font-mono text-[#64748B]">Independent Axes</span>
        </div>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between items-center bg-white p-1 rounded border border-[#E2E8F0]">
            <span className="text-[#64748B]">Radar Power (HH):</span>
            <span className="font-mono font-bold text-[#155E75]">-16.2 dB (Water Candidate)</span>
          </div>
          <div className="flex justify-between items-center bg-white p-1 rounded border border-[#E2E8F0]">
            <span className="text-[#64748B]">Optical Greenness:</span>
            <span className="font-mono font-bold text-[#16A34A]">NDVI 0.14 (Emergent/Low)</span>
          </div>
          <div className="flex justify-between items-center bg-white p-1 rounded border border-[#E2E8F0]">
            <span className="text-[#64748B]">Relative LOS Motion:</span>
            <span className="font-mono font-bold text-[#D97706]">-8.2 mm (Subsidence Range)</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-[9px] text-[#64748B] pt-0.5">
          <AlertCircle className="w-3 h-3 text-[#D97706] shrink-0" />
          <span>Plan invariant: No synthetic single composite risk score.</span>
        </div>
      </div>

      {/* NISAR Contribution Benchmark (R08) */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-2 rounded space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#1E40AF]">NISAR Contribution Benchmark (R08)</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
        </div>
        <div className="text-[10px] text-[#1E3A8A] space-y-0.5">
          <div className="flex items-center space-x-1">
            <ChevronRight className="w-2.5 h-2.5 text-[#2563EB]" />
            <span><strong>Canopy:</strong> L-band penetrates foliage to trunk/soil level.</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChevronRight className="w-2.5 h-2.5 text-[#2563EB]" />
            <span><strong>Latency:</strong> Interleaved orbits reduce revisit to 3–6 days.</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChevronRight className="w-2.5 h-2.5 text-[#2563EB]" />
            <span><strong>Coherence:</strong> γ &gt; 0.55 maintained over 12d Jamuna chars.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
