import React, { useState } from 'react';
import { Camera, Crosshair, ShieldCheck } from 'lucide-react';

interface PointAndProveProps {
  targetCoords?: [number, number];
  targetName?: string;
  findingId?: string;
}

export const PointAndProve: React.FC<PointAndProveProps> = ({
  targetCoords = [89.665, 25.565],
  targetName = 'Chilmari West Bank Retreat (145.8 ha)',
  findingId: _findingId = 'FINDING-JAMUNA-01'
}) => {
  const [gpsAccuracy] = useState<number>(4.2);
  const [userHeading] = useState<number>(315); // NW
  const [simulatedDistance, setSimulatedDistance] = useState<number>(380); // meters

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100">
      {/* Top Banner */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-cyan-400" />
          <h3 className="font-bold text-xs text-white">Point & Prove: Field AR HUD</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
          Target: {targetCoords[0].toFixed(3)}°E, {targetCoords[1].toFixed(3)}°N
        </span>
      </div>

      {/* Simulated Camera Viewfinder View */}
      <div className="relative h-64 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Center Reticle / Compass HUD */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Accuracy Ring */}
          <div
            style={{ width: `${Math.min(180, gpsAccuracy * 25)}px`, height: `${Math.min(180, gpsAccuracy * 25)}px` }}
            className="rounded-full border border-dashed border-cyan-400/60 animate-pulse flex items-center justify-center pointer-events-none"
          >
            <Crosshair size={28} className="text-cyan-400 opacity-80" />
          </div>

          {/* Target Polygon Outline Projection */}
          <div className="absolute -top-12 border-2 border-rose-500/80 bg-rose-500/20 px-3 py-1.5 rounded text-center shadow-lg backdrop-blur-xs">
            <span className="text-[10px] font-bold text-rose-300 block">{targetName}</span>
            <span className="text-[9px] font-mono text-white">
              {simulatedDistance}m ahead · Bearing {userHeading}° NW
            </span>
          </div>
        </div>

        {/* Bottom Left HUD Telemetry */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] space-y-0.5">
          <div>GPS Accuracy: <strong className="text-emerald-400 font-mono">±{gpsAccuracy}m</strong></div>
          <div>Target Distance: <strong className="text-cyan-300 font-mono">{simulatedDistance}m</strong></div>
          <div>Heading: <strong className="text-white font-mono">{userHeading}°</strong> (Northwest)</div>
        </div>

        {/* Bottom Right Alignment Note */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 p-2 rounded border border-slate-800 text-[9px] text-amber-300 max-w-[170px] text-right">
          ⚠️ Approximate visual alignment. Not survey-grade geodetic boundary.
        </div>
      </div>

      {/* Interactive Controls & Disclaimer */}
      <div className="p-3 bg-slate-950 text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-400 text-[11px]">
          <span>Simulate Field Observer Distance:</span>
          <span className="font-mono text-cyan-300 font-bold">{simulatedDistance} meters</span>
        </div>
        <input
          type="range"
          min={50}
          max={1200}
          step={25}
          value={simulatedDistance}
          onChange={(e) => setSimulatedDistance(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />

        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <ShieldCheck size={15} className="text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Scientific Guardrail (plan.md AX03):</strong> Camera overlay communicates approximate satellite polygon proximity and camera orientation. It never asserts sub-meter boundaries or replaces real ground survey rods.
          </p>
        </div>
      </div>
    </div>
  );
};
