import { useState } from 'react';
import { Radio, History, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspaceStore, type PolarizationChannel } from '../store/workspaceStore';
import { useEvidence, number, readableDate } from '../data/evidence';

export function SundarbansPolarizationPanel() {
  const { evidence } = useEvidence();
  const { selectedPol, selectedDate, setSelectedPol, setDisplayDate } = useWorkspaceStore();
  const [history, setHistory] = useState(false);
  const [pauliDetails, setPauliDetails] = useState(false);
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);

  const observation = evidence.observations.find(o => o.date === selectedDate) ?? evidence.observations[1];
  const channels: { id: PolarizationChannel; label: string }[] = [
    { id: 'VV', label: 'VV (Co-Pol)' },
    { id: 'VH', label: 'VH (Cross-Pol)' },
    { id: 'Ratio', label: 'VV/VH Ratio' },
    { id: 'RGB', label: 'Pauli / Dual-Pol RGB' },
  ];

  // 4 Quadrants of the ROOTRETURN Response Fingerprint (R10)
  const quadrants = [
    {
      id: 1,
      name: 'Q1: Sub-Canopy Inundation',
      deltaVH: '+2.3 dB',
      ndvi: '0.68 (Stable)',
      desc: 'High tide double-bounce between vertical mangrove pneumatophores/trunks and water surface. Tree crowns intact.',
      color: 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
    },
    {
      id: 2,
      name: 'Q2: Exposed Emergent Canopy',
      deltaVH: '-0.2 dB',
      ndvi: '0.72 (High)',
      desc: 'Low tide baseline. Volume scattering from dense rhizophora/avicennoia leaves dominates. Specular water absent.',
      color: 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
    },
    {
      id: 3,
      name: 'Q3: Cyclone Defoliation / Dieback',
      deltaVH: '-5.8 dB',
      ndvi: '0.24 (Collapsed)',
      desc: 'True ecological disturbance. Canopy loss collapses volume scattering; confirmed across multiple tidal cycles.',
      color: 'border-rose-500 bg-rose-950/40 text-rose-200'
    },
    {
      id: 4,
      name: 'Q4: Open Waterspecularspecularspecular Specular',
      deltaVH: '-12.4 dB',
      ndvi: '0.04 (Water)',
      desc: 'Wide tidal channels (Passur / Sibsa). Deep specular reflection with very low backscatter in both polarizations.',
      color: 'border-blue-500 bg-blue-950/40 text-blue-200'
    }
  ];

  return (
    <div className="restored-polarization-panel bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Radio size={15} className="text-cyan-400" />
          <span>Radar Polarization Prism & Scattering Physics</span>
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
          C-Band Sentinel-1 RTC
        </span>
      </div>

      {/* Polarization Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-slate-400 text-[11px] font-semibold block">Select Active Channel Composite:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {channels.map(channel => (
            <button
              className={`py-1.5 px-2 rounded font-medium text-xs transition-colors cursor-pointer text-center ${
                selectedPol === channel.id
                  ? 'bg-cyan-700 text-white font-bold ring-1 ring-cyan-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              key={channel.id}
              onClick={() => {
                setSelectedPol(channel.id);
                useWorkspaceStore.setState({ basemapType: 'sar', activeLens: channel.id === 'VH' ? 'vh' : 'vv' });
              }}
            >
              {channel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Explanation of Selected Channel */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
        {selectedPol === 'VV' && (
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Vertical Transmit / Vertical Receive (VV):</strong> Sensitive to surface roughness and direct specular reflection. Calm open water yields very low backscatter (&lt; -18 dB); rough soils produce strong return.
          </p>
        )}
        {selectedPol === 'VH' && (
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Vertical Transmit / Horizontal Receive (VH):</strong> Cross-polarization measures volume depolarization. Dense mangrove foliage randomizes microwave polarization, maintaining higher returns (-14 dB to -17 dB).
          </p>
        )}
        {selectedPol === 'Ratio' && (
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Cross-Polarization Ratio (VV dB - VH dB):</strong> Highlights the contrast between surface roughness and volumetric vegetation scattering. Useful to screen moist soil from emergent vegetation.
          </p>
        )}
        {selectedPol === 'RGB' && (
          <div className="space-y-2">
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Pauli Covariance Composite (Dual-Pol S1 Representation):</strong>
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-mono">
              <div className="p-1.5 rounded bg-rose-950/60 border border-rose-700/60 text-rose-300">
                <span className="block font-bold">RED (Double-Bounce)</span>
                Trunk-water dihedral
              </div>
              <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
                <span className="block font-bold">GREEN (Volume)</span>
                Mangrove foliage / canopy
              </div>
              <div className="p-1.5 rounded bg-blue-950/60 border border-blue-700/60 text-blue-300">
                <span className="block font-bold">BLUE (Specular)</span>
                Open tidal water surface
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Observation Date & Tide Matcher */}
      <div className="flex flex-col gap-1.5">
        <label className="text-slate-400 text-[11px] font-semibold">Tidal Observation Acquisition Date:</label>
        <select
          aria-label="Polarization observation date"
          value={observation.date}
          onChange={event => setDisplayDate(event.target.value)}
          className="bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs"
        >
          {evidence.observations.map(o => (
            <option key={o.id} value={o.date}>
              {readableDate(o.date)} · {o.datetime.slice(11, 19)} UTC (VV: {number(o.mean_vv_db, 1)} dB)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px]">Scene Mean VV</span>
          <div className="text-white font-mono font-bold">{number(observation.mean_vv_db, 2)} dB</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <span className="text-slate-400 text-[10px]">Scene Mean VH</span>
          <div className="text-white font-mono font-bold">{number(observation.mean_vh_db, 2)} dB</div>
        </div>
      </div>

      {/* ROOTRETURN 4-Quadrant Fingerprint Explainer (R10) */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Activity size={13} className="text-cyan-400" />
            <span>ROOTRETURN 4-Quadrant Scattering Fingerprint</span>
          </span>
          <button
            onClick={() => setPauliDetails(!pauliDetails)}
            className="text-cyan-400 hover:text-cyan-300 text-[11px] cursor-pointer"
          >
            {pauliDetails ? 'Hide' : 'Explain'}
          </button>
        </div>

        {pauliDetails && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {quadrants.map(q => (
              <div
                key={q.id}
                onClick={() => setActiveQuadrant(q.id === activeQuadrant ? null : q.id)}
                className={`p-2 rounded border cursor-pointer transition-all ${q.color} ${
                  activeQuadrant === q.id ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
                }`}
              >
                <div className="font-bold text-[11px]">{q.name}</div>
                <div className="text-[10px] font-mono mt-0.5">ΔVH: {q.deltaVH} · NDVI: {q.ndvi}</div>
                <p className="text-[10px] mt-1 text-slate-300 leading-snug">{q.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Context Bridge (N01) */}
      <button
        className="restored-history-toggle flex items-center justify-between w-full py-2 px-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs cursor-pointer"
        onClick={() => setHistory(!history)}
      >
        <span className="flex items-center gap-1.5">
          <History size={13} className="text-cyan-400" />
          <span>Historical Context Bridge (Global Mangrove Watch 1996-2025)</span>
        </span>
        {history ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {history && (
        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 space-y-2">
          <p>
            Long-term mangrove baseline extent (GMW v3.0 decadal epochs) confirms 98.4% core canopy stability in the Sundarbans Reserved Forest. Intra-annual radar fluctuations reflect <strong>tidal inundation dynamics</strong>, not deforestation.
          </p>
          <a
            href="https://www.globalmangrovewatch.org/"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline block font-medium"
          >
            Open Global Mangrove Watch Dataset ↗
          </a>
        </div>
      )}

      <div className="border-t border-slate-800 pt-2 text-right">
        <Link className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold inline-flex items-center gap-1" to="/sar-lab#simulations">
          <span>Full Polarimetry / Pauli Physics Twin in SAR Lab →</span>
        </Link>
      </div>
    </div>
  );
}
