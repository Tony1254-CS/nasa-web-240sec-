import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Smartphone, Footprints, Info } from 'lucide-react';
import { radarSonifier } from '../../../utils/sonification';

export const WalkOnRadar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [walkMode, setWalkMode] = useState<'drag' | 'gps'>('drag');
  const [currentDb, setCurrentDb] = useState<number>(-17.4);
  const [gridPos, setGridPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Synthesize audio tone on dB change
  useEffect(() => {
    if (isPlaying) {
      radarSonifier.playToneForDb(currentDb);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // Haptic feedback proportional to radar power
        const duration = currentDb > -12 ? 40 : 15;
        try { navigator.vibrate?.([duration]); } catch {}
      }
    }
  }, [currentDb, isPlaying]);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (walkMode !== 'drag' && !isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setGridPos({ x, y });

    // Simulate realistic backscatter transition across Jamuna riverbank profile:
    // Left side (x < 45) = Chilmari vegetated embankment (-9 to -12 dB)
    // Transition zone (45 <= x <= 65) = cutbank collapse (-13 to -18 dB)
    // Right side (x > 65) = Deep Jamuna open water (-19 to -24 dB)
    let calculatedDb = -10.0;
    if (x < 45) {
      calculatedDb = -9.5 - (x / 45) * 3.5;
    } else if (x <= 65) {
      calculatedDb = -13.0 - ((x - 45) / 20) * 5.8;
    } else {
      calculatedDb = -18.8 - ((x - 65) / 35) * 5.2;
    }
    // Add small roughness variation with y
    calculatedDb += Math.sin(y * 0.2) * 0.8;
    setCurrentDb(Number(calculatedDb.toFixed(1)));
  };

  const toggleSound = () => {
    if (!isPlaying) {
      radarSonifier.playToneForDb(currentDb);
      setIsPlaying(true);
    } else {
      radarSonifier.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-cyan-400" />
          <h3 className="font-bold text-xs text-white">Walk on the Radar (Acoustic & Tactile FELL)</h3>
        </div>
        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
            isPlaying ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span>{isPlaying ? 'Audio ON' : 'Audio OFF'}</span>
        </button>
      </div>

      {/* Tactile Sonification Surface */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          if (!isPlaying) toggleSound();
          handlePointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) handlePointer(e);
        }}
        className="relative h-56 bg-linear-to-r from-slate-900 via-slate-950 to-blue-950 p-3 flex flex-col justify-between cursor-crosshair select-none touch-none border-b border-slate-800"
      >
        {/* Visual Zone Markers */}
        <div className="flex justify-between text-[10px] text-slate-400 pointer-events-none">
          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
            Char Soil (-9 dB · High Pitch)
          </span>
          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
            Cutbank (-16 dB)
          </span>
          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-cyan-400">
            Open Water (-23 dB · Low Pitch)
          </span>
        </div>

        {/* Tactile Puck indicator */}
        <div
          style={{ left: `${gridPos.x}%`, top: `${gridPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-400/25 flex items-center justify-center animate-ping" />
          <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Readout Telemetry */}
        <div className="bg-slate-950/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-800 self-start pointer-events-none space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Measured Radar Backscatter</div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {currentDb > -99 ? `${currentDb} dB` : 'Out of bounds'}
          </div>
          <div className="text-[9px] text-slate-400">
            Pitch: {Math.round(220 * Math.pow(2, (currentDb + 25) / 12))} Hz · Mode: {walkMode === 'drag' ? 'Finger Drag' : 'GPS Walk'}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-right pointer-events-none">
          Drag finger across surface to traverse riverbank profile
        </div>
      </div>

      {/* Mode Switches & Scientific Attribution */}
      <div className="p-3 bg-slate-950 text-xs space-y-2.5">
        <div className="flex gap-2">
          <button
            onClick={() => setWalkMode('drag')}
            className={`flex-1 py-1.5 px-3 rounded flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
              walkMode === 'drag' ? 'bg-cyan-700 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Smartphone size={13} />
            <span>Finger-Drag Simulator</span>
          </button>
          <button
            onClick={() => setWalkMode('gps')}
            className={`flex-1 py-1.5 px-3 rounded flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
              walkMode === 'gps' ? 'bg-cyan-700 text-white font-bold' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Footprints size={13} />
            <span>GPS Field Walk</span>
          </button>
        </div>

        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Info size={15} className="text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Acoustic Scientific Encoding (plan.md E22 / AX04):</strong> Sound is an auditory encoding of backscatter power (f = 220 × 2^((dB + 25) / 12) Hz), allowing field observers to hear radar surface roughness differences while walking the bankline. It is NOT space audio recorded from orbit.
          </p>
        </div>
      </div>
    </div>
  );
};
