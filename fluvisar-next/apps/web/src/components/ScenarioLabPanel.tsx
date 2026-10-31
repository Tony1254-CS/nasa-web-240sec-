import React, { useState } from 'react';
import { Sliders, Download, ShieldAlert } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const ScenarioLabPanel: React.FC = () => {
  const { regionId, language } = useWorkspaceStore();
  
  // Scenario inputs
  const [stageDeltaM, setStageDeltaM] = useState<number>(0.8);
  const [ferrySevered, setFerrySevered] = useState<boolean>(true);
  const [embankmentBreached, setEmbankmentBreached] = useState<boolean>(false);

  const isBn = language === 'bn';

  // Computed scenario response
  const baseInundationHa = 145.8;
  const scenarioInundationHa = +(baseInundationHa + stageDeltaM * 42.5 + (embankmentBreached ? 38.0 : 0)).toFixed(1);
  const deltaInundationHa = +(scenarioInundationHa - baseInundationHa).toFixed(1);

  const baseIsolatedPop = 0;
  const scenarioIsolatedPop = (ferrySevered ? 3420 : 0) + (embankmentBreached ? 1850 : 0);
  const deltaIsolatedPop = scenarioIsolatedPop - baseIsolatedPop;

  const handleDownloadReceipt = () => {
    const receipt = {
      receipt_id: `RECEIPT-SCENARIO-${Date.now()}`,
      base_run_id: 'run-2026-prod-01',
      scenario_name: 'Hydro-Topological Response Scenario',
      created_at: new Date().toISOString(),
      origin: 'DECLARED_SIMULATION',
      declared_parameters: {
        stage_delta_meters: stageDeltaM,
        ferry_severed: ferrySevered,
        embankment_breached: embankmentBreached,
      },
      baseline_metrics: {
        inundation_ha: baseInundationHa,
        isolated_population: baseIsolatedPop,
      },
      scenario_metrics: {
        inundation_ha: scenarioInundationHa,
        isolated_population: scenarioIsolatedPop,
      },
      computed_differences: {
        delta_inundation_ha: deltaInundationHa,
        delta_isolated_pop: deltaIsolatedPop,
      },
      unresolved_uncertainties: [
        'Embankment breach scour depth at western Chilmari bend',
        'Emergency engine boat response velocity'
      ],
      authenticity_declaration: 'Per plan.md Section 13.0 N03: This is a declared simulation; not a verified historical satellite observation.'
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assumption-receipt-${regionId}-scenario.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 bg-white border-b border-[#CBD5E1] text-[11px] space-y-3">
      {/* Simulation Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] p-2 rounded flex items-start space-x-1.5 text-[10px] text-[#991B1B]">
        <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">DECLARED SCENARIO LABORATORY (W13 / E21)</strong>
          <span>This simulator tests hypothetical stress; not an unvalidated operational prediction.</span>
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-semibold text-[#102A43] text-[10px] uppercase">
          <span className="flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-[#155E75]" />
            <span>Hypothetical Surge Delta (Δh)</span>
          </span>
          <span className="font-mono text-[#155E75] font-bold">
            {stageDeltaM >= 0 ? `+${stageDeltaM.toFixed(1)}m` : `${stageDeltaM.toFixed(1)}m`}
          </span>
        </div>
        <input
          type="range"
          min={-1.5}
          max={2.5}
          step={0.1}
          value={stageDeltaM}
          onChange={(e) => setStageDeltaM(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#CBD5E1] rounded appearance-none accent-[#155E75] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[#64748B]">
          <span>-1.5m (Drought/Low)</span>
          <span>0.0m (Nominal)</span>
          <span>+2.5m (10-Yr Flood)</span>
        </div>
      </div>

      {/* Network Breaches Switches */}
      <div className="space-y-1.5 pt-1 border-t border-[#F1F5F9]">
        <label className="flex items-center justify-between p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
          <span className="text-[10px] text-[#334155] font-medium">Sever Chilmari–Roumari Ferry</span>
          <input
            type="checkbox"
            checked={ferrySevered}
            onChange={(e) => setFerrySevered(e.target.checked)}
            className="rounded border-[#CBD5E1] text-[#155E75] focus:ring-0 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
          <span className="text-[10px] text-[#334155] font-medium">Trigger West Embankment Breach</span>
          <input
            type="checkbox"
            checked={embankmentBreached}
            onChange={(e) => setEmbankmentBreached(e.target.checked)}
            className="rounded border-[#CBD5E1] text-[#155E75] focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Calculated Consequence Summary */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-2 rounded space-y-1 text-[10px]">
        <div className="flex justify-between items-center text-[#64748B]">
          <span>Projected Inundation:</span>
          <span className="font-mono font-bold text-[#102A43]">
            {scenarioInundationHa} ha <span className="text-[#DC2626]">({deltaInundationHa >= 0 ? `+${deltaInundationHa}` : deltaInundationHa} ha)</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-[#64748B]">
          <span>Isolated Population:</span>
          <span className="font-mono font-bold text-[#DC2626]">
            {scenarioIsolatedPop.toLocaleString()} residents
          </span>
        </div>
        <div className="flex justify-between items-center text-[#64748B]">
          <span>Critical Cutoffs:</span>
          <span className="font-mono font-bold text-[#155E75]">
            {(ferrySevered ? 1 : 0) + (embankmentBreached ? 2 : 0)} Edges Severed
          </span>
        </div>
      </div>

      {/* Assumption Receipt Generator (N03) */}
      <button
        onClick={handleDownloadReceipt}
        className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded bg-[#155E75] hover:bg-[#0E7490] text-white text-[10px] font-semibold shadow-xs transition-colors cursor-pointer"
      >
        <Download className="w-3 h-3" />
        <span>{isBn ? 'অনুমান রসিদ ডাউনলোড (N03 Receipt)' : 'Export Assumption Receipt (N03)'}</span>
      </button>
    </div>
  );
};
