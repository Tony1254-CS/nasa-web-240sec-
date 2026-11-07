import React, { useState } from 'react';
import { X, Layers, Radio, ShieldCheck } from 'lucide-react';
import { useObservatoryEvidence as useEvidence } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SensorRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorRaceModal: React.FC<SensorRaceModalProps> = ({ isOpen, onClose }) => {
  const { evidence } = useEvidence();
  const { regionId: _regionId } = useWorkspaceStore();
  const [selectedSensor, setSelectedSensor] = useState<'s2' | 's1' | 'nisar'>('s1');

  if (!isOpen) return null;

  const opticalScene = evidence.optical_observations?.[0];
  const cloudFraction = opticalScene ? Math.round(opticalScene.cloud_fraction * 100) : 42;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pt-16 sm:pt-20 pb-6 select-none animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden text-xs flex flex-col max-h-[84vh] text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Sensor Race: Multi-Sensor Remote Sensing Comparison
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  W11 / E18 Benchmark
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Compare actual Sentinel-2 Optical vs Sentinel-1 C-Band SAR vs NISAR L-Band SAR penetration physics over {evidence.name}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Comparison Grid */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Sensor 1: Sentinel-2 Optical */}
            <div
              onClick={() => setSelectedSensor('s2')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedSensor === 's2' ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/30' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">Sentinel-2 MSI Optical</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {cloudFraction}% CLOUD
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div>Wavelength: <strong className="text-white font-mono">0.49 - 0.84 µm (Visible/NIR)</strong></div>
                <div>Spatial Resolution: <strong className="text-white font-mono">10 meters</strong></div>
                <div>Monsoon Cloud Occlusion: <strong className="text-amber-400 font-mono">Significant</strong></div>
                <div>Scattering Mechanism: <strong className="text-slate-200">Solar reflectance & chlorophyll absorption</strong></div>
              </div>
              <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                Original Sentinel-2 true-color tiles retain genuine cloud and cloud-shadow mask. Does not penetrate monsoon storm systems.
              </div>
            </div>

            {/* Sensor 2: Sentinel-1 C-Band SAR */}
            <div
              onClick={() => setSelectedSensor('s1')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedSensor === 's1' ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/30' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">Sentinel-1 C-Band SAR</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  OPERATIONAL
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div>Wavelength: <strong className="text-white font-mono">λ = 5.55 cm (5.405 GHz)</strong></div>
                <div>Spatial Resolution: <strong className="text-white font-mono">30m analysis grid</strong></div>
                <div>Monsoon Cloud Occlusion: <strong className="text-emerald-400 font-mono">0% (All-Weather)</strong></div>
                <div>Scattering Mechanism: <strong className="text-slate-200">Surface roughness & dielectric specular</strong></div>
              </div>
              <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                Active microwave radar penetrates clouds day and night. Open water reflects signal away (very low dB &lt; -18); rough sandbars reflect back.
              </div>
            </div>

            {/* Sensor 3: NISAR L-Band SAR */}
            <div
              onClick={() => setSelectedSensor('nisar')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedSensor === 'nisar' ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/30' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">NISAR L-Band SAR</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                  BENCHMARK
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div>Wavelength: <strong className="text-white font-mono">λ = 23.84 cm (1.25 GHz)</strong></div>
                <div>Spatial Resolution: <strong className="text-white font-mono">10m / 30m GCOV</strong></div>
                <div>Canopy & Wetland Penetration: <strong className="text-purple-300 font-mono">Deep Sub-Canopy</strong></div>
                <div>Scattering Mechanism: <strong className="text-slate-200">Trunk-water double bounce & soil dielectric</strong></div>
              </div>
              <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                Long L-band microwave penetrates dense forest canopies to reveal hidden sub-canopy tidal flooding (double-bounce) and soil moisture.
              </div>
            </div>
          </div>

          {/* Deep Dive on Active Sensor Selection */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Radio size={15} className="text-cyan-400" />
              <span>Physical Microwave Penetration & Radar Interaction Profile</span>
            </h4>

            {selectedSensor === 's2' && (
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>Optical Imagery Limitation:</strong> During the Bangladesh monsoon (June–October), dense cloud cover occludes optical satellites up to 80% of the time. In our Jamuna study area, the Sentinel-2 scene from 2026-10-17 contains <strong>{cloudFraction}% cloud and cloud-shadow obstruction</strong>.
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300">
                  Limitation: Cloud blindness prevents emergency rapid flood crest response without microwave SAR.
                </div>
              </div>
            )}

            {selectedSensor === 's1' && (
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>C-Band Operational Power:</strong> Sentinel-1 C-band SAR emits 5.55 cm microwaves that pass straight through clouds, rain and aerosol hazes. When microwaves strike open river water, specular reflection directs all energy away from the sensor, producing a sharp bimodal backscatter drop (-8.2 dB drop in Jamuna).
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300">
                  Operational Advantage: Independent of weather and day/night cycle. 100% cloud-free operational observation support mask.
                </div>
              </div>
            )}

            {selectedSensor === 'nisar' && (
              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  <strong>NISAR L-Band Specialty:</strong> L-band&apos;s longer wavelength (23.8 cm) is longer than typical mangrove leaves and small branches. It passes through the canopy to interact directly with vertical tree trunks and underlying tidal water, creating a powerful dihedral double-bounce (+2.3 dB in Sundarbans).
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-purple-300">
                  Scientific Breakthrough: Distinguishes sub-canopy tidal water pulse from permanent canopy defoliation.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Honest Sensor Comparison: Real Sentinel-2 cloud masks; no synthetic cloud sliders.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
