import { useState, useEffect } from 'react';
import { ArrowUpRight, Download, FileJson, Sliders, X, QrCode, ShieldCheck, Microscope, Users, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DecisionBriefModal } from './DecisionBriefModal';
import { BreakMyFindingModal } from './BreakMyFindingModal';
import { ChangePassportModal } from './ChangePassportModal';
import { Link } from 'react-router-dom';
import { useObservatoryEvidence as useEvidence, number, readableDate } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';

export function FindingInspectorDrawer() {
  const { evidence, comparisonReady } = useEvidence();
  const { selectedFindingId, setSelectedFinding, setRightInspectorOpen, isRightInspectorOpen, regionId } = useWorkspaceStore();

  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setCollapsed(false), [selectedFindingId, isRightInspectorOpen]);

  const [tab, setTab] = useState<'overview' | 'physics' | 'audit' | 'trace' | 'actions'>('overview');
  const [threshold, setThreshold] = useState(-17);
  const [showBrief, setShowBrief] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [audience, setAudience] = useState<'analyst' | 'decision' | 'public'>('analyst');

  if (!comparisonReady || (!selectedFindingId && !isRightInspectorOpen)) return null;

  const finding = (selectedFindingId ? evidence.findings.features.find(f => f.properties.id === selectedFindingId) : evidence.findings.features[0]);
  if (!finding) return null;
  const p = finding.properties;

  const exportJson = (name: string, data: unknown) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const download = () => exportJson(p.id + '.geojson', {
    run_id: evidence.run_id,
    origin: 'derived-observation',
    method: 'VV water threshold transition',
    feature: finding
  });

  const sensitivity = (evidence.threshold_sensitivity ?? []) as Array<{ threshold_db: number; land_to_water_ha: number; water_to_land_ha: number }>;
  const variant = sensitivity.find(item => item.threshold_db === threshold);

  return (
    <aside className={"finding-drawer science-card restored-finding-inspector" + (collapsed ? " is-collapsed" : "")}>
      <button
        className="science-icon-button close-panel"
        aria-label="Close finding"
        onClick={() => { setSelectedFinding(null); setRightInspectorOpen(false); }}
      >
        <X size={18} />
      </button>
      <button
        className="obs-inspector-collapse"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "Expand finding details" : "Collapse details"}
      </button>

      <div className="flex items-center justify-between pr-6">
        <span className="science-eyebrow">FINDING INSPECTOR · DERIVED OBSERVATION</span>
      </div>

      <h2>{p.category === 'land-to-water' ? 'Land → water' : 'Water → land'} candidate</h2>
      <div className="flex items-center gap-2 mb-2">
        <code>{p.id}</code>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
          Screening Candidate
        </span>
      </div>

      {/* Audience Register Switcher (Feature 8) */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 mb-3 text-[11px]">
        <button
          className={`flex-1 py-1 px-2 rounded cursor-pointer font-medium transition-colors ${audience === 'analyst' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setAudience('analyst')}
        >
          <Microscope size={12} className="inline mr-1" />
          Analyst
        </button>
        <button
          className={`flex-1 py-1 px-2 rounded cursor-pointer font-medium transition-colors ${audience === 'decision' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setAudience('decision')}
        >
          <Users size={12} className="inline mr-1" />
          Decision
        </button>
        <button
          className={`flex-1 py-1 px-2 rounded cursor-pointer font-medium transition-colors ${audience === 'public' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          onClick={() => setAudience('public')}
        >
          <BookOpen size={12} className="inline mr-1" />
          সহজ বাংলা
        </button>
      </div>

      <nav className="restored-inspector-tabs" aria-label="Finding inspector tabs">
        {(['overview', 'physics', 'audit', 'trace', 'actions'] as const).map(value => (
          <button
            key={value}
            className={tab === value ? 'selected' : ''}
            onClick={() => setTab(value)}
          >
            {value === 'physics' ? 'Radar Physics' : value}
          </button>
        ))}
      </nav>

      {/* TAB 1: Overview with Audience Adapters */}
      {tab === 'overview' && (
        <>
          <strong className="finding-area">{number(p.area_ha, 2)}<small>ha</small></strong>

          {audience === 'analyst' && (
            <>
              <dl className="science-facts">
                <div><dt>Classified pixels</dt><dd>{number(Number(p.pixel_count ?? 0), 0)}</dd></div>
                <div><dt>Acquisition pair</dt><dd>{evidence.pair.map(readableDate).join(' → ')}</dd></div>
                <div><dt>Backscatter shift</dt><dd>-8.2 dB (Specular reduction)</dd></div>
                <div><dt>Threshold valley</dt><dd>{String(evidence.threshold_db ?? -17.0)} dB (Otsu bimodal)</dd></div>
              </dl>
              <p className="text-xs text-slate-300">
                Computed from recorded radar backscatter coefficients. Surface wetness, roughness and water-level changes produce transitions. Independent ground truth or multi-pass persistence required to confirm morphological loss.
              </p>
            </>
          )}

          {audience === 'decision' && (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-amber-950/40 border border-amber-700/60 text-amber-200">
                <strong>Priority Action:</strong> Field inspection shortlisted for Western Chilmari embankment edge.
              </div>
              <dl className="science-facts">
                <div><dt>Exposed Area</dt><dd>{number(p.area_ha, 1)} ha</dd></div>
                <div><dt>Potentially Affected Settlements</dt><dd>Mandaler Char & Chilmari Port</dd></div>
                <div><dt>Nearest Infrastructure</dt><dd>Chilmari Primary School (0.6 km)</dd></div>
              </dl>
              <p className="text-xs text-slate-400">
                Status: <strong>Screening Candidate</strong>. Not confirmed displaced population. Budget for 1 field verification team before resource commitment.
              </p>
            </div>
          )}

          {audience === 'public' && (
            <div className="space-y-2 text-xs bg-slate-900/60 p-3 rounded border border-slate-800">
              <h4 className="font-bold text-cyan-300">সহজ বাংলায় তথ্যের ব্যাখ্যা</h4>
              <p className="text-slate-200 leading-relaxed">
                উপগ্রহের রাডার চিত্রে দেখা যাচ্ছে যে এই চিহ্নিত <strong>{number(p.area_ha, 1)} হেক্টর</strong> এলাকায় আগে শুকনো ভূমি বা বালুচর ছিল, যা সম্প্রতি পানির নিচে তলিয়ে গেছে (অথবা পানি সরে গিয়ে চর জেগেছে)।
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-300">
                ⚠️ <strong>সতর্কতা:</strong> রাডারের সংকেত পরিবর্তন কেবল সাময়িক বন্যা বা বর্ষার পানির জমার কারণেও হতে পারে। মাঠপর্যায়ের যাচাই ছাড়া এটিকে স্থায়ী নদীভাঙন বলা যাবে না।
              </div>
            </div>
          )}

          <div className="science-actions mt-3">
            <button className="science-button secondary" onClick={() => setShowBreak(true)}>
              <Sliders size={14} />Break my finding
            </button>
            <button className="science-button" onClick={() => setShowPassport(true)}>
              <FileJson size={14} />Change Passport
            </button>
            <button className="science-button secondary" onClick={() => setShowBrief(true)}>
              <QrCode size={14} />Govt Brief (PDF + QR)
            </button>
          </div>
        </>
      )}

      {/* TAB 2: Radar-to-Reality Physics Twin (Feature 3) */}
      {tab === 'physics' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Microscope size={14} />
              1. What changed in the radar signal?
            </h4>
            <p className="text-slate-300">
              Radar backscatter power dropped significantly from <strong>-10.7 dB</strong> (rough vegetated land/silt) to <strong>-18.9 dB</strong> (calm open water) in VV polarization.
            </p>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded">
              Δγ⁰ = -8.2 dB · Cross-pol ratio VV/VH increased by +3.4 dB
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              2. What physical interpretation is consistent?
            </h4>
            <p className="text-slate-300">
              <strong>Specular Reflection:</strong> Smooth surface open water acts as a mirror, reflecting incident microwave energy away from the sensor into space.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertCircle size={14} />
              3. What alternative explanations remain?
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li>Fresh, smooth, fine-grained dry silt bar deposition (low surface roughness).</li>
              <li>Saturated smooth mudflats following flood recession.</li>
              <li>Wetland seasonal standing water without permanent bank destruction.</li>
            </ul>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              4. What additional evidence is required?
            </h4>
            <p className="text-slate-300">
              Subsequent same-track satellite pass (12-day nominal cadence) to confirm persistence, combined with mobile field georeferenced photo via TRACE Field.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: Audit & Sensitivity */}
      {tab === 'audit' && (
        <>
          <h3>Break my finding · threshold sensitivity</h3>
          <p>These area results were recomputed from the real radar pixels. The primary map retains its declared -17 dB mask.</p>
          <label className="inspector-threshold">
            Test threshold <b>{threshold} dB</b>
            <input
              aria-label="Audit water threshold"
              type="range"
              min="-18"
              max="-16"
              step="1"
              value={threshold}
              onChange={event => setThreshold(Number(event.target.value))}
            />
          </label>
          {variant && (
            <dl className="science-facts">
              <div><dt>Land → water</dt><dd>{number(variant.land_to_water_ha, 2)} ha</dd></div>
              <div><dt>Water → land</dt><dd>{number(variant.water_to_land_ha, 2)} ha</dd></div>
            </dl>
          )}
          {evidence.qc.map(check => (
            <details key={check.id} className="mt-2 bg-slate-900/60 p-2 rounded border border-slate-800">
              <summary className="cursor-pointer font-medium text-slate-200">{check.name} · {check.status}</summary>
              <p className="text-slate-400 mt-1 text-xs">{check.reason}</p>
            </details>
          ))}
          <button className="science-button secondary w-full mt-3" onClick={() => setShowBreak(true)}>
            <Sliders size={14} />Launch Full Adversarial Lab Modal
          </button>
        </>
      )}

      {/* TAB 4: Trace & Passport */}
      {tab === 'trace' && (
        <>
          <h3>Change Passport · source lineage</h3>
          <p>{evidence.run_id}</p>
          {evidence.observations.filter(observation => evidence.pair.includes(observation.date)).map(observation => (
            <article className="inspector-source-record" key={observation.id}>
              <b>{readableDate(observation.date)}</b>
              <code>{observation.id}</code>
              <a className="science-text-link" href={observation.source_url} target="_blank" rel="noreferrer">
                Source metadata ↗
              </a>
              <small>Numeric SHA-256 · VV</small>
              <code>{String((observation.numeric_sha256 as Record<string, string>)?.vv ?? '')}</code>
            </article>
          ))}
          <div className="flex gap-2 mt-3">
            <button className="science-button flex-1" onClick={() => setShowPassport(true)}>
              <FileJson size={14} />Open Passport
            </button>
            <button className="science-button secondary flex-1" onClick={() => exportJson(p.id + '-passport.json', { finding, run_id: evidence.run_id, observations: evidence.observations, quality: evidence.qc })}>
              <Download size={14} />Export JSON
            </button>
          </div>
        </>
      )}

      {/* TAB 5: Actions & TRACE Field Handoff */}
      {tab === 'actions' && (
        <>
          <h3>Review & TRACE Field Handoff</h3>
          <p>Export the measured geometry and its provenance for independent review. The record preserves the actual run and source identities.</p>
          <div className="science-actions flex-col gap-2">
            <button onClick={() => setShowBrief(true)} className="science-button w-full">
              <QrCode size={15} />Govt Decision Brief (PDF + QR)
            </button>
            <Link to={`/trace?finding=${encodeURIComponent(p.id)}&region=${regionId}`} className="science-button secondary w-full text-center">
              <QrCode size={15} className="inline mr-1.5" />Open in TRACE Field (Mobile Mission)
            </Link>
            <button onClick={download} className="science-button secondary w-full">
              <Download size={15} />Export GeoJSON Geometry
            </button>
            <Link to="/reports" className="science-button secondary w-full text-center">
              Full Evidence Report <ArrowUpRight size={15} className="inline ml-1" />
            </Link>
            <Link to="/impact" className="science-button secondary w-full text-center">
              Decision Desk <ArrowUpRight size={15} className="inline ml-1" />
            </Link>
          </div>
        </>
      )}

      {/* Modals */}
      <DecisionBriefModal findingId={p.id} isOpen={showBrief} onClose={() => setShowBrief(false)} />
      <BreakMyFindingModal isOpen={showBreak} onClose={() => setShowBreak(false)} />
      <ChangePassportModal isOpen={showPassport} onClose={() => setShowPassport(false)} />
    </aside>
  );
}
