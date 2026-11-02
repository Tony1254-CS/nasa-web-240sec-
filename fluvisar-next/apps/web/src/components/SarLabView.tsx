import React, { useState } from 'react';
import {
  GraduationCap,
  Cloud,
  Sliders,
  Radio,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const SarLabView: React.FC = () => {
  const { language } = useWorkspaceStore();
  const [activeExp, setActiveExp] = useState<'cloud' | 'pol' | 'speckle' | 'fringe'>('cloud');

  // Exp 1: Cloud Blindness state
  const [cloudCover, setCloudCover] = useState(80);

  // Exp 2: Polarization target state
  const [selectedTarget, setSelectedTarget] = useState<'water' | 'canopy' | 'trunk'>('canopy');

  // Exp 3: Speckle filter state
  const [speckleFilter, setSpeckleFilter] = useState<'none' | 'boxcar' | 'lee'>('lee');

  // Exp 4: Fringe counter state
  const [phaseSpanRad, setPhaseSpanRad] = useState(4 * Math.PI); // 2 fringes

  const isBn = language === 'bn';

  return (
    <div className="flex-1 bg-[#F4F7FA] overflow-y-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Lab Header */}
        <div className="bg-white rounded-xl p-6 border border-[#CBD5E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#155E75] font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>SAR Lab & Physics Twin (plan.md E18 / E14)</span>
            </div>
            <h1 className="text-xl font-bold text-[#102A43] mt-1">
              {isBn ? 'এসএআর ল্যাব: রাডার পদার্থবিজ্ঞান ও চার পরীক্ষা' : 'SAR Lab: Interactive Radar Physics Experiments'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isBn
                ? 'মাইক্রোওয়েভ সংকেতের ক্লাউড পেনিট্রেশন, পোলারাইজেশন ও ইন্টারফেরোমেট্রিক ফ্রিঞ্জের বাস্তব মিথস্ক্রিয়া।'
                : 'Understand microwave cloud penetration, polarimetric scattering, and interferometric fringes.'}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-[#E0F2FE] text-[#0369A1] font-bold px-2 py-1 rounded">
            4 EXPERIMENTS
          </span>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'cloud', num: 1, title: isBn ? '১. মেঘের অন্ধত্ব' : '1. Cloud Blindness', icon: Cloud },
            { id: 'pol', num: 2, title: isBn ? '২. পোলারাইজেশন' : '2. Polarization Match', icon: Radio },
            { id: 'speckle', num: 3, title: isBn ? '৩. স্পেকল ফিল্টার' : '3. Speckle Filtering', icon: Sliders },
            { id: 'fringe', num: 4, title: isBn ? '৪. ফ্রিঞ্জ কাউন্টার' : '4. Fringe Counter', icon: Layers },
          ].map((exp) => {
            const Icon = exp.icon;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExp(exp.id as typeof activeExp)}
                className={`p-3 rounded-lg text-left border transition-all cursor-pointer flex items-center space-x-2 ${
                  activeExp === exp.id
                    ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                    : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-xs leading-tight">{exp.title}</span>
              </button>
            );
          })}
        </div>

        {/* Experiment Main Body */}
        <div className="bg-white rounded-xl p-5 sm:p-8 border border-[#CBD5E1] shadow-md space-y-6">
          {/* Experiment 1: Cloud Blindness */}
          {activeExp === 'cloud' && (
            <div className="space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3">
                <h2 className="text-lg font-bold text-[#102A43]">
                  {isBn ? 'পরীক্ষা ১: মেঘের অন্ধত্ব (Optical vs SAR)' : 'Experiment 1: Cloud Blindness (Optical vs. SAR)'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {isBn
                    ? 'বাংলাদেশের বর্ষাকালে অপটিক্যাল উপগ্রহ ৯০% সময় মেঘে ঢাকা থাকে। কিন্তু ২৪ সেমি এল-ব্যান্ড রাডার তরঙ্গ মেঘ ভেদ করে।'
                    : 'During the Bangladesh monsoon, optical satellites are occluded ~90% of the time. L-band microwave radar penetrates clouds freely.'}
                </p>
              </div>

              {/* Interactive Visual Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Optical Sentinel-2 */}
                <div className="border border-[#CBD5E1] rounded-lg p-3 bg-[#F8FAFC] space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#102A43]">
                    <span>Optical (Sentinel-2 Visible Light)</span>
                    <span className="text-[#DC2626]">λ ≈ 0.6 µm</span>
                  </div>
                  <div className="relative h-44 rounded bg-gradient-to-br from-[#0284C7] to-[#047857] overflow-hidden flex items-center justify-center">
                    {/* Simulated river land underneath */}
                    <div className="absolute inset-0 bg-[#065F46] opacity-60" />
                    <div className="absolute top-1/4 left-0 right-0 h-10 bg-[#0284C7] opacity-80" />
                    {/* Cloud overlay modulated by slider */}
                    <div
                      className="absolute inset-0 bg-white transition-opacity duration-150 backdrop-blur-xs flex items-center justify-center"
                      style={{ opacity: cloudCover / 100 }}
                    >
                      <span className="text-xs font-bold text-[#64748B] bg-white/80 px-2 py-1 rounded shadow-xs">
                        {cloudCover}% Cloud Occlusion (Blind)
                      </span>
                    </div>
                  </div>
                </div>

                {/* SAR NISAR L-band */}
                <div className="border border-[#CBD5E1] rounded-lg p-3 bg-[#F8FAFC] space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#102A43]">
                    <span>SAR (NISAR L-band Microwave)</span>
                    <span className="text-[#16A34A]">λ = 23.84 cm</span>
                  </div>
                  <div className="relative h-44 rounded bg-[#0F172A] overflow-hidden flex items-center justify-center p-2">
                    {/* Synthetic radar backscatter map */}
                    <div className="w-full h-full border border-[#334155] rounded flex flex-col justify-between p-2 text-[10px] font-mono text-white/80 bg-[#1E293B]">
                      <div className="flex justify-between">
                        <span>HH Backscatter: -15.4 dB</span>
                        <span className="text-[#10B981]">100% Penetration</span>
                      </div>
                      <div className="h-8 bg-[#0F172A] rounded flex items-center justify-center text-[#38BDF8]">
                        CLEAR RIVER CHANNEL DETECTED
                      </div>
                      <div className="text-[9px] text-white/60">
                        Zero attenuation from cumulonimbus or water vapor.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Cover Slider */}
              <div className="bg-[#F1F5F9] p-3 rounded-lg border border-[#CBD5E1] space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#102A43]">
                  <span>Monsoon Cloud Density</span>
                  <span className="font-mono text-[#155E75]">{cloudCover}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cloudCover}
                  onChange={(e) => setCloudCover(Number(e.target.value))}
                  className="w-full accent-[#155E75] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Experiment 2: Polarization Match */}
          {activeExp === 'pol' && (
            <div className="space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3">
                <h2 className="text-lg font-bold text-[#102A43]">
                  {isBn ? 'পরীক্ষা ২: পোলারাইজেশন ও প্রতিফলন পদ্ধতি' : 'Experiment 2: Polarization & Scattering Mechanisms'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {isBn
                    ? 'পৃষ্ঠের ধরন অনুযায়ী রাডার তরঙ্গের প্রতিফলন ধর্ম পরিবর্তিত হয় (HH, HV, ডাবল বাউন্স)।'
                    : 'Different ground targets scatter polarized microwave pulses with distinct physical signatures.'}
                </p>
              </div>

              {/* Target Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'water', label: 'Calm Water Channel', mechanism: 'Specular Reflection' },
                  { id: 'canopy', label: 'Dense Tree Canopy', mechanism: 'Volume Scattering' },
                  { id: 'trunk', label: 'Flooded Mangrove Roots', mechanism: 'Double-Bounce Return' },
                ].map((tgt) => (
                  <button
                    key={tgt.id}
                    onClick={() => setSelectedTarget(tgt.id as typeof selectedTarget)}
                    className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                      selectedTarget === tgt.id
                        ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div className="font-bold text-xs">{tgt.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{tgt.mechanism}</div>
                  </button>
                ))}
              </div>

              {/* Mechanism Explanation Card */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-lg space-y-2 text-xs">
                {selectedTarget === 'water' && (
                  <>
                    <div className="font-bold text-[#1E40AF]">Surface Specular Scattering (মৃদু পানির পৃষ্ঠ)</div>
                    <p className="text-[#1E3A8A]">
                      Calm open water acts as a specular mirror, reflecting almost all microwave energy away from the sensor.
                      Result: very low backscatter (<strong>-18 dB to -22 dB</strong>), appearing dark black on radar.
                    </p>
                  </>
                )}
                {selectedTarget === 'canopy' && (
                  <>
                    <div className="font-bold text-[#1E40AF]">Volume Scattering (ক্যানোপির আয়তন প্রতিফলন)</div>
                    <p className="text-[#1E3A8A]">
                      Multiple randomly oriented leaves and branches depolarize the radar wave. Horizontal pulses return with a strong vertical component.
                      Result: high <strong>HV cross-polarization</strong> (-12 dB), appearing bright green on Pauli RGB composites.
                    </p>
                  </>
                )}
                {selectedTarget === 'trunk' && (
                  <>
                    <div className="font-bold text-[#1E40AF]">Double-Bounce Scattering (ডাবল-বাউন্স প্রতিফলন)</div>
                    <p className="text-[#1E3A8A]">
                      Radar pulses bounce off the smooth water surface, then hit vertical tree trunks/stilt roots (or vice versa), reflecting directly back to the satellite.
                      Result: exceptionally strong <strong>HH return (+3 to +5 dB jump)</strong>, revealing hidden floodwater beneath trees!
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Experiment 3: Speckle Filter */}
          {activeExp === 'speckle' && (
            <div className="space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3">
                <h2 className="text-lg font-bold text-[#102A43]">
                  {isBn ? 'পরীক্ষা ৩: স্পেকল নয়েজ ফিল্টারিং' : 'Experiment 3: Speckle Noise Filtering'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {isBn
                    ? 'রাডারের কোহেরেন্ট সংকেতে স্পেকল (লবণ-মরিচের মতো নয়েজ) থাকে। লি (Lee) ফিল্টার প্রান্ত অক্ষুণ্ণ রেখে নয়েজ দূর করে।'
                    : 'SAR speckle is coherent constructive/destructive interference. Lee filtering suppresses grain while preserving bank edges.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Raw Unfiltered', desc: 'Full grain, salt-and-pepper noise' },
                  { id: 'boxcar', label: 'Boxcar (3x3 Mean)', desc: 'Blurs water/land boundaries' },
                  { id: 'lee', label: 'Lee Adaptive Filter', desc: 'Edge-preserving adaptive smoothing' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSpeckleFilter(f.id as typeof speckleFilter)}
                    className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                      speckleFilter === f.id
                        ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div className="font-bold text-xs">{f.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#102A43]">Selected Algorithm:</span>{' '}
                  <span className="font-mono text-[#0284C7] font-bold uppercase">{speckleFilter}</span>
                </div>
                <div className="font-mono text-[11px] text-[#64748B]">
                  Equivalent Number of Looks (ENL):{' '}
                  <strong className="text-[#102A43]">
                    {speckleFilter === 'none' ? '1.0' : speckleFilter === 'boxcar' ? '4.8 (Blurred)' : '3.6 (Preserved)'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Experiment 4: Fringe Counter */}
          {activeExp === 'fringe' && (
            <div className="space-y-4">
              <div className="border-b border-[#F1F5F9] pb-3">
                <h2 className="text-lg font-bold text-[#102A43]">
                  {isBn ? 'পরীক্ষা ৪: ইন্টারফেরোমেট্রিক ফ্রিঞ্জ কাউন্টার' : 'Experiment 4: InSAR Fringe Counter'}
                </h2>
                <p className="text-xs text-[#64748B]">
                  {isBn
                    ? 'প্রতিটি পূর্ণ রঙচক্র (২পাই রেডিয়ান) মানে তরঙ্গদৈর্ঘ্যের অর্ধেক (১২ সেমি) চলন।'
                    : 'Each 2π phase cycle represents λ / 2 Line-Of-Sight motion (11.92 cm for NISAR L-band).'}
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-xs font-semibold text-[#102A43]">
                  <span>Simulated Phase Gradient (Radians)</span>
                  <span className="font-mono text-[#155E75]">{(phaseSpanRad / Math.PI).toFixed(1)} π</span>
                </div>
                <input
                  type="range"
                  min={Math.PI}
                  max={8 * Math.PI}
                  step={Math.PI / 2}
                  value={phaseSpanRad}
                  onChange={(e) => setPhaseSpanRad(Number(e.target.value))}
                  className="w-full accent-[#155E75] cursor-pointer"
                />

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E8F0] text-center text-xs">
                  <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#64748B]">Fringe Cycles</div>
                    <div className="font-mono font-bold text-base text-[#155E75]">
                      {(phaseSpanRad / (2 * Math.PI)).toFixed(1)} λ
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#64748B]">Displacement / Fringe</div>
                    <div className="font-mono font-bold text-base text-[#102A43]">119.2 mm</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#64748B]">Total LOS Motion Span</div>
                    <div className="font-mono font-bold text-base text-[#D97706]">
                      {((phaseSpanRad / (2 * Math.PI)) * 119.2).toFixed(1)} mm
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Future NISAR Readiness Strip (E14) */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#102A43]">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span>Future NISAR Capabilities Horizon (plan.md E14)</span>
              </span>
              <span className="text-[10px] text-[#64748B]">Pre-operational Readiness</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-[#CBD5E1]">
                <div className="font-semibold text-[#0F172A]">Soil Moisture (SME2)</div>
                <div className="text-[10px] text-[#16A34A] font-bold mt-0.5">READY (Coarse 200m)</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Field-scale agricultural water content.</div>
              </div>
              <div className="bg-white p-2 rounded border border-[#CBD5E1]">
                <div className="font-semibold text-[#0F172A]">Forest Biomass & Canopy</div>
                <div className="text-[10px] text-[#2563EB] font-bold mt-0.5">DUAL-PASS PLANNED</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Sundarbans carbon stock estimation.</div>
              </div>
              <div className="bg-white p-2 rounded border border-[#CBD5E1]">
                <div className="font-semibold text-[#0F172A]">Tectonic Subsidence (GUNW)</div>
                <div className="text-[10px] text-[#16A34A] font-bold mt-0.5">IMPLEMENTED (80m)</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Deltaic sediment compaction monitoring.</div>
              </div>
            </div>
          </div>

          {/* Scope Invariant Reminder */}
          <div className="flex items-start space-x-2 text-[10px] text-[#64748B] bg-[#FFFBEB] p-2.5 rounded border border-[#FDE68A]">
            <AlertCircle className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Invariant Note:</strong> Foreign hazard test cases (Glacier Bay, NorCal fire, Mexico City earthquake)
              remain strictly educational reference examples; active operational pipeline monitoring is bounded exclusively to Jamuna and Sundarbans.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
