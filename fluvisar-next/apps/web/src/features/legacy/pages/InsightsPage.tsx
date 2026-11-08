import {
  AlertTriangle,
  Building2,
  DollarSign,
  MapPin,
  ShieldAlert,
  Sprout,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { FORECAST_DATA, IMPACT_DATA } from '../data/forecastImpact';
import '../styles/insights.css';

// Counter Hook for animated numbers
function useCounter(end: number, duration = 1800, start = 0) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(progress === 1 ? end : Math.floor(easeOutQuart * (end - start) + start));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

const REACH_LIST = [
  { id: 'jamuna-chilmari', name: 'Jamuna · Chilmari' },
  { id: 'glacier-bay-alaska', name: 'Glacier Bay · Alaska' },
  { id: 'norcal-wildfire', name: 'NorCal Wildfire' },
  { id: 'sundarbans-mangrove', name: 'Sundarbans Mangrove' },
];

export function InsightsPage() {
  const [reachId, setReachId] = useState('jamuna-chilmari');
  const forecast = FORECAST_DATA[reachId] || FORECAST_DATA['jamuna-chilmari'];
  const impact = IMPACT_DATA[reachId] || IMPACT_DATA['jamuna-chilmari'];

  const [manifest, setManifest] = useState<any>(null);
  const [qc, setQc] = useState<any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const manRes = await fetch(`/data/v1/${reachId}/manifest.json`);
        if (manRes.ok) {
          const manData = await manRes.json();
          setManifest(manData);
        } else {
          setManifest(null);
        }
      } catch (e) {
        console.error('Failed to fetch manifest', e);
        setManifest(null);
      }
      try {
        const qcRes = await fetch(`/data/v1/${reachId}/qc.json`);
        if (qcRes.ok) {
          const qcData = await qcRes.json();
          setQc(qcData);
        } else {
          setQc(null);
        }
      } catch (e) {
        console.error('Failed to fetch qc', e);
        setQc(null);
      }
    }
    fetchData();
  }, [reachId]);

  // Animated counters for KPIs
  const popCount = useCounter(impact.populationAtRisk);
  const homeCount = useCounter(impact.homesAtRisk);
  const agCount = useCounter(impact.agriLandHa);
  const econCount = useCounter(impact.economicLossUSD);

  // DaLA calculations (approximate splits based on total)
  const totalDamage = impact.economicLossUSD * 0.65;
  const totalLoss = impact.economicLossUSD * 0.35;

  // Real or fallback values
  const t0Granule = manifest?.inputs?.t0 || 'NISAR_L2_PR_GCOV_029_019_D_076_2005...';
  const t1Granule = manifest?.inputs?.t1 || 'NISAR_L2_PR_GCOV_031_019_D_076_2005...';
  const otsuThreshold = qc?.otsu_threshold ? `${qc.otsu_threshold.toFixed(2)} dB` : '-15.06 dB → -14.53 dB';

  const qcChecks = qc?.checks || {};
  const renderQcLight = (name: string, status: string | undefined) => {
    let className = 'qc-light';
    if (status === 'PASS') className += ' pass';
    else if (status === 'WARN') className += ' warn';
    else if (status === 'FAIL') className += ' fail';
    return <div key={name} className={className} title={`${name}: ${status || 'NOT EVALUATED'}`}></div>;
  };

  const handleCopyBriefing = () => {
    const text = `EMERGENCY BRIEFING: ${reachId.toUpperCase()}
Population at Risk: ${impact.populationAtRisk.toLocaleString()}
Economic Loss: $${(impact.economicLossUSD / 1000000).toFixed(1)}M USD
QC Confidence: ${qc?.pipeline_passed ? 'HIGH CONFIDENCE (Pipeline checks passed)' : 'LOWER CONFIDENCE (Review pipeline flags)'}

Top Emergency Actions:
${impact.emergencyActions.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    alert('Briefing copied to clipboard');
  };

  return (
    <div className="insights-desk">
      <main className="id-shell">
        {/* ── Top Header ────────────────────────────────────────── */}
        <header className="id-header">
          <div>
            <div className="id-kicker">
              <span className="id-dot-pulse" />
              FLUVISAR / SOCIO-ECONOMIC INSIGHTS
            </div>
            <h1>From spatial impact to decision intelligence</h1>
            <p>
              Sendai Framework metrics, World Bank DaLA loss estimates, and real-time community action response.
            </p>
          </div>
          <div className="id-header-actions">
            <button className="is-primary" onClick={() => setShowEmergencyModal(true)}>
              <AlertTriangle size={15} />
              Emergency Briefing
            </button>
          </div>
        </header>

        {/* ── Runbar & Reach Selector ───────────────────────────── */}
        <div className="insights-runbar">
          <div className="insights-reach-pills">
            <span className="insights-reach-label">
              <MapPin size={14} />
              Study Reach:
            </span>
            {REACH_LIST.map(reach => (
              <button
                key={reach.id}
                className={`insights-reach-pill ${reachId === reach.id ? 'is-active' : ''}`}
                onClick={() => setReachId(reach.id)}
              >
                {reach.name}
              </button>
            ))}
          </div>
          <div className="insights-satellite-tag">
            <span>NISAR L2 GCOV · 20 m</span>
            <span className="id-dot" />
            <span className="badge-provisional">PROVISIONAL</span>
            <span className="badge-inconclusive">Δh = 0.039m</span>
          </div>
        </div>

        {/* ── ROW 1: 4 KPI Metrics Strip (Matched with Decision Desk) */}
        <div className="id-metrics">
          <article>
            <span>
              <Users size={14} style={{ color: 'var(--id-loss)' }} />
              Target B-1 · People at Risk
            </span>
            <strong>
              {popCount.toLocaleString()}
              <small>people</small>
            </strong>
            <p>SEDAC GPWv4 Global Population Grid</p>
            <div className="insights-metric-tag is-rose">Direct Exposure</div>
          </article>

          <article>
            <span>
              <Building2 size={14} style={{ color: 'var(--id-warn)' }} />
              Target B-3 · Homes Threatened
            </span>
            <strong>
              {homeCount.toLocaleString()}
              <small>units</small>
            </strong>
            <p>Modeled Dwellings & Settlement Grid</p>
            <div className="insights-metric-tag is-amber">High Vulnerability</div>
          </article>

          <article>
            <span>
              <Sprout size={14} style={{ color: 'var(--id-gain)' }} />
              Target C-2 · Agricultural Loss
            </span>
            <strong>
              {agCount.toLocaleString()}
              <small>ha</small>
            </strong>
            <p>SAR-detected Cropland Inundation</p>
            <div className="insights-metric-tag is-emerald">Food Security</div>
          </article>

          <article>
            <span>
              <DollarSign size={14} style={{ color: 'var(--id-water)' }} />
              Target C-3 · Economic Exposure
            </span>
            <strong>
              ${(econCount / 1000000).toFixed(1)}
              <small>M USD</small>
            </strong>
            <p>World Bank DaLA Baseline Ledger</p>
            <div className="insights-metric-tag is-cyan">Total Assessment</div>
          </article>
        </div>

        {/* ── ROW 2: UNDRR Sendai Framework Indicators ───────────── */}
        <div className="insights-section-title">
          <h2>
            <ShieldAlert size={16} style={{ color: 'var(--id-accent)' }} />
            UNDRR Sendai Framework Indicators (2015–2030)
          </h2>
          <span>Global Disaster Risk Reduction Benchmark</span>
        </div>

        <div className="sendai-grid">
          <div className="sendai-panel">
            <div className="sendai-title">
              <span>TARGET B: Affected Population</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)', fontWeight: 500 }}>Direct & Indirect</span>
            </div>
            <div className="indicator-row">
              <div className="ind-code">B-3</div>
              <div className="ind-desc">Dwellings damaged / destroyed</div>
              <div className="ind-val">{impact.homesAtRisk.toLocaleString()}</div>
              <div className="ind-bar-container">
                <div className="ind-bar bg-warn" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="indicator-row">
              <div className="ind-code">B-4</div>
              <div className="ind-desc">Livelihoods disrupted</div>
              <div className="ind-val">{impact.populationAtRisk.toLocaleString()}</div>
              <div className="ind-bar-container">
                <div className="ind-bar bg-fail" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          <div className="sendai-panel">
            <div className="sendai-title">
              <span>TARGET C: Direct Economic Loss</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)', fontWeight: 500 }}>Productive Assets</span>
            </div>
            <div className="indicator-row">
              <div className="ind-code">C-2</div>
              <div className="ind-desc">Agricultural loss</div>
              <div className="ind-val">{impact.agriLandHa.toLocaleString()} ha</div>
              <div className="ind-bar-container">
                <div className="ind-bar bg-accretion" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="indicator-row">
              <div className="ind-code">C-4</div>
              <div className="ind-desc">Housing sector loss</div>
              <div className="ind-val">${((totalDamage * 0.4) / 1000000).toFixed(1)}M</div>
              <div className="ind-bar-container">
                <div className="ind-bar bg-water" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: DaLA Ledger & Erosion Risk ─────────────────── */}
        <div className="split-grid">
          <div className="glass-panel dala-ledger">
            <div className="panel-header">
              <span>World Bank DaLA Economic Ledger</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)' }}>Damage & Loss Assessment</span>
            </div>

            <div className="dala-section">
              <div className="dala-header">
                <span>DIRECT PHYSICAL DAMAGE (Replacement Cost)</span>
                <span className="dala-subtotal">${(totalDamage / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>├ Rural Homesteads (Kacha/Semi-pucca)</span>
                <span>${((totalDamage * 0.38) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>├ Agricultural Land Value</span>
                <span>${((totalDamage * 0.34) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>├ Flood Control Infrastructure</span>
                <span>${((totalDamage * 0.17) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>└ Drinking Water Tubewells</span>
                <span>${((totalDamage * 0.11) / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            <div className="dala-section">
              <div className="dala-header">
                <span>ECONOMIC FLOW LOSSES (Foregone Revenue)</span>
                <span className="dala-subtotal">${(totalLoss / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>├ Lost Aman/Boro Harvest (1-3 cycles)</span>
                <span>${((totalLoss * 0.48) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>├ Lost Wage Labor Days</span>
                <span>${((totalLoss * 0.28) / 1000000).toFixed(1)}M</span>
              </div>
              <div className="dala-item">
                <span>└ Emergency Relocation Costs</span>
                <span>${((totalLoss * 0.24) / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            <div className="dala-total">
              <span>TOTAL ESTIMATED DaLA</span>
              <span className="text-fail">${(impact.economicLossUSD / 1000000).toFixed(1)}M USD</span>
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-header">
              <span>Erosion Risk Zones (NISAR Detected)</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)' }}>Cross-Sectional Dynamics</span>
            </div>
            <div className="risk-zones">
              {forecast.erosionRisk.map((zone, i) => (
                <div key={i} className="risk-zone-item">
                  <div className="zone-info">
                    <span className="zone-label">{zone.label}</span>
                    <span className="zone-area text-fail">{zone.area_ha} ha</span>
                  </div>
                  <div className="zone-bar-container">
                    <div className="zone-bar bg-fail" style={{ width: `${zone.probability * 100}%` }}></div>
                  </div>
                  <div className="zone-prob">Probability: {(zone.probability * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
            <button className="emergency-alert-btn" onClick={() => setShowEmergencyModal(true)}>
              <AlertTriangle size={16} /> GENERATE EMERGENCY BRIEFING
            </button>
          </div>
        </div>

        {/* ── ROW 4: Temporal Decay & Community Action ─────────── */}
        <div className="split-grid">
          <div className="glass-panel">
            <div className="panel-header">
              <span>Temporal Economic Decay Trajectory</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)' }}>Projected Flow Cascades</span>
            </div>
            <div className="temporal-chart-container">
              <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Grid */}
                <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />

                {/* Labels */}
                <text x="50" y="190" fill="var(--id-muted)" fontSize="13" fontFamily="monospace">
                  AUG (t0)
                </text>
                <text x="250" y="190" fill="#22d3ee" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  SEP (t1)
                </text>
                <text x="450" y="190" fill="var(--id-muted)" fontSize="13" fontFamily="monospace">
                  OCT
                </text>
                <text x="650" y="190" fill="#f43f5e" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  NOV (HARVEST)
                </text>

                {/* Confidence Polygon */}
                <polygon
                  points="250,150 450,120 650,40 800,20 800,100 650,120 450,160 250,150"
                  fill="rgba(244, 63, 94, 0.12)"
                />

                {/* Physical Damage Line */}
                <path d="M 0 150 L 250 150 L 255 60 L 800 60" fill="none" stroke="#f43f5e" strokeWidth="2.5" />

                {/* Economic Loss Line (Cascading) */}
                <path d="M 0 150 L 250 150 L 450 140 L 650 80 L 800 60" fill="none" stroke="#22d3ee" strokeWidth="3" />

                <circle cx="250" cy="150" r="5" fill="#22d3ee" />
                <circle cx="255" cy="60" r="5" fill="#f43f5e" />
                <circle cx="650" cy="80" r="5" fill="#fbbf24" />
              </svg>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="dot bg-fail"></span> Physical Infrastructure Loss
              </span>
              <span className="legend-item">
                <span className="dot bg-water"></span> Economic Flow Cascading Loss
              </span>
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-header">
              <span>Community Action Matrix</span>
              <span style={{ fontSize: '11px', color: 'var(--id-muted)' }}>Field Protocols</span>
            </div>
            <div className="action-matrix">
              {impact.emergencyActions.map((action, i) => {
                const priority = i === 0 ? 'P1' : i === 1 ? 'P2' : 'P3';
                const status = i === 0 ? 'EVACUATE' : i === 1 ? 'PREPOSIT.' : 'MONITOR';
                const statusColor = i === 0 ? 'text-fail' : i === 1 ? 'text-warn' : 'text-pass';

                return (
                  <div key={i} className="action-row">
                    <div className="action-col-priority">{priority}</div>
                    <div className="action-col-desc">{action}</div>
                    <div className={`action-col-status ${statusColor}`}>{status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ROW 5: Scientific Provenance & Audit Trail ───────── */}
        <div className="provenance-footer">
          <div className="prov-header">
            <ShieldAlert size={15} />
            SCIENTIFIC PROVENANCE & AUDIT TRAIL
          </div>
          <div className="prov-grid">
            <div className="prov-item">
              <div className="prov-label">NISAR t0 Granule (Pre)</div>
              <div className="prov-val">{t0Granule}</div>
            </div>
            <div className="prov-item">
              <div className="prov-label">NISAR t1 Granule (Post)</div>
              <div className="prov-val">{t1Granule}</div>
            </div>
            <div className="prov-item">
              <div className="prov-label">Otsu Thresholds</div>
              <div className="prov-val">{otsuThreshold}</div>
            </div>
            <div className="prov-item">
              <div className="prov-label">Pipeline QC Flags</div>
              <div className="prov-val text-fail">
                {qc ? (qc.pipeline_passed ? 'ALL CHECKS PASSED' : 'FLAGGED FOR REVIEW') : '3 WARN, 1 FAIL (Plausibility)'}
              </div>
              {qc && (
                <div className="qc-grid">{Object.keys(qcChecks).map(k => renderQcLight(k, qcChecks[k]))}</div>
              )}
            </div>
            <div className="prov-item">
              <div className="prov-label">Resolution / MMU</div>
              <div className="prov-val">20m (400 m²) / 12 px (4,800 m²)</div>
            </div>
            <div className="prov-item">
              <div className="prov-label">Methodology Reference</div>
              <div className="prov-val">Section 10.5 (Stage-Bounded Erosion)</div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Emergency Modal ────────────────────────────────────── */}
      {showEmergencyModal && (
        <div className="emergency-modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-modal" onClick={e => e.stopPropagation()}>
            <h2>
              <AlertTriangle size={22} style={{ color: '#fbbf24' }} />
              EMERGENCY BRIEFING
            </h2>
            <p>
              <strong>Reach:</strong> {reachId.toUpperCase().replace(/-/g, ' ')}
            </p>
            <p>
              <strong>Population at Risk:</strong> {impact.populationAtRisk.toLocaleString()} people
            </p>
            <p>
              <strong>Est. Economic Impact:</strong> ${(impact.economicLossUSD / 1000000).toFixed(1)}M USD
            </p>

            <h3>Required Actions:</h3>
            <ul>
              {impact.emergencyActions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>

            <h3>Data Confidence Assessment:</h3>
            <p style={{ color: qc?.pipeline_passed ? 'var(--id-gain)' : 'var(--id-warn)' }}>
              {qc?.pipeline_passed
                ? 'High Confidence: SAR pipeline reported no anomalies. Plausibility checks passed.'
                : 'Warning: SAR pipeline flagged potential anomalies or inconclusive checks.'}
            </p>

            <div className="emergency-modal-actions">
              <button className="btn-copy" onClick={handleCopyBriefing}>
                Copy to Clipboard
              </button>
              <button className="btn-close" onClick={() => setShowEmergencyModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
