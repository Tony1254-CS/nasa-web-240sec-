// @ts-nocheck
import { analysisImage, reachForRegion, isoDate } from '../../../data/analysisRegistry';
import { useWorkspaceStore } from '../../../store/workspaceStore';
import { loadReachBundle } from '../data/load';
function useLabInputs() { const region=useWorkspaceStore(s=>s.regionId); const pair=useWorkspaceStore(s=>s.selectedPair); const p=pair??['2026-08-26','2026-09-19']; const reachId=reachForRegion(region); return {reachId, pair:p, radarUrl:analysisImage(reachId,'radar',p[0]), waterUrl:analysisImage(reachId,'water',p[0]), changeUrl:analysisImage(reachId,'change',p[0],p)}; }

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { Rocket, Globe, RefreshCw, Radio, Search, Ruler, Zap, Save, Clock, Handshake, Satellite, Target, Tornado, BarChart2, TrendingUp, Map, Star, XCircle, CheckCircle2, Leaf, Mountain, Antenna, Layers, Weight, Waves, ExternalLink } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   SAR SCIENCE LAB — Interactive Radar Remote Sensing Education
   Shows deep domain expertise in SAR / InSAR / NISAR science.
   ═══════════════════════════════════════════════════════════════ */

const BANDS = [
  { name: 'X-band', freq: '8–12 GHz', wl: '2.5–3.75 cm', pen: 'Shorter wavelength', use: 'High-detail mapping, urban areas', color: 'var(--erosion)', sat: 'TerraSAR-X, COSMO-SkyMed' },
  { name: 'C-band', freq: '4–8 GHz', wl: '3.75–7.5 cm', pen: 'Intermediate', use: 'Sea ice, agriculture, land monitoring', color: '#E0B34A', sat: 'Sentinel-1, Radarsat-2' },
  { name: 'L-band', freq: '1–2 GHz', wl: '15–30 cm', pen: 'Longer wavelength', use: 'Vegetation structure, soil moisture', color: 'var(--water)', sat: 'NISAR, ALOS-2 PALSAR', highlight: true },
  { name: 'P-band', freq: '0.3–1 GHz', wl: '30–100 cm', pen: 'Very long wavelength', use: 'Forest biomass and structure', color: '#7FBF8E', sat: 'ESA BIOMASS' },
];

const POL_CHANNELS = [
  { id: 'HH', label: 'Horizontal transmit / receive', desc: 'Co-polarized channel. Response depends on roughness, dielectric properties, incidence angle, and geometry; calm open water is often dark when specular.', color: 'var(--water)', mechanism: 'Co-pol' },
  { id: 'HV', label: 'Horizontal transmit / vertical receive', desc: 'Cross-polarized channel. Depolarization can reveal volume scattering from vegetation, though it is not a direct biomass measurement.', color: 'var(--accretion)', mechanism: 'Cross-pol' },
  { id: 'VV', label: 'Vertical transmit / receive', desc: 'Co-polarized channel with a response that differs from HH as incidence angle and surface properties change.', color: 'var(--pass)', mechanism: 'Co-pol' },
  { id: 'VH', label: 'Vertical transmit / horizontal receive', desc: 'Cross-polarized channel. For an ideal reciprocal monostatic target VH and HV are related, but practical products and modes vary.', color: '#E0B34A', mechanism: 'Cross-pol' },
];

const INSAR_STEPS = [
  { title: 'Acquire SAR Pair', desc: 'Use repeat-pass complex SAR acquisitions from a compatible orbit, polarization, and viewing geometry.', icon: <Satellite size={24} /> },
  { title: 'Co-registration', desc: 'Align the complex images to sub-pixel precision; residual misregistration degrades phase and coherence.', icon: <Target size={24} /> },
  { title: 'Interferogram', desc: 'Multiply one complex image by the conjugate of the other. Phase includes motion, topography, atmosphere, and noise.', icon: <Tornado size={24} /> },
  { title: 'Coherence & QC', desc: 'Estimate local phase consistency. Low coherence means phase is unreliable; it does not identify the cause of change by itself.', icon: <BarChart2 size={24} /> },
  { title: 'Unwrap Phase', desc: 'Resolve 2π phase ambiguities where signal quality and spatial continuity support a reliable solution.', icon: <TrendingUp size={24} /> },
  { title: 'Correct & Interpret', desc: 'Remove topographic and orbital contributions, assess atmospheric effects, then convert phase to line-of-sight displacement.', icon: <Map size={24} /> },
];

const NISAR_SPECS = [
  { param: 'Launch', value: 'July 30, 2025 (SDSC-SHAR)', icon: <Rocket size={24} /> },
  { param: 'Orbit', value: '747 km, Sun-synchronous', icon: <Globe size={24} /> },
  { param: 'Repeat Cycle', value: '12 days (exact repeat)', icon: <RefreshCw size={24} /> },
  { param: 'S-band (ISRO)', value: '3.2 GHz (λ ≈ 9.4 cm)', icon: <Satellite size={24} /> },
  { param: 'Antenna', value: '12 m deployable mesh reflector on 9 m boom', icon: <Ruler size={24} /> },
  { param: 'Mass', value: '~2,800 kg', icon: <Globe size={24} /> },
  { param: 'L-band (NASA)', value: '1.257 GHz (λ = 23.8 cm)', icon: <Radio size={24} /> },
  { param: 'Resolution', value: 'About 3–10 m (mode-dependent)', icon: <Search size={24} /> },
  { param: 'Swath Width', value: 'About 242 km (SweepSAR)', icon: <Ruler size={24} /> },
  { param: 'Polarization', value: 'Mode-dependent; dual-pol is common', icon: <Zap size={24} /> },
  { param: 'Data Volume', value: 'About 80 TB of data per day', icon: <Save size={24} /> },
  { param: 'Mission Life', value: '3-year baseline mission', icon: <Clock size={24} /> },
  { param: 'Partnership', value: 'NASA JPL + ISRO SAC', icon: <Handshake size={24} /> },
];

function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="glass-panel hover-lift" style={{ padding: 'var(--s5)', ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 'var(--s5)' }}>
      <h2 style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
      <p style={{ fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)', color: 'var(--text-2)', marginTop: 10, maxWidth: 1000, lineHeight: 1.65 }}>{subtitle}</p>
    </div>
  );
}

/* Footer reference pill — icon makes it unmistakably a live external link */
function SourceChip({ href, children }: { href: string; children: string }) {
  return (
    <a className="sar-lab__source" href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <ExternalLink size={11} aria-hidden="true" />
    </a>
  );
}



function FeatureRadarViewer() {
  const { reachId, pair } = useLabInputs();
  
  // Pane 1: Swipe
  const [sliderPos, setSliderPos] = useState(50);
  
  // Pane 2: Otsu
  const [otsuThresh, setOtsuThresh] = useState(60);
  const otsuCanvasRef = useRef(null);
  const [radarPixels, setRadarPixels] = useState(null);
  
  useEffect(() => {
    const img = new Image();
    img.src = analysisImage(reachId,'radar',pair[0]);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale down for performance
      const w = 400; const h = 300;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      setRadarPixels(ctx.getImageData(0, 0, w, h));
    };
  }, [reachId]);
  
  useEffect(() => {
    if (!otsuCanvasRef.current || !radarPixels) return;
    const canvas = otsuCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = 400; const h = 300;
    
    const outData = ctx.createImageData(w, h);
    const inData = radarPixels.data;
    
    for (let i = 0; i < inData.length; i += 4) {
      const brightness = inData[i];
      if (brightness < otsuThresh) {
        // Water
        outData.data[i] = 0;
        outData.data[i+1] = 0;
        outData.data[i+2] = 255;
        outData.data[i+3] = 255;
      } else {
        // Land
        outData.data[i] = 20;
        outData.data[i+1] = 20;
        outData.data[i+2] = 20;
        outData.data[i+3] = 255;
      }
    }
    ctx.putImageData(outData, 0, 0);
  }, [otsuThresh, radarPixels]);
  
  // Pane 3: Change Detection Scanner
  const changeCanvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [erosionEstimate, setErosionEstimate] = useState(null);
  const [reachAssessment, setReachAssessment] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadReachBundle(reachId).then(bundle => bundle.reach)
      .then(reach => { if (!cancelled) setReachAssessment(reach); })
      .catch(() => { if (!cancelled) setReachAssessment(null); });
    return () => { cancelled = true; };
  }, [reachId]);
  
  const runDiff = () => {
    if (isScanning) return;
    setIsScanning(true);
    setErosionEstimate(null);
    
    const img = new Image();
    img.src = analysisImage(reachId,'change',pair[0],pair);
    img.onload = () => {
      if (!changeCanvasRef.current) return;
      const canvas = changeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const w = 400; const h = 300;
      
      // Draw image to offscreen canvas to read pixels
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w; offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(img, 0, 0, w, h);
      const changeData = offCtx.getImageData(0, 0, w, h);
      
      // We will reveal it line by line
      let currentY = 0;
      const outData = ctx.createImageData(w, h);
      
      // Fill initial black background
      for(let i=0; i<outData.data.length; i+=4) {
         outData.data[i] = 10; outData.data[i+1] = 10; outData.data[i+2] = 10; outData.data[i+3] = 255;
      }
      
      const animate = () => {
        if (!changeCanvasRef.current) return;
        if (currentY >= h) {
          setIsScanning(false);
          loadReachBundle(reachId).then(bundle => bundle.manifest)
            .then(manifest => {
              const metric = manifest?.metrics?.find(item => item.id === 'erosion_area');
              if (metric && Number.isFinite(metric.value)) setErosionEstimate(metric);
            })
            .catch(() => setErosionEstimate(null));
          return;
        }
        
        // Process next 10 lines
        for (let y = currentY; y < currentY + 10 && y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = changeData.data[i];
            
            if (r > 180 && changeData.data[i+1] < 150) { // Exclude amber accretion geometry from the red erosion scan.
              outData.data[i] = 255; // Red
              outData.data[i+1] = 50; 
              outData.data[i+2] = 50;
            }
          }
        }
        
        ctx.putImageData(outData, 0, 0);
        
        // Draw scanner line
        ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
        ctx.fillRect(0, currentY + 10, w, 2);
        
        currentY += 10;
        requestAnimationFrame(animate);
      };
      animate();
    };
  };
  
  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="Change Detection Explorer" subtitle="Inspect paired HH backscatter and the classified change layer. Area comes from the geospatial product manifest, not the display image's pixel size." />
      <GlassCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s4)' }}>
          
          {/* Box 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', background: 'rgba(var(--fg-rgb), 0.02)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text)', textAlign: 'center' }}>1. HH Backscatter (display stretch)</div>
            <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: '4px', background: '#000', border: '1px solid #333' }}>
              <img src={analysisImage(reachId,'radar',pair[1])} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} alt="t1" />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}>
                <img src={analysisImage(reachId,'radar',pair[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="t0" />
              </div>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${sliderPos}% - 1px)`, width: 2, background: 'var(--water)', boxShadow: '0 0 10px var(--water)', pointerEvents: 'none' }} />
              <input type="range" min="0" max="100" value={sliderPos} onChange={e => setSliderPos(Number(e.target.value))} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', zIndex: 10 }} />
              
              <div className="hud-dark" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(var(--shadow-rgb), 0.8)', padding: '4px 8px', borderRadius: 4, fontSize: '0.86rem', border: '1px solid #555' }}>Aug 26 (t₀)</div>
              <div className="hud-dark" style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(var(--shadow-rgb), 0.8)', padding: '4px 8px', borderRadius: 4, fontSize: '0.86rem', border: '1px solid #555' }}>Sep 19 (t₁)</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-3)' }}>Drag to compare raw SAR images. Notice the dark areas (water) changing shape.</div>
          </div>

          {/* Box 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', background: 'rgba(var(--fg-rgb), 0.02)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,100,255,0.2)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--water)', textAlign: 'center' }}>2. Display Brightness Cutoff</div>
            <div style={{ height: 280, borderRadius: '4px', overflow: 'hidden', position: 'relative', background: '#000', border: '1px solid rgba(0,100,255,0.3)' }}>
              <canvas ref={otsuCanvasRef} width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="hud-dark" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(var(--shadow-rgb), 0.8)', padding: 'var(--s3)', borderTop: '1px solid rgba(0,100,255,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>8-bit display brightness cutoff</span>
                  <span>{otsuThresh}</span>
                </div>
                <input type="range" min="10" max="150" value={otsuThresh} onChange={e => setOtsuThresh(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--water)' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-3)' }}>A visual demo on a stretched PNG; this is not calibrated σ⁰ or the production classifier.</div>
          </div>
          
          {/* Box 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', background: 'rgba(var(--fg-rgb), 0.02)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(255,50,50,0.2)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f44', textAlign: 'center' }}>3. Change Map Scan</div>
            <div style={{ height: 280, borderRadius: '4px', overflow: 'hidden', position: 'relative', background: '#000', border: '1px solid rgba(255,50,50,0.3)' }}>
              <canvas ref={changeCanvasRef} width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
            {!isScanning && erosionEstimate == null && (
                 <img src={analysisImage(reachId,'change',pair[0],pair)} style={{ position: 'absolute', top:0, left:0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.1 }} />
              )}
              
            </div>
            {erosionEstimate && (
              <div style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', background: 'rgba(var(--shadow-rgb), 0.42)', border: '1px solid rgba(255,80,80,.28)' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginBottom: 3 }}>Mapped land → water area · manifest value</div>
                <div style={{ color: '#ff7a72', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-num)' }}>{Number(erosionEstimate.value).toLocaleString()} ha <span style={{ color: 'var(--text-3)', fontSize: '0.76rem', fontFamily: 'inherit' }}>derived area</span></div>
                {Number.isFinite(erosionEstimate.low) && Number.isFinite(erosionEstimate.high) && <div style={{ color: 'var(--text-3)', fontSize: '0.76rem', marginTop: 2 }}>Threshold-sensitivity envelope: {Number(erosionEstimate.low).toLocaleString()}–{Number(erosionEstimate.high).toLocaleString()} ha</div>}
                {reachAssessment?.verdict === 'INCONCLUSIVE' && <div style={{ marginTop: 'var(--s2)', paddingTop: 'var(--s2)', borderTop: '1px solid rgba(255,255,255,.14)', color: '#ffd38b', fontSize: '0.8rem', lineHeight: 1.45 }}><strong>INCONCLUSIVE</strong> · {reachAssessment.verdict_reasons.join(" ")}</div>}
              </div>
            )}
            <button onClick={runDiff} disabled={isScanning} style={{ alignSelf: 'center', padding: '9px 20px', background: isScanning ? 'rgba(var(--fg-rgb), .04)' : 'rgba(255,50,50,0.12)', border: `1px solid ${isScanning ? 'var(--glass-border)' : '#f44'}`, color: isScanning ? 'var(--text-3)' : '#ff7a72', borderRadius: 'var(--r-md)', cursor: isScanning ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {isScanning ? 'SCANNING MAP…' : erosionEstimate ? 'REPLAY MAP SCAN' : 'SCAN CHANGE MAP'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.5 }}>The scan animates the computed land-to-water mask. Area comes from pixel counts on the source 30 m grid, not from this display image.</div>
          </div>
          
        </div>
      </GlassCard>
    </div>
  );
}

function FeaturePipelineWalkthrough() {
  const steps = [
    { title: "Display Backscatter", desc: "Calibrated Sentinel-1 RTC VV, rendered to PNG" },
    { title: "Tile QC + Threshold", desc: "Otsu on eligible samples" },
    { title: "Binary Mask", desc: "Land = white, Water = black" },
    { title: "Median Filter", desc: "Remove speckle holes (5×5)" },
    { title: "HAND Screen", desc: "Exclude HAND > 15 m" },
    { title: "Water-mask Comparison", desc: "Compare t₀ and t₁ masks; then check stage and persistence QC" },
    { title: "Polygonization", desc: "Extract connected components" },
    { title: "Change Candidate Map", desc: "Candidate transitions; confirm only after QC and validation" }
  ];
  return (
    <div id="pipeline" className="sar-section">
      <SectionTitle title="Water Classification Pipeline" subtitle="Follow the processing chain used for the Jamuna case study. The current two-date land-to-water result is inconclusive; a mapped transition is not automatically confirmed erosion." />
      <GlassCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)', justifyContent: 'center' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: 'var(--s3)', background: 'rgba(var(--fg-rgb), 0.05)', borderRadius: 'var(--r-md)', width: 140, border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--water)', marginBottom: 4, fontWeight: 'bold' }}>Step {i+1}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{step.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 4 }}>{step.desc}</div>
              </div>
              {i < steps.length - 1 && <div style={{ color: 'var(--water)', margin: '0 8px' }}>→</div>}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function FeatureSARvsOptical() {
  const [cloudDensity, setCloudDensity] = useState(85);
  const { radarUrl, waterUrl, changeUrl } = useLabInputs();
  
  // Animate the sweeping radar beam
  const [beamPos, setBeamPos] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setBeamPos(prev => (prev + 0.8) % 100), 60);
    return () => window.clearInterval(timer);
  }, []);
  
  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="SAR and Optical in Cloudy Conditions" subtitle="Microwave SAR can collect through most clouds and without sunlight. Optical imagery still adds valuable land-cover context when skies are clear." />
      
      <GlassCard style={{ padding: 'var(--s5)' }}>
        
        {/* Interactive Cloud Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', marginBottom: 'var(--s5)', background: 'rgba(var(--fg-rgb), 0.05)', padding: 'var(--s4)', borderRadius: 'var(--r-md)' }}>
          <div style={{ width: '40px', fontSize: '1.5rem', textAlign: 'center' }}>{cloudDensity > 50 ? '☁️' : '🌤️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 'bold' }}>ATMOSPHERIC CLOUD DENSITY (Monsoon Simulation)</span>
              <span style={{ fontSize: '1rem', color: cloudDensity > 75 ? '#f44' : '#0ff', fontWeight: 'bold', fontFamily: 'var(--font-num)' }}>{cloudDensity}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={cloudDensity} 
              onChange={e => setCloudDensity(Number(e.target.value))} 
              style={{ width: '100%', accentColor: cloudDensity > 75 ? '#f44' : '#0ff', cursor: 'ew-resize' }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
          
          {/* OPTICAL SATELLITE PANE */}
          <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid rgba(255,100,100,0.3)', position: 'relative', height: '350px' }}>
            {/* Stylized overhead floodplain scene keeps this cloud comparison illustrative. */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: 'linear-gradient(rgba(18, 28, 22, 0.12), rgba(18, 28, 22, 0.12)), url("/optical-satellite-scene.svg")',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }} />
            
            {/* Procedural Cloud Layer */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '200%', height: '200%',
              background: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27clouds%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.01%27 numOctaves=%274%27 seed=%275%27/%3E%3CfeColorMatrix type=%27matrix%27 values=%271 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23clouds)%27 opacity=%271%27/%3E%3C/svg%3E")',
              opacity: cloudDensity / 100,
              transform: `translate(-${beamPos / 4}%, -${beamPos / 8}%)`, // slow drift
              pointerEvents: 'none'
            }} />
            
            {/* UI Overlay */}
            <div className="hud-dark" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(var(--shadow-rgb), 0.7)', padding: '4px 8px', borderRadius: '4px', color: '#f44', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #f44' }}>
              ILLUSTRATIVE OPTICAL SATELLITE VIEW
            </div>
            
            {cloudDensity > 60 && (
              <div className="hud-dark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(var(--shadow-rgb), 0.8)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '2px solid #f44', textAlign: 'center', width: '80%' }}>
                <div style={{ color: '#f44', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: 2, marginBottom: 8 }}>SURFACE OBSCURED</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Thick cloud can block visible and near-infrared views of the surface.</div>
              </div>
            )}
            
            <div className="hud-dark" style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(var(--shadow-rgb), 0.8)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--fg-rgb), 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem', marginBottom: 4 }}>
                <span>WAVELENGTH:</span><span style={{ color: 'var(--text)' }}>400-900 nm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem', marginBottom: 4 }}>
                <span>CLOUD EFFECT:</span><span style={{ color: '#f44', fontWeight: 'bold' }}>Can obscure the surface</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem' }}>
                <span>OBSERVABILITY:</span><span style={{ color: '#f44', fontWeight: 'bold' }}>Depends on cloud conditions</span>
              </div>
            </div>
          </div>
          
          {/* SAR RADAR PANE */}
          <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid rgba(0,255,255,0.3)', position: 'relative', height: '350px' }}>
            {/* Base Image (Real Radar) */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: `url(${radarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'contrast(1.2)'
            }} />
            
            {/* Radar Sweep Effect */}
            <div style={{
              position: 'absolute', top: 0, left: `${beamPos}%`, width: '100px', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.1) 80%, rgba(0,255,255,0.8) 100%)',
              borderRight: '2px solid #0ff',
              boxShadow: '0 0 20px rgba(0,255,255,0.5)',
              pointerEvents: 'none'
            }} />
            
            {/* Grid Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
            
            {/* UI Overlay */}
            <div className="hud-dark" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(var(--shadow-rgb), 0.7)', padding: '4px 8px', borderRadius: '4px', color: '#0ff', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid #0ff' }}>
              L-BAND SAR (NISAR)
            </div>
            
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%', pointerEvents: 'none' }}>
              <div style={{ color: 'rgba(0,255,255,0.15)', fontWeight: '900', fontSize: '3rem', letterSpacing: 5 }}>ACTIVE</div>
            </div>
            
            <div className="hud-dark" style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(var(--shadow-rgb), 0.8)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,255,255,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem', marginBottom: 4 }}>
                <span>WAVELENGTH:</span><span style={{ color: 'var(--text)' }}>23.8 cm (L-Band)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem', marginBottom: 4 }}>
                <span>CLOUD EFFECT:</span><span style={{ color: '#0ff', fontWeight: 'bold' }}>Most clouds weakly affect microwaves</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.86rem' }}>
                <span>OBSERVABILITY:</span><span style={{ color: '#0ff', fontWeight: 'bold' }}>Day / night, cloud tolerant</span>
              </div>
            </div>
          </div>
          
        </div>
      </GlassCard>
    </div>
  );
}

const FLOOD_SCENARIOS = {
  open: {
    label: 'Open floodplain',
    mechanism: 'Specular surface reflection',
    description: 'Smooth open water often reflects energy away from a side-looking radar, so the co-pol return can drop. Wind-roughened water can return more energy and weaken this simple cue.',
    hh: 'Often lower over smooth water; may brighten as wind roughens it',
    hv: 'Usually weak over smooth water; roughness and mixed pixels matter',
  },
  crops: {
    label: 'Crops / emergent plants',
    mechanism: 'Surface, volume, and possible double-bounce',
    description: 'Stems over water can create a trunk–water-like double-bounce path. Crop height, spacing, growth stage, partial flooding, and viewing geometry can change or hide that response.',
    hh: 'May rise where vertical stems meet standing water',
    hv: 'Can respond to canopy volume; no fixed flood direction',
  },
  woody: {
    label: 'Woody vegetation',
    mechanism: 'Canopy volume + possible trunk–water double-bounce',
    description: 'At L-band, a flooded woody stand can produce a stronger HH return from trunk–water double-bounce. Canopy structure and moisture affect the signal, so this is a clue to test, not proof of flooding.',
    hh: 'Can rise in flooded woody stands through double-bounce',
    hv: 'Can stay strong from canopy volume; not flood-specific',
  },
} as const;

function FeatureFloodMechanisms() {
  const [cover, setCover] = useState<keyof typeof FLOOD_SCENARIOS>('woody');
  const [flooded, setFlooded] = useState(true);
  const [wind, setWind] = useState(20);
  const scenario = FLOOD_SCENARIOS[cover];
  const openWaterWindNote = cover === 'open' && wind >= 65;

  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle
        title="Flood Signal Mechanism Simulator"
        subtitle="Explore why inundation can darken smooth open water yet brighten some flooded vegetation in L-band HH. Choose a land cover and toggle water to see the scattering path and interpretation change."
      />
      <GlassCard>
        <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', marginBottom: 'var(--s4)' }} role="group" aria-label="Select land cover">
          {(Object.entries(FLOOD_SCENARIOS) as [keyof typeof FLOOD_SCENARIOS, typeof FLOOD_SCENARIOS[keyof typeof FLOOD_SCENARIOS]][]).map(([id, item]) => (
            <button key={id} onClick={() => setCover(id)} aria-pressed={cover === id} style={{
              flex: '1 1 170px', padding: '0.8rem 1rem', borderRadius: 'var(--r-md)',
              border: `1px solid ${cover === id ? 'var(--water)' : 'var(--glass-border)'}`,
              background: cover === id ? 'rgba(var(--water-rgb), 0.11)' : 'rgba(var(--fg-rgb), 0.025)',
              color: cover === id ? 'var(--water)' : 'var(--text-2)', fontWeight: 700, cursor: 'pointer'
            }}>{item.label}</button>
          ))}
        </div>

        <div className="sar-flood-sim-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(260px, 0.75fr)', gap: 'var(--s4)', alignItems: 'stretch' }}>
          <div style={{ minWidth: 0, border: '1px solid rgba(var(--water-rgb), 0.16)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'linear-gradient(180deg, #081322 0%, #102033 68%, #392d20 68%, #201b17 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '0.8rem 1rem', borderBottom: '1px solid rgba(var(--water-rgb), 0.14)' }}>
              <span style={{ color: 'var(--text-2)', fontSize: '0.84rem', fontWeight: 700 }}>SIDE-LOOKING L-BAND VIEW · SCHEMATIC</span>
              <button onClick={() => setFlooded(value => !value)} aria-pressed={flooded} style={{
                padding: '0.5rem 0.8rem', borderRadius: 999, border: `1px solid ${flooded ? 'var(--water)' : 'var(--glass-border)'}`,
                background: flooded ? 'rgba(var(--water-rgb), 0.12)' : 'rgba(var(--fg-rgb), 0.04)',
                color: flooded ? 'var(--water)' : 'var(--text-2)', fontWeight: 700, cursor: 'pointer'
              }}>{flooded ? 'Standing water · ON' : 'Standing water · OFF'}</button>
            </div>
            <svg viewBox="0 0 760 300" role="img" aria-label={`${scenario.label}, ${flooded ? 'flooded' : 'not flooded'}: conceptual side-looking SAR scattering diagram`} style={{ display: 'block', width: '100%', height: 'auto', minHeight: 190 }}>
              <defs>
                <marker id="flood-ray-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#26e6e6" /></marker>
                <marker id="flood-volume-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#b8f08a" /></marker>
                <pattern id="flood-ground-lines" width="34" height="18" patternUnits="userSpaceOnUse"><path d="M0 16H34" stroke="#a28a62" strokeOpacity=".24" strokeWidth="1" /></pattern>
              </defs>
              <rect x="0" y="236" width="760" height="64" fill="#514331" />
              <rect x="0" y="236" width="760" height="64" fill="url(#flood-ground-lines)" />
              {flooded && <path d="M0 219 Q160 214 310 219 T610 218 Q690 217 760 220 V250 H0Z" fill="#276f85" fillOpacity=".8" stroke="#55c8d4" strokeOpacity=".7" strokeWidth="2" />}

              {cover === 'woody' && [300, 380, 470, 565, 650].map((x, i) => (
                <g key={x}>
                  <path d={`M${x} 236 L${x} ${flooded ? 160 + (i % 2) * 10 : 150 + (i % 2) * 10}`} stroke="#9d7550" strokeWidth={i % 2 ? 8 : 11} />
                  <circle cx={x} cy={flooded ? 139 + (i % 2) * 10 : 129 + (i % 2) * 10} r={29 + (i % 3) * 5} fill={i % 2 ? '#567a4f' : '#648357'} stroke="#8aa878" strokeOpacity=".45" strokeWidth="2" />
                  <circle cx={x - 10} cy={flooded ? 135 + (i % 2) * 10 : 125 + (i % 2) * 10} r="12" fill="#769461" fillOpacity=".7" />
                </g>
              ))}
              {cover === 'crops' && Array.from({ length: 12 }, (_, i) => {
                const x = 295 + i * 34;
                const top = 172 + (i % 3) * 12;
                return <g key={x} stroke="#8eb66b" strokeWidth="4" strokeLinecap="round"><path d={`M${x} 236V${top}`} /><path d={`M${x} ${top + 20}l-10 -8m10 20 10 -8`} strokeWidth="2" /></g>;
              })}
              {cover === 'open' && !flooded && <path d="M0 235 Q155 232 300 236 T600 234 T760 236" fill="none" stroke="#9a8b68" strokeWidth="5" strokeDasharray="12 12" />}

              <g aria-hidden="true">
                <rect x="74" y="37" width="64" height="28" rx="6" fill="#b9d6df" stroke="#43e2e3" strokeWidth="2" />
                <path d="M106 65V79M78 40 49 30V71L78 62M134 40 163 30V71L134 62" fill="#236a83" stroke="#43e2e3" strokeWidth="2" />
                <text x="106" y="55" fill="#06202a" fontSize="12" fontWeight="700" textAnchor="middle">NISAR</text>
                <text x="57" y="101" fill="#a7d7df" fontSize="12">L-band · 23.8 cm</text>
              </g>

              {cover === 'open' ? (
                <>
                  <path d={flooded ? 'M144 82 L345 218 L559 87' : 'M144 82 L340 235 L555 96'} fill="none" stroke="#26e6e6" strokeWidth="3" markerEnd="url(#flood-ray-arrow)" className="sar-flood-ray" />
                  <text x="475" y="113" fill="#d4f9fa" fontSize="13">specular reflection away</text>
                </>
              ) : flooded ? (
                <>
                  <path d="M144 82 L416 178 L416 219 L151 91" fill="none" stroke="#26e6e6" strokeWidth="3" markerEnd="url(#flood-ray-arrow)" className="sar-flood-ray" />
                  <text x="436" y="213" fill="#d4f9fa" fontSize="13">double-bounce path</text>
                  {cover === 'woody' && [325, 470, 610].map(x => <path key={x} d={`M${x} 182 l22 -24`} stroke="#b8f08a" strokeWidth="2" markerEnd="url(#flood-volume-arrow)" opacity=".8" />)}
                  {cover === 'crops' && [350, 470, 590].map(x => <path key={x} d={`M${x} 187 l18 -26`} stroke="#b8f08a" strokeWidth="2" markerEnd="url(#flood-volume-arrow)" opacity=".75" />)}
                </>
              ) : (
                <>
                  <path d="M144 82 L370 163 L565 100" fill="none" stroke="#26e6e6" strokeWidth="3" markerEnd="url(#flood-ray-arrow)" className="sar-flood-ray" />
                  <text x="462" y="120" fill="#d4f9fa" fontSize="13">no water surface beneath canopy</text>
                </>
              )}
              <text x="24" y="280" fill="#d9c9a1" fontSize="12">GROUND PROFILE</text>
            </svg>
            <div style={{ padding: '0.65rem 1rem', color: 'var(--text-3)', fontSize: '0.78rem', borderTop: '1px solid rgba(var(--water-rgb), 0.12)' }}>Arrows show possible interaction paths only; drawing is not to scale and does not simulate calibrated backscatter.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }} aria-live="polite">
            <div style={{ padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--water-rgb), 0.18)', background: 'rgba(var(--water-rgb), 0.045)' }}>
              <div style={{ color: 'var(--water)', fontSize: '0.76rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Dominant possible mechanism</div>
              <h3 style={{ margin: '0.45rem 0', fontSize: '1.1rem' }}>{scenario.mechanism}</h3>
              <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.55 }}>{scenario.description}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s2)' }}>
              <div style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', background: 'rgba(var(--fg-rgb), 0.035)', border: '1px solid rgba(var(--fg-rgb), 0.08)' }}>
                <strong style={{ color: 'var(--water)', fontSize: '1.1rem' }}>HH · co-pol</strong>
                <div style={{ marginTop: 6, color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.45 }}>{openWaterWindNote ? 'Strong wind can roughen water and raise the return; darkness is less reliable.' : scenario.hh}</div>
              </div>
              <div style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', background: 'rgba(var(--fg-rgb), 0.035)', border: '1px solid rgba(var(--fg-rgb), 0.08)' }}>
                <strong style={{ color: 'var(--pass)', fontSize: '1.1rem' }}>HV · cross-pol</strong>
                <div style={{ marginTop: 6, color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.45 }}>{scenario.hv}</div>
              </div>
            </div>
            {cover === 'open' && (
              <label style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', background: 'rgba(var(--fg-rgb), 0.035)' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.84rem', fontWeight: 700, marginBottom: 6 }}><span>Wind-roughening example</span><span>{wind}%</span></span>
                <input aria-label="Wind roughening example" type="range" min="0" max="100" value={wind} onChange={e => setWind(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--water)' }} />
                <span style={{ color: 'var(--text-3)', fontSize: '0.76rem' }}>Conceptual control; not a wind-speed estimate.</span>
              </label>
            )}
            <div style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--warn)', background: 'rgba(224,179,74,0.06)', color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              A single bright or dark pixel cannot confirm flooding. Interpret change with land cover, incidence angle, wind, topography, multi-date evidence, and validation. This teaching simulation does not use or alter the Jamuna measurements.
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function FeatureSpeckleFilter() {
  const [windowSize, setWindowSize] = useState(7);
  const [noiseLevel, setNoiseLevel] = useState(2); // L looks
  const [sliderPos, setSliderPos] = useState(50);
  
  const rawCanvasRef = useRef(null);
  const filteredCanvasRef = useRef(null);
  
  const [baseTruth, setBaseTruth] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calcTime, setCalcTime] = useState(0);

  // Load real image snippet
  useEffect(() => {
    const w = 600; const h = 400;
    const scene = document.createElement('canvas'); scene.width = w; scene.height = h;
    const ctx = scene.getContext('2d');
    ctx.fillStyle = '#777'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#a0a0a0'; ctx.fillRect(0, 0, 285, h);
    ctx.fillStyle = '#626262'; ctx.beginPath(); ctx.moveTo(285, 0); ctx.bezierCurveTo(350, 110, 225, 190, 320, 280); ctx.bezierCurveTo(390, 340, 285, 360, 310, 400); ctx.lineTo(425, 400); ctx.bezierCurveTo(390, 320, 480, 260, 382, 190); ctx.bezierCurveTo(320, 130, 435, 80, 380, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#929292'; [[440,35,120,100],[455,175,100,75],[435,295,135,80],[40,45,100,95],[55,260,120,90]].forEach(([x,y,ww,hh])=>ctx.fillRect(x,y,ww,hh));
    const image = ctx.getImageData(0, 0, w, h);
    setBaseTruth(image);
  }, []);

  // Process Noise and Filter
  useEffect(() => {
    if (!baseTruth || !rawCanvasRef.current || !filteredCanvasRef.current) return;
    
    setIsProcessing(true);
    const startTime = performance.now();
    
    // setTimeout allows UI to paint the "Processing" state before heavy CPU blocks thread
    setTimeout(() => {
      const w = 600; const h = 400;
      const rawCtx = rawCanvasRef.current.getContext('2d');
      const filteredCtx = filteredCanvasRef.current.getContext('2d');
      
      const truth = baseTruth.data;
      const noisy = new Float32Array(w * h);
      const rawImg = rawCtx.createImageData(w, h);
      
      // 1. Inject Multiplicative Gamma Noise (Simulate raw SLC data)
      for(let i=0; i<w*h; i++) {
        const truthVal = truth[i*4]; // Grayscale
        let noise = 0;
        for(let k=0; k<noiseLevel; k++) {
          // Box-Muller transform for Gaussian
          const u1 = Math.random() || 0.0001; const u2 = Math.random();
          const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
          noise += z0*z0 + z1*z1; // Chi-square -> Gamma
        }
        noise = noise / (2.0 * noiseLevel);
        
        // Mean-one Gamma multiplier: preserves expected intensity before display clipping.
        noisy[i] = Math.min(255, truthVal * noise);
        
        rawImg.data[i*4] = noisy[i];
        rawImg.data[i*4+1] = noisy[i];
        rawImg.data[i*4+2] = noisy[i];
        rawImg.data[i*4+3] = 255;
      }
      rawCtx.putImageData(rawImg, 0, 0);
      
      // 2. Apply Lee-Sigma Filter (Adaptive spatial filter)
      const filtered = new Float32Array(w * h);
      const filImg = filteredCtx.createImageData(w, h);
      const half = Math.floor(windowSize / 2);
      const noiseVar = 1.0 / noiseLevel;
      
      for(let y=0; y<h; y++) {
        for(let x=0; x<w; x++) {
          let sum = 0; let sumSq = 0; let count = 0;
          
          // Local window statistics
          for(let wy = -half; wy <= half; wy++) {
            for(let wx = -half; wx <= half; wx++) {
              const ny = y + wy; const nx = x + wx;
              if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                const val = noisy[ny*w + nx];
                sum += val; sumSq += val*val; count++;
              }
            }
          }
          
          const mean = sum / count;
          const variance = (sumSq / count) - (mean * mean);
          
          // Lee filter weights
          const varX = Math.max(0, variance - noiseVar * mean * mean);
          const W = varX / (variance + 0.00001);
          
          filtered[y*w + x] = mean + W * (noisy[y*w + x] - mean);
          const fval = Math.min(255, Math.max(0, filtered[y*w + x]));
          
          filImg.data[(y*w + x)*4] = fval;
          filImg.data[(y*w + x)*4+1] = fval;
          filImg.data[(y*w + x)*4+2] = fval;
          filImg.data[(y*w + x)*4+3] = 255;
        }
      }
      filteredCtx.putImageData(filImg, 0, 0);
      
      setCalcTime(Math.round(performance.now() - startTime));
      setIsProcessing(false);
    }, 20);
    
  }, [baseTruth, windowSize, noiseLevel]);

  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="Speckle Statistics & Lee Filtering Lab" subtitle="Start from a known synthetic intensity scene, add mean-one Gamma speckle for the selected number of looks, then compare a local Lee estimate. This does not simulate complex SLC phase or the production pipeline filter." />
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Interactive Viewer Area */}
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#000', cursor: 'ew-resize' }}>
          
          {/* Base Layer: Raw Noisy SAR */}
          <canvas ref={rawCanvasRef} width={600} height={400} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
          
          {/* Top Layer: Filtered SAR with Clip Path */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}>
            <canvas ref={filteredCanvasRef} width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          {/* Slider Separator */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${sliderPos}% - 2px)`, width: 4, background: 'var(--water)', boxShadow: '0 0 15px var(--water)', zIndex: 10, pointerEvents: 'none' }}>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 40, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(var(--shadow-rgb), 0.5)' }}>
                <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>||</span>
             </div>
          </div>
          
          <input type="range" min="0" max="100" value={sliderPos} onChange={e => setSliderPos(Number(e.target.value))} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 20, cursor: 'ew-resize' }} />
          
          {/* HUD Labels */}
          <div className="hud-dark" style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(var(--shadow-rgb), 0.8)', padding: '6px 12px', borderRadius: 6, fontSize: '0.92rem', border: '1px solid rgba(0,255,255,0.3)', color: '#0ff', zIndex: 5, backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>FILTERED OUTPUT</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Simple Lee filter • illustrative</div>
          </div>
          
          <div className="hud-dark" style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(var(--shadow-rgb), 0.8)', padding: '6px 12px', borderRadius: 6, fontSize: '0.92rem', border: '1px solid rgba(255,50,50,0.3)', color: '#f44', zIndex: 5, backdropFilter: 'blur(4px)', pointerEvents: 'none', textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 2 }}>SIMULATED INTENSITY IMAGE</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Synthetic intensity input (L = {noiseLevel})</div>
          </div>
          
          {/* Loading / Processing Indicator */}
          {isProcessing && (
            <div className="hud-dark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(var(--shadow-rgb), 0.8)', padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: '1px solid var(--water)', color: 'var(--water)', fontWeight: 'bold', zIndex: 30, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="spinner" style={{ width: 20, height: 20, border: '3px solid var(--water)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              COMPUTING MATRICES...
            </div>
          )}
        </div>
        
        {/* Control Panel */}
        <div style={{ padding: 'var(--s4)', background: 'var(--surface)', borderTop: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--s6)' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-2)', fontWeight: 'bold' }}>Spatial Window Size</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontFamily: 'var(--font-num)' }}>{windowSize}×{windowSize} px</span>
              </div>
              <input type="range" min="3" max="15" step="2" value={windowSize} onChange={e => setWindowSize(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--water)', marginBottom: 8 }} />
              <div style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>Larger windows produce smoother results but blur crucial high-frequency edges (like riverbanks).</div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-2)', fontWeight: 'bold' }}>Independent looks (L)</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontFamily: 'var(--font-num)' }}>L = {noiseLevel}</span>
              </div>
              <input type="range" min="1" max="16" step="1" value={noiseLevel} onChange={e => setNoiseLevel(Number(e.target.value))} style={{ width: '100%', accentColor: '#f44', marginBottom: 8 }} />
              <div style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>For the ideal mean-one Gamma intensity model, CV = 1/√L = {(1 / Math.sqrt(noiseLevel)).toFixed(2)}. This is the input looks parameter, not a measured post-filter ENL.</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(var(--fg-rgb), 0.03)', padding: 'var(--s3)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(var(--fg-rgb), 0.1)' }}>
               <div style={{ fontSize: '0.86rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Filter Performance</div>
               <div style={{ fontSize: '1.2rem', color: '#0ff', fontWeight: 'bold', fontFamily: 'var(--font-num)' }}>{calcTime} ms</div>
               <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 4 }}>Measured locally over a 600 × 400 pixel illustrative image.</div>
            </div>
            
          </div>
        </div>
      </GlassCard>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function FeatureRadarGeometry() {
  const [incAngle, setIncAngle] = useState(45); // degrees
  
  // Convert degrees to radians
  const theta = (incAngle * Math.PI) / 180;
  
  // Satellite Y is fixed
  const satY = 40;
  // Center of the scene is X=500, Y=250
  // incidence angle theta = atan((satX - 500) / (250 - satY))
  // Therefore satX = 500 + (250 - satY) * tan(theta)
  const satX = 500 + (250 - satY) * Math.tan(theta);
  
  // Mountain coordinates
  const M_LEFT = 300;
  const M_PEAK_X = 400;
  const M_PEAK_Y = 100;
  const M_RIGHT = 500;
  const GROUND_Y = 250;
  
  // Distance from satellite to Peak
  const distPeak = Math.sqrt(Math.pow(satX - M_PEAK_X, 2) + Math.pow(satY - M_PEAK_Y, 2));
  // Distance from satellite to Left Base
  const distLeft = Math.sqrt(Math.pow(satX - M_LEFT, 2) + Math.pow(satY - GROUND_Y, 2));
  
  // Determine if Layover or Foreshortening
  // Layover occurs when the peak is closer to the radar than the base
  const isLayover = distPeak < distLeft;
  
  // Shadow Calculation
  // Radar beam passes through satellite and peak. Where does it hit the ground behind the mountain?
  // Slope of beam (dx/dy to avoid inf)
  const dx = M_PEAK_X - satX;
  const dy = M_PEAK_Y - satY;
  
  // Find where beam hits Y=250 (GROUND_Y)
  // (x_intersect - M_PEAK_X) / dx = (GROUND_Y - M_PEAK_Y) / dy
  const shadowEndX = M_PEAK_X + dx * ((GROUND_Y - M_PEAK_Y) / dy);
  
  // Limit shadow end to the left side (it's pointing left)
  const actualShadowEnd = Math.max(0, Math.min(shadowEndX, M_LEFT));

  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="Radar Geometry Cross-Section" subtitle="Interactive physics simulation of SAR geometric distortions. Adjust the satellite's incidence angle to see Layover, Foreshortening, and Shadow dynamically change." />
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        
        <div style={{ position: 'relative', width: '100%', height: 350, background: 'linear-gradient(180deg, #050a15 0%, #111 100%)' }}>
          
          <svg width="100%" height="100%" viewBox="0 0 1000 350" preserveAspectRatio="xMidYMid slice">
             {/* Grid */}
             <g stroke="rgba(var(--fg-rgb), 0.05)" strokeWidth="1">
               {Array.from({length: 10}).map((_,i) => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="350" />)}
               {Array.from({length: 4}).map((_,i) => <line key={`h${i}`} x1="0" y1={i*100} x2="1000" y2={i*100} />)}
             </g>

             {/* Background Mountains */}
             <path d={`M 600 ${GROUND_Y} L 750 150 L 900 ${GROUND_Y} Z`} fill="#1a1a1a" />
             
             {/* Main Terrain Base */}
             <path d={`M 0 ${GROUND_Y} L ${M_LEFT} ${GROUND_Y} L ${M_PEAK_X} ${M_PEAK_Y} L ${M_RIGHT} ${GROUND_Y} L 1000 ${GROUND_Y} L 1000 350 L 0 350 Z`} fill="#2a2a2a" />
             
             {/* Radar Beams */}
             <g stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1.5" strokeDasharray="5,5">
                <line x1={satX} y1={satY} x2={M_RIGHT} y2={GROUND_Y} />
                <line x1={satX} y1={satY} x2={M_PEAK_X} y2={M_PEAK_Y} />
                <line x1={satX} y1={satY} x2={M_LEFT} y2={GROUND_Y} />
                <line x1={satX} y1={satY} x2={shadowEndX} y2={GROUND_Y} />
             </g>
             
             {/* Dynamic Highlight: Foreshortening/Layover */}
             <path d={`M ${M_LEFT} ${GROUND_Y} L ${M_PEAK_X} ${M_PEAK_Y}`} stroke={isLayover ? "#f44" : "#fa0"} strokeWidth="5" />
             
             {/* Dynamic Highlight: Shadow */}
             <path 
                d={shadowEndX < M_LEFT 
                  ? `M ${M_PEAK_X} ${M_PEAK_Y} L ${M_LEFT} ${GROUND_Y} L ${shadowEndX} ${GROUND_Y}` 
                  : `M ${M_PEAK_X} ${M_PEAK_Y} L ${shadowEndX} ${GROUND_Y}`} 
                fill="rgba(var(--shadow-rgb), 0.7)" 
             />
             <path 
                d={shadowEndX < M_LEFT 
                  ? `M ${M_PEAK_X} ${M_PEAK_Y} L ${M_LEFT} ${GROUND_Y} L ${shadowEndX} ${GROUND_Y}` 
                  : `M ${M_PEAK_X} ${M_PEAK_Y} L ${shadowEndX} ${GROUND_Y}`} 
                stroke="#555" strokeWidth="4" fill="none"
             />
             
             {/* Satellite */}
             <circle cx={satX} cy={satY} r="12" fill="#0ff" />
             <path d={`M ${satX-15} ${satY-10} L ${satX-25} ${satY-25} L ${satX-15} ${satY-35} L ${satX-5} ${satY-25} Z`} fill="#0aa" />
             <path d={`M ${satX+15} ${satY+10} L ${satX+25} ${satY+25} L ${satX+15} ${satY+35} L ${satX+5} ${satY+25} Z`} fill="#0aa" />
             
             {/* Labels */}
             <text x={satX} y={satY - 25} fill="#0ff" fontSize="14" fontWeight="bold" textAnchor="middle">SATELLITE</text>
             
             {/* Distance Rings (arcs) from satellite */}
             <g stroke="rgba(0,255,255,0.1)" strokeWidth="2" fill="none">
               <circle cx={satX} cy={satY} r={distPeak} />
               <circle cx={satX} cy={satY} r={distLeft} />
             </g>
          </svg>
          
          {/* Dynamic HUD Overlays */}
          <div style={{ position: 'absolute', top: 120, left: M_PEAK_X - 180, pointerEvents: 'none' }}>
            <div style={{ background: isLayover ? 'rgba(255,0,0,0.2)' : 'rgba(255,170,0,0.2)', border: `1px solid ${isLayover ? '#f44' : '#fa0'}`, padding: '4px 8px', borderRadius: 4, color: isLayover ? '#f44' : '#fa0', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              {isLayover ? "LAYOVER (Fold-over)" : "FORESHORTENING"}
            </div>
            {isLayover && (
              <div className="hud-dark" style={{ fontSize: '0.78rem', color: '#f44', marginTop: 4, background: 'rgba(var(--shadow-rgb), 0.8)', padding: 4, borderRadius: 4, width: 150 }}>
                Mountain peak is closer to radar ({Math.round(distPeak)}m) than the base ({Math.round(distLeft)}m). Top is mapped BEFORE bottom!
              </div>
            )}
            {!isLayover && (
              <div className="hud-dark" style={{ fontSize: '0.78rem', color: '#fa0', marginTop: 4, background: 'rgba(var(--shadow-rgb), 0.8)', padding: 4, borderRadius: 4, width: 150 }}>
                Slope is compressed in radar imagery.
              </div>
            )}
          </div>
          
          <div style={{ position: 'absolute', top: Math.max(120, M_PEAK_Y + 50), left: M_PEAK_X + 20, pointerEvents: 'none' }}>
            <div className="hud-dark" style={{ background: 'rgba(var(--shadow-rgb), 0.8)', border: '1px solid #555', padding: '4px 8px', borderRadius: 4, color: '#aaa', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              RADAR SHADOW
            </div>
            <div className="hud-dark" style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, background: 'rgba(var(--shadow-rgb), 0.8)', padding: 4, borderRadius: 4, width: 130 }}>
              No radar signal reaches here. Blank pixels.
            </div>
          </div>
          
          {/* User Controls HUD */}
          <div style={{ position: 'absolute', bottom: 20, right: 20, width: 350, background: 'rgba(0,10,20,0.85)', padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s3)' }}>
              <div style={{ fontSize: '0.9rem', color: '#0ff', fontWeight: 'bold', letterSpacing: 1 }}>INCIDENCE ANGLE (θ)</div>
              <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-num)' }}>{incAngle}°</div>
            </div>
            <input 
              type="range" 
              min="15" 
              max="65" 
              step="1"
              value={incAngle} 
              onChange={e => setIncAngle(Number(e.target.value))} 
              style={{ width: '100%', accentColor: '#0ff', cursor: 'ew-resize', marginBottom: 'var(--s3)' }} 
            />
            <div style={{ fontSize: '0.86rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
              Drag to adjust satellite orbit. Shallower angles (larger θ) increase shadow. Steeper angles (smaller θ) cause severe layover.
            </div>
          </div>
          
        </div>
      </GlassCard>
    </div>
  );
}

function FeaturePauliRGB() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [lensPos, setLensPos] = useState({ x: 400, y: 200 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Real project data URLs
  const { radarUrl, waterUrl, changeUrl } = useLabInputs();



  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    
    // Load all 3 images to synthesize real Pauli RGB
    const imgRadar = new Image();
    const imgWater = new Image();
    const imgChange = new Image();
    
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount === 3) processPauli();
    };
    
    imgRadar.onload = checkDone; imgRadar.src = radarUrl;
    imgWater.onload = checkDone; imgWater.src = waterUrl;
    imgChange.onload = checkDone; imgChange.src = changeUrl;
    
    const processPauli = () => {
      const w = 1200; // High-res internal rendering
      const h = 600;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      
      // Read each layer on its own offscreen canvas. The water / change masks are transparent
      // PNGs (water = pure blue, so its red channel is 0), so they must be tested by alpha,
      // not by colour, and must never be painted on top of each other.
      const readLayer = (img: HTMLImageElement) => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const cx = c.getContext('2d', { willReadFrequently: true })!;
        cx.drawImage(img, 0, 0, w, h);
        return cx.getImageData(0, 0, w, h);
      };
      const radarData = readLayer(imgRadar);
      const waterData = readLayer(imgWater);
      const changeData = readLayer(imgChange);
      
      // Compute Synthetic Pauli
      const pauliImg = ctx.createImageData(w, h);
      for (let i = 0; i < radarData.data.length; i += 4) {
        const brightness = radarData.data[i]; // Grayscale
        const isWater = waterData.data[i + 3] > 128;
        // Erosion pixels are orange-red (R high, G low); accretion is gold and counts as land
        const isChange = changeData.data[i + 3] > 128 && changeData.data[i + 1] < 120;
        
        if (isChange) {
           // Erosion -> Double Bounce -> Red
           pauliImg.data[i] = Math.min(255, brightness + 150); // R
           pauliImg.data[i+1] = brightness * 0.3; // G
           pauliImg.data[i+2] = brightness * 0.3; // B
        } else if (isWater) {
           // Water -> Surface -> Blue
           pauliImg.data[i] = brightness * 0.2; // R
           pauliImg.data[i+1] = brightness * 0.4; // G
           pauliImg.data[i+2] = Math.min(255, brightness + 100); // B
        } else {
           // Land/Forest -> Volume -> Green
           pauliImg.data[i] = brightness * 0.2; // R
           pauliImg.data[i+1] = Math.min(255, brightness + 50); // G
           pauliImg.data[i+2] = brightness * 0.2; // B
        }
        pauliImg.data[i+3] = 255;
      }
      
      ctx.putImageData(pauliImg, 0, 0);
      setIsLoaded(true);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLensPos({ x, y });
  };

  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="Water and Change Map Lens" subtitle="Explore the Jamuna HH backscatter alongside the project’s water and change masks. The colors show our classified map layers; they are not a polarimetric decomposition." />
      
      <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '500px', 
            background: '#000',
            cursor: 'crosshair',
            overflow: 'hidden'
          }}
        >
          {!isLoaded && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0ff', fontFamily: 'var(--font-num)', letterSpacing: 2 }}>
              PROCESSING SAR GCOV GRANULES...
            </div>
          )}
          
          {/* Base Layer: Raw Grayscale Radar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(${radarUrl})`,
            backgroundSize: '100% 100%',
            opacity: isLoaded ? 0.7 : 0,
            transition: 'opacity 1s'
          }} />
          
          {/* Overlay text on base radar */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'rgba(var(--fg-rgb), 0.5)', fontFamily: 'var(--font-num)', fontSize: '0.9rem' }}>
            RAW L-BAND HH BACKSCATTER (σ⁰)
          </div>

          {/* Magic Lens Layer: Pauli RGB Canvas */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            clipPath: `circle(120px at ${lensPos.x}px ${lensPos.y}px)`,
            opacity: isLoaded ? 1 : 0
          }}>
            <canvas 
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
            />
            
            {/* Lens UI Ring */}
            <div style={{
              position: 'absolute',
              top: lensPos.y - 120,
              left: lensPos.x - 120,
              width: 240,
              height: 240,
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 255, 0.8)',
              boxShadow: 'inset 0 0 40px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.5)',
              pointerEvents: 'none'
            }}>
              {/* Crosshair inside lens */}
              <div style={{ position: 'absolute', top: '50%', left: '40%', right: '40%', height: '1px', background: 'rgba(0, 255, 255, 0.5)' }} />
              <div style={{ position: 'absolute', left: '50%', top: '40%', bottom: '40%', width: '1px', background: 'rgba(0, 255, 255, 0.5)' }} />
              
              <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', color: '#0ff', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'nowrap', textShadow: '0 0 5px #0ff' }}>
                CLASSIFIED MASK OVERLAY
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s4)', background: 'var(--surface)', padding: 'var(--s4)', borderTop: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
           <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <div style={{ width: 16, height: 16, background: '#f44', borderRadius: '4px', boxShadow: '0 0 10px #f44' }} />
             <div>
               <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text)' }}>Mapped erosion (red)</div>
               <div style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>Classified land-to-water change</div>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <div style={{ width: 16, height: 16, background: '#4f4', borderRadius: '4px', boxShadow: '0 0 10px #4f4' }} />
             <div>
               <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text)' }}>Mapped land (green)</div>
               <div style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>HH backscatter context</div>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
             <div style={{ width: 16, height: 16, background: '#44f', borderRadius: '4px', boxShadow: '0 0 10px #44f' }} />
             <div>
               <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text)' }}>Mapped water (blue)</div>
               <div style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>Water classification mask</div>
             </div>
           </div>
        </div>
      </GlassCard>
    </div>
  );
}



function FeatureCloudePottier() {
  const [weights, setWeights] = useState([80, 10, 10]);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const p = weights.map(value => value / sum);
  const alpha = [10, 45, 80]; // canonical surface-, volume-, and dihedral-like eigenvector examples
  const entropy = -p.reduce((h, value) => h + (value > 0 ? value * Math.log(value) / Math.log(3) : 0), 0);
  const meanAlpha = p.reduce((a, value, i) => a + value * alpha[i], 0);
  const dotX = 72 + entropy * 560;
  const dotY = 250 - meanAlpha / 90 * 210;
  const names = ['Surface-like', 'Volume-like', 'Dihedral-like'];
  const colors = ['var(--water)', 'var(--pass)', 'var(--warn)'];
  const presets = [[90, 5, 5], [34, 42, 24], [5, 5, 90]];

  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="H/α Eigenvalue Decomposition · Synthetic Lab" subtitle="Adjust a synthetic three-component coherency model. The lab computes normalized eigenvalue entropy H and mean α from the selected powers and canonical component angles; it does not analyze the Jamuna imagery." />
      <GlassCard>
        <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap', marginBottom: 'var(--s4)' }}>
          {presets.map((preset, i) => <button key={i} onClick={() => setWeights(preset)} style={{ padding: '.6rem .9rem', border: '1px solid var(--glass-border)', borderRadius: 999, background: 'rgba(var(--fg-rgb),.04)', color: 'var(--text-2)', cursor: 'pointer' }}>{['Surface-dominant', 'Mixed scattering', 'Dihedral-dominant'][i]}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, .8fr) minmax(0,1.2fr)', gap: 'var(--s5)', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 'var(--s4)' }}>
            {names.map((name, i) => <label key={name} style={{ color: 'var(--text-2)', fontSize: '.88rem' }}>{name} power <strong style={{ float: 'right', color: colors[i] }}>{weights[i]}%</strong><input aria-label={`${name} eigenvalue weight`} type="range" min="0" max="100" value={weights[i]} onChange={e => setWeights(current => current.map((v, j) => j === i ? Number(e.target.value) : v))} style={{ width: '100%', accentColor: colors[i] }} /></label>)}
            <div style={{ padding: 'var(--s3)', borderRadius: 'var(--r-md)', background: 'rgba(var(--fg-rgb),.04)', color: 'var(--text-3)', fontSize: '.82rem', lineHeight: 1.5 }}>Normalized synthetic eigenvalues: λᵢ / Σλ = {p.map(v => v.toFixed(2)).join(' · ')}. Component angles (10°, 45°, 80°) are teaching archetypes.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 210px', gap: 'var(--s4)', alignItems: 'center' }}>
            <svg viewBox="0 0 680 300" role="img" aria-label={`Synthetic H alpha plot, entropy ${entropy.toFixed(2)}, mean alpha ${meanAlpha.toFixed(1)} degrees`} style={{ width: '100%', background: 'rgba(var(--shadow-rgb),.25)', borderRadius: 'var(--r-md)' }}>
              <rect x="72" y="40" width="560" height="210" fill="rgba(var(--water-rgb),.025)" stroke="rgba(255,255,255,.2)"/>
              {[0,.25,.5,.75,1].map(v=><g key={v}><line x1={72+560*v} x2={72+560*v} y1="40" y2="250" stroke="rgba(255,255,255,.1)"/><text x={72+560*v} y="272" textAnchor="middle" fill="#aab7c4" fontSize="12">{v.toFixed(2)}</text></g>)}
              {[0,30,60,90].map(v=><g key={v}><line x1="72" x2="632" y1={250-v/90*210} y2={250-v/90*210} stroke="rgba(255,255,255,.1)"/><text x="56" y={254-v/90*210} textAnchor="end" fill="#aab7c4" fontSize="12">{v}°</text></g>)}
              <text x="352" y="294" textAnchor="middle" fill="#c3ced8" fontSize="13">Entropy H (0–1)</text><text x="15" y="145" textAnchor="middle" transform="rotate(-90 15 145)" fill="#c3ced8" fontSize="13">Mean α</text>
              {p.map((v,i)=><circle key={i} cx={72+560*entropy} cy={250-alpha[i]/90*210} r={7+v*12} fill={colors[i]} opacity=".26"/>)}
              <circle cx={dotX} cy={dotY} r="8" fill="#fff" stroke="#001018" strokeWidth="3"/><circle cx={dotX} cy={dotY} r="15" fill="none" stroke="#fff" opacity=".5"/>
            </svg>
            <div style={{ padding: 'var(--s4)', border: '1px solid rgba(var(--water-rgb),.18)', borderRadius: 'var(--r-md)' }}><div style={{ color: 'var(--text-3)', fontSize: '.75rem' }}>COMPUTED FROM THIS TOY MODEL</div><strong style={{ display: 'block', color: 'var(--water)', fontSize: '1.8rem', marginTop: 6 }}>H {entropy.toFixed(3)}</strong><strong style={{ display: 'block', color: 'var(--pass)', fontSize: '1.8rem' }}>ᾱ {meanAlpha.toFixed(1)}°</strong><div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: '.76rem' }}>H = −Σpᵢlog₃pᵢ<br/>ᾱ = Σpᵢαᵢ</div></div>
          </div>
        </div>
        <p style={{ margin: 'var(--s4) 0 0', color: 'var(--text-3)', fontSize: '.82rem', lineHeight: 1.5 }}>Cloude–Pottier H/α requires an estimated polarimetric coherency/covariance matrix and its eigendecomposition. This diagonal toy model teaches the equations only; no H/α values are inferred from project rasters.</p>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW SIMULATION 1: SweepSAR Beam Animation
   NISAR's key innovation — digital beamforming on receive.
   Traditional SAR uses a single narrow beam; SweepSAR illuminates
   a wide swath with ONE transmit beam, then forms multiple
   simultaneous receive beams via DBF to track the echoes.
   ═══════════════════════════════════════════════════════════════ */
function FeatureSweepSAR() {
  const [mode, setMode] = useState<'traditional' | 'sweepsar'>('sweepsar');
  const [animTime, setAnimTime] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setAnimTime(t => (t + 3) % 360), 50);
    return () => window.clearInterval(timer);
  }, []);

  const satX = 500;
  const satY = 50;
  const groundY = 280;
  const txLeft = 150;
  const txRight = 850;
  const swathWidth = txRight - txLeft;
  const tradBeamCenter = txLeft + ((animTime / 360) * swathWidth);
  const tradBeamHalf = 40;
  const numRxBeams = 6;
  const rxBeamPositions = Array.from({ length: numRxBeams }, (_, i) => {
    const baseX = txLeft + (i + 0.5) * (swathWidth / numRxBeams);
    const phase = (animTime * 3 + i * 60) % 360;
    const intensity = Math.max(0, Math.cos((phase / 180) * Math.PI));
    return { x: baseX, intensity };
  });

  return (
    <div id="simulations" className="sar-section">
      <SectionTitle
        title="SweepSAR: NISAR's Key Innovation"
        subtitle="NISAR uses SweepSAR, a scan-on-receive technique that combines wide area coverage with fine spatial resolution. The animation is a conceptual view of the antenna operation."
      />
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 'var(--s2)', padding: 'var(--s4)', background: 'rgba(var(--fg-rgb), 0.03)', borderBottom: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
          <button
            onClick={() => setMode('traditional')}
            style={{
              padding: '8px 20px', borderRadius: 'var(--r-md)', border: `2px solid ${mode === 'traditional' ? 'var(--warn)' : 'rgba(var(--fg-rgb), 0.1)'}`,
              background: mode === 'traditional' ? 'rgba(255,170,0,0.1)' : 'transparent',
              color: mode === 'traditional' ? 'var(--warn)' : 'var(--text-3)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            Traditional Stripmap SAR
          </button>
          <button
            onClick={() => setMode('sweepsar')}
            style={{
              padding: '8px 20px', borderRadius: 'var(--r-md)', border: `2px solid ${mode === 'sweepsar' ? '#0ff' : 'rgba(var(--fg-rgb), 0.1)'}`,
              background: mode === 'sweepsar' ? 'rgba(0,255,255,0.1)' : 'transparent',
              color: mode === 'sweepsar' ? '#0ff' : 'var(--text-3)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            SweepSAR + DBF (NISAR)
          </button>
        </div>

        <div className="sweep-visual">
          <svg width="100%" height="100%" viewBox="0 0 1000 380" preserveAspectRatio="xMidYMid meet">
            <rect x="0" y={groundY} width="1000" height="100" fill="#1a2a10" />
            <line x1="0" y1={groundY} x2="1000" y2={groundY} stroke="rgba(100,200,100,0.3)" strokeWidth="2" />
            <text x="200" y={groundY + 25} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">RIVER</text>
            <rect x="170" y={groundY + 5} width="60" height="15" fill="rgba(0,100,200,0.3)" rx="2" />
            <text x="400" y={groundY + 25} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">FOREST</text>
            <rect x="370" y={groundY + 5} width="60" height="15" fill="rgba(0,150,50,0.3)" rx="2" />
            <text x="600" y={groundY + 25} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">URBAN</text>
            <rect x="570" y={groundY + 5} width="60" height="15" fill="rgba(200,200,200,0.3)" rx="2" />
            <text x="800" y={groundY + 25} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">AGRICULTURE</text>
            <rect x="760" y={groundY + 5} width="80" height="15" fill="rgba(200,200,0,0.2)" rx="2" />
            <circle cx={satX} cy={satY} r="10" fill="#0ff" />
            <rect x={satX - 40} y={satY - 6} width="25" height="12" fill="#088" rx="2" />
            <rect x={satX + 15} y={satY - 6} width="25" height="12" fill="#088" rx="2" />
            <ellipse cx={satX} cy={satY + 18} rx="18" ry="6" fill="none" stroke="#0ff" strokeWidth="2" />
            <text x={satX} y={satY - 18} fill="#0ff" fontSize="12" fontWeight="bold" textAnchor="middle">NISAR (747 km)</text>

            {mode === 'sweepsar' ? (
              <g>
                <polygon
                  points={`${satX},${satY + 24} ${txLeft},${groundY} ${txRight},${groundY}`}
                  fill="rgba(0,255,255,0.04)"
                  stroke="rgba(0,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text x={satX} y={satY + 40} fill="rgba(0,255,255,0.5)" fontSize="10" textAnchor="middle">TX • reflector illuminates swath</text>
                {rxBeamPositions.map((beam, i) => (
                  <g key={i}>
                    <line
                      x1={satX} y1={satY + 24}
                      x2={beam.x} y2={groundY}
                      stroke={`rgba(0,255,255,${0.15 + beam.intensity * 0.7})`}
                      strokeWidth={1 + beam.intensity * 3}
                    />
                    <rect
                      x={beam.x - 20} y={groundY - 4}
                      width="40" height="4"
                      fill={`rgba(0,255,255,${beam.intensity * 0.8})`}
                      rx="2"
                    />
                    {beam.intensity > 0.5 && (
                      <text x={beam.x} y={groundY - 10} fill="rgba(0,255,255,0.7)" fontSize="9" textAnchor="middle">
                        RX {i + 1}
                      </text>
                    )}
                  </g>
                ))}
                <line x1={txLeft} y1={groundY + 50} x2={txRight} y2={groundY + 50} stroke="#0ff" strokeWidth="2" />
                <text x={satX} y={groundY + 65} fill="#0ff" fontSize="13" fontWeight="bold" textAnchor="middle">~242 km SWATH</text>
              </g>
            ) : (
              <g>
                <polygon
                  points={`${satX},${satY + 24} ${tradBeamCenter - tradBeamHalf},${groundY} ${tradBeamCenter + tradBeamHalf},${groundY}`}
                  fill="rgba(255,170,0,0.12)"
                  stroke="rgba(255,170,0,0.6)"
                  strokeWidth="1.5"
                />
                <rect
                  x={tradBeamCenter - tradBeamHalf} y={groundY - 4}
                  width={tradBeamHalf * 2} height="4"
                  fill="rgba(255,170,0,0.8)"
                  rx="2"
                />
                <line x1={tradBeamCenter - tradBeamHalf} y1={groundY + 50} x2={tradBeamCenter + tradBeamHalf} y2={groundY + 50} stroke="var(--warn)" strokeWidth="2" />
                <text x={tradBeamCenter} y={groundY + 65} fill="var(--warn)" fontSize="13" fontWeight="bold" textAnchor="middle">~20-40 km SWATH</text>
              </g>
            )}
          </svg>

        </div>
        <div className={`sweep-explainer${mode === 'traditional' ? ' sweep-explainer--traditional' : ''}`} aria-live="polite">
          <div className="sweep-explainer__copy">
            <h3 style={{ color: mode === 'sweepsar' ? 'var(--water)' : 'var(--warn)' }}>
              {mode === 'sweepsar' ? 'SweepSAR + Digital Beamforming' : 'Traditional Stripmap SAR'}
            </h3>
            <p>
              {mode === 'sweepsar'
                ? "NISAR's SweepSAR uses a stationary transmit feed and a phased-array feed that sweeps on receive. This schematic illustrates scan-on-receive across a roughly 242 km swath; beam count and geometry here are illustrative."
                : 'This comparison is conceptual. Swath width depends on radar mode and instrument design; this panel does not model a specific alternative mission.'}
            </p>
          </div>
          <div className="sweep-explainer__metric">
            <small>ILLUSTRATED SWATH</small>
            <strong>{mode === 'sweepsar' ? '~242 km' : 'Narrower area'}</strong>
            <span>{mode === 'sweepsar' ? 'Mode-dependent resolution' : 'Conceptual comparison'}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW SIMULATION 2: Dielectric Constant & Backscatter Explorer
   ═══════════════════════════════════════════════════════════════ */
const SURFACE_MATERIALS = [
  { name: 'Water (representative)', epsilon: 80, color: '#0088ff', desc: 'High permittivity. A calm, smooth water surface tends to reflect energy specularly away from a side-looking radar.' },
  { name: 'Wet Soil (representative)', epsilon: 25, color: '#8B6914', desc: 'Soil permittivity generally increases with water content. Texture and vegetation also shape the measured radar return.' },
  { name: 'Dry Soil (representative)', epsilon: 4, color: '#C4A35A', desc: 'Lower water content often means lower permittivity, but soil composition and texture create wide variation.' },
  { name: 'Ice (representative)', epsilon: 3.5, color: '#bbddff', desc: 'Ice permittivity depends on frequency, temperature, liquid water, and impurities; this simple value is illustrative.' },
  { name: 'Concrete (representative)', epsilon: 5, color: '#aaaaaa', desc: 'A simple dielectric interface does not represent building geometry, corner reflectors, or urban double-bounce scattering.' },
];

function FeatureDielectric() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [incAngle, setIncAngle] = useState(35);
  const material = SURFACE_MATERIALS[selectedIdx];

  const thetaRad = (incAngle * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);
  const sinTheta = Math.sin(thetaRad);
  const transmittedCos = Math.sqrt(Math.max(0, material.epsilon - sinTheta * sinTheta));
  const fresnelH = Math.pow((cosTheta - transmittedCos) / (cosTheta + transmittedCos), 2);
  const fresnelV = Math.pow((material.epsilon * cosTheta - transmittedCos) / (material.epsilon * cosTheta + transmittedCos), 2);
  const thetaTrans = Math.asin(Math.min(1, sinTheta / Math.sqrt(material.epsilon)));
  const rayLength = 96;
  const interfaceX = 300;
  const interfaceY = 116;
  const incidentX = interfaceX - rayLength * Math.sin(thetaRad);
  const incidentY = interfaceY - rayLength * Math.cos(thetaRad);
  const reflectedX = interfaceX + rayLength * Math.sin(thetaRad);
  const reflectedY = interfaceY - rayLength * Math.cos(thetaRad);
  const transmittedX = interfaceX + rayLength * Math.sin(thetaTrans);
  const transmittedY = interfaceY + rayLength * Math.cos(thetaTrans);

  return (
    <div className="sar-dielectric-lab" style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle
        title="Dielectric Interface: Fresnel Reflectance"
        subtitle="Change representative dielectric permittivity and incidence angle to see idealized H- and V-polarized reflection at a flat boundary. Fresnel reflectance is not SAR backscatter σ⁰; roughness, vegetation, and sensor-return geometry are outside this model."
      />
      <GlassCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--s4)', alignItems: 'start' }}>
        <div>
        <div style={{ background: 'rgba(var(--fg-rgb), 0.03)', padding: 'var(--s3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--fg-rgb), 0.05)', marginBottom: 'var(--s3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 'bold' }}>Incidence angle</span>
            <span style={{ fontSize: '1rem', color: '#0ff', fontWeight: 'bold', fontFamily: 'var(--font-num)' }}>{incAngle}°</span>
          </div>
          <input aria-label="Incidence angle in degrees" type="range" min="10" max="65" value={incAngle} onChange={e => setIncAngle(Number(e.target.value))} style={{ width: '100%', accentColor: '#0ff' }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>Measured from the surface normal · ray paths update live</div>
        </div>
        <div className="sar-dielectric-ray-diagram" style={{ marginBottom: 'var(--s4)', overflow: 'hidden', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--water-rgb),.16)', background: 'linear-gradient(180deg,#081421 0%,#101d2a 48%,#453b2c 49%,#2e2924 100%)' }}>
          <div style={{ padding: '8px 12px', color: 'var(--text-2)', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.08em', borderBottom: '1px solid rgba(var(--water-rgb),.13)' }}>LIVE RAY GEOMETRY · ANGLES FROM THE SURFACE NORMAL</div>
          <svg viewBox="0 0 600 250" role="img" aria-label={`Incident and reflected angles are ${incAngle} degrees; transmitted angle is ${(thetaTrans * 180 / Math.PI).toFixed(1)} degrees`} style={{ display: 'block', width: '100%', height: 'auto', minHeight: 205, maxHeight: 245 }}>
            <defs>
              <marker id="fresnel-arrow-in" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#f2c66d"/></marker>
              <marker id="fresnel-arrow-out" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#42dce5"/></marker>
              <marker id="fresnel-arrow-through" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#a7d994"/></marker>
            </defs>
            <line x1="26" y1={interfaceY} x2="574" y2={interfaceY} stroke="#c2a879" strokeWidth="3"/>
            <line x1={interfaceX} y1="18" x2={interfaceX} y2="224" stroke="rgba(255,255,255,.42)" strokeDasharray="6 6"/>
            <path d={`M ${incidentX} ${incidentY} L ${interfaceX} ${interfaceY}`} fill="none" stroke="#f2c66d" strokeWidth="4" markerEnd="url(#fresnel-arrow-in)"/>
            <path d={`M ${interfaceX} ${interfaceY} L ${reflectedX} ${reflectedY}`} fill="none" stroke="#42dce5" strokeWidth="4" markerEnd="url(#fresnel-arrow-out)"/>
            <path d={`M ${interfaceX} ${interfaceY} L ${transmittedX} ${transmittedY}`} fill="none" stroke="#a7d994" strokeWidth="4" markerEnd="url(#fresnel-arrow-through)"/>
            <circle cx={interfaceX} cy={interfaceY} r="7" fill="#fff"/>
            <text x={incidentX - 8} y={incidentY - 10} fill="#f2c66d" fontSize="14" fontWeight="700">incident ray</text>
            <text x={reflectedX + 10} y={reflectedY - 9} fill="#42dce5" fontSize="14" fontWeight="700">reflected ray</text>
            <text x={interfaceX + 20} y={transmittedY + 18} fill="#a7d994" fontSize="14" fontWeight="700">transmitted ray</text>
            <text x={interfaceX + 10} y="38" fill="#c4d0dc" fontSize="12">surface normal</text>
            <text x={interfaceX - 57} y={interfaceY - 37} fill="#f2c66d" fontSize="12">θᵢ {incAngle}°</text>
            <text x={interfaceX + 20} y={interfaceY - 37} fill="#42dce5" fontSize="12">θᵣ {incAngle}°</text>
            <text x={interfaceX + 20} y={interfaceY + 53} fill="#a7d994" fontSize="12">θₜ {(thetaTrans * 180 / Math.PI).toFixed(1)}°</text>
            <text x="35" y="100" fill="#d5c39f" fontSize="13">incident medium</text>
            <text x="35" y="145" fill="#d5c39f" fontSize="13">{material.name} · εᵣ {material.epsilon}</text>
            <text x="565" y="238" textAnchor="end" fill="#9eabb6" fontSize="10">Snell + Fresnel · ideal interface</text>
          </svg>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--s2)', marginBottom: 'var(--s5)' }}>
          {SURFACE_MATERIALS.map((mat, i) => (
            <button
              key={mat.name}
              onClick={() => setSelectedIdx(i)}
              style={{
                padding: '10px 14px', borderRadius: 'var(--r-md)',
                border: `2px solid ${selectedIdx === i ? mat.color : 'rgba(var(--fg-rgb), 0.08)'}`,
                background: selectedIdx === i ? `${mat.color}15` : 'transparent',
                color: selectedIdx === i ? mat.color : 'var(--text-3)',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem', textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: 10, height: 10, background: mat.color, borderRadius: '50%', display: 'inline-block', marginRight: 6 }} />
              {mat.name}
            </button>
          ))}
        </div>
        </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 430px), 1fr))', gap: 'var(--s4)', alignItems: 'start' }}>
        <div>
            <div style={{ background: 'rgba(var(--fg-rgb), 0.03)', padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: `1px solid ${material.color}30`, marginBottom: 'var(--s4)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: material.color, marginBottom: 8 }}>{material.name}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 'var(--s3)' }}>{material.desc}</div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>Representative real relative permittivity (εᵣ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-num)', color: material.color }}>{material.epsilon}</div>
                </div>
            </div>
        </div>

        <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--text-2)', marginBottom: 'var(--s3)' }}>Reflected incident power at {incAngle}°</div>
            {[
              { label: 'H-polarized Fresnel reflectance', fraction: fresnelH, color: 'var(--water)' },
              { label: 'V-polarized Fresnel reflectance', fraction: fresnelV, color: 'var(--pass)' },
            ].map(ch => (
              <div key={ch.label} style={{ marginBottom: 'var(--s3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-3)' }}>{ch.label}</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'var(--font-num)', color: ch.color }}>{(ch.fraction * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 20, background: 'rgba(var(--fg-rgb), 0.05)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%', width: `${Math.max(0, Math.min(100, ch.fraction * 100))}%`,
                    background: `linear-gradient(90deg, ${ch.color}40, ${ch.color})`,
                    borderRadius: 4, transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 'var(--s4)', padding: 'var(--s3)', background: 'rgba(var(--fg-rgb), 0.03)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--fg-rgb), 0.05)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>What this percentage means</div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>For a lossless, non-magnetic flat interface, this is the Fresnel power fraction reflected at the boundary. A smooth surface can send that specular reflection away from a monostatic radar, so a high reflectance here does not mean a bright SAR pixel. Real materials have frequency-dependent complex permittivity.</p>
            </div>
        </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW SIMULATION 3: Dual-Frequency L+S Band Penetration Simulator
   ═══════════════════════════════════════════════════════════════ */
function FeatureDualFrequency() {
  const [diameterMm, setDiameterMm] = useState(30);
  const bands = [{ name: 'L-band · NISAR', lambda: 238, color: 'var(--water)' }, { name: 'S-band · NISAR', lambda: 94, color: 'var(--warn)' }];
  const sizeParameter = (lambdaMm: number) => Math.PI * diameterMm / lambdaMm;
  const regime = (x: number) => x < 0.3 ? 'Electrically small (Rayleigh-like limit)' : x <= 3 ? 'Wavelength-scale interaction' : 'Large relative to wavelength';
  return (
    <div style={{ marginBottom: 'var(--s8)' }}>
      <SectionTitle title="L- and S-band · Target-Scale Simulator" subtitle="Compare NISAR wavelengths with a chosen effective scatterer size using the dimensionless size parameter x = πd/λ. This tests scale relationships; it does not predict penetration depth or backscatter." />
      <GlassCard>
        <label style={{ display: 'block', color: 'var(--text-2)', maxWidth: 720, marginBottom: 'var(--s5)' }}>Effective target diameter <strong style={{ color: 'var(--water)', float: 'right' }}>{diameterMm} mm</strong><input aria-label="Effective target diameter in millimeters" type="range" min="1" max="300" value={diameterMm} onChange={e => setDiameterMm(Number(e.target.value))} style={{ width: '100%' }}/><span style={{ display: 'block', color: 'var(--text-3)', fontSize: '.78rem' }}>Illustrative diameter only; vegetation elements are irregular and oriented.</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--s4)' }}>
          {bands.map(band => {
            const x = sizeParameter(band.lambda);
            const waves = Math.max(1, Math.min(12, 300 / band.lambda));
            const targetRadius = Math.max(4, Math.min(115, diameterMm / 300 * 120));
            return <div key={band.name} style={{ padding: 'var(--s4)', border: `1px solid ${band.color}55`, borderRadius: 'var(--r-md)', background: 'rgba(var(--fg-rgb),.025)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: band.color, fontWeight: 800 }}><span>{band.name}</span><span>λ {band.lambda} mm</span></div>
              <svg viewBox="0 0 600 150" role="img" aria-label={`${band.name}: target size parameter ${x.toFixed(2)}`} style={{ display: 'block', width: '100%', marginTop: 10, background: '#07111d', borderRadius: 8 }}>
                <path d={Array.from({length: 121},(_,i)=>`${i?'L':'M'} ${20+i*4.65} ${75+28*Math.sin(i/120*waves*Math.PI*2)}`).join(' ')} fill="none" stroke={band.color} strokeWidth="3" opacity=".8"/>
                <circle cx="300" cy="75" r={targetRadius} fill="rgba(225,236,224,.15)" stroke="#e1ece0" strokeWidth="2"/>
                <line x1="300" x2="300" y1={75-targetRadius} y2={75+targetRadius} stroke="#fff" strokeWidth="2"/>
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}><span style={{ color: 'var(--text-3)' }}>x = πd/λ</span><strong style={{ color: band.color, fontSize: '1.5rem', fontFamily: 'var(--font-num)' }}>{x.toFixed(2)}</strong></div>
              <div style={{ color: 'var(--text-2)', fontSize: '.88rem', marginTop: 5 }}>{regime(x)}</div>
            </div>;
          })}
        </div>
        <p style={{ margin: 'var(--s4) 0 0', color: 'var(--text-3)', fontSize: '.82rem', lineHeight: 1.5 }}>Size parameter helps describe how an idealized object’s size compares with wavelength. Actual vegetation scattering also depends on shape, orientation, dielectric properties, canopy structure, polarization, incidence angle, and multiple interactions; wavelength alone does not determine how deeply a radar signal penetrates.</p>
      </GlassCard>
    </div>
  );
}

export function SARLabPage() {
    const [activeBand, setActiveBand] = useState(2); // Default to L-band
  const [activePol, setActivePol] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  const [coherenceDays, setCoherenceDays] = useState(12);
  const [coherenceTau, setCoherenceTau] = useState(36);

  // Otsu (3A)
  const [otsuThreshold, setOtsuThreshold] = useState(-15);
  const otsuData = useMemo(() => {
    const data = [];
    for (let db = -25; db <= -5; db += 0.5) {
      // Bimodal mixture of gaussians
      const waterDist = 80 * Math.exp(-Math.pow(db - (-18), 2) / (2 * 1.5 * 1.5));
      const landDist = 60 * Math.exp(-Math.pow(db - (-10), 2) / (2 * 2 * 2));
      const noise = (Math.sin((db + 25) * 12.9898) * 0.5 + 0.5) * 5;
      data.push({ db, count: Math.round(waterDist + landDist + noise) });
    }
    return data;
  }, []);
  
  const otsuStats = useMemo(() => {
    let water = 0;
    let land = 0;
    otsuData.forEach(d => {
      if (d.db < otsuThreshold) water += d.count;
      else land += d.count;
    });
    return { water, land };
  }, [otsuData, otsuThreshold]);

  // InSAR (3B)
  const [insarMaxDisp, setInsarMaxDisp] = useState(10);
  const [insarRadius, setInsarRadius] = useState(500);
  const [insarCenter, setInsarCenter] = useState({ x: 200, y: 150 });
  const insarCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawFringes = useCallback(() => {
    const canvas = insarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    
    const D = insarMaxDisp; // cm
    const sigma = insarRadius / 10; // scaled
    const lambda = 23.8; // cm
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Displacement field
        const distSq = Math.pow(x - insarCenter.x, 2) + Math.pow(y - insarCenter.y, 2);
        const d = D * Math.exp(-distSq / (2 * sigma * sigma));
        
        // Phase calculation
        const phase = (4 * Math.PI / lambda) * d;
        const wrappedPhase = phase % (2 * Math.PI);
        
        // Convert to color (HSL)
        const hue = (wrappedPhase / (2 * Math.PI)) * 360;
        
        // HSL to RGB conversion inline for speed
        const s = 1.0;
        const l = 0.5;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const xp = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = l - c / 2;
        let r=0, g=0, b=0;
        if(hue<60){r=c; g=xp; b=0;}
        else if(hue<120){r=xp; g=c; b=0;}
        else if(hue<180){r=0; g=c; b=xp;}
        else if(hue<240){r=0; g=xp; b=c;}
        else if(hue<300){r=xp; g=0; b=c;}
        else{r=c; g=0; b=xp;}
        
        const index = (y * width + x) * 4;
        imageData.data[index] = (r+m)*255;
        imageData.data[index+1] = (g+m)*255;
        imageData.data[index+2] = (b+m)*255;
        imageData.data[index+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [insarMaxDisp, insarRadius, insarCenter]);

  useEffect(() => {
    drawFringes();
  }, [drawFringes]);
  
  const handleInsarClick = (e) => {
    const rect = insarCanvasRef.current!.getBoundingClientRect();
    setInsarCenter({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // H/Alpha (3C)
  const [showErosionZone, setShowErosionZone] = useState(false);
  const hAlphaPoints = useMemo(() => {
    const pts = [];
    // Water (low H, low alpha)
    for(let i=0; i<30; i++) pts.push({ H: 0.1 + Math.random()*0.2, alpha: 10 + Math.random()*20, type: 'water' });
    // Forest (high H, medium alpha)
    for(let i=0; i<40; i++) pts.push({ H: 0.6 + Math.random()*0.3, alpha: 40 + Math.random()*20, type: 'forest' });
    // Urban (low H, high alpha)
    for(let i=0; i<20; i++) pts.push({ H: 0.2 + Math.random()*0.3, alpha: 65 + Math.random()*20, type: 'urban' });
    return pts;
  }, []);
  
  // Mix in erosion points if toggled
  const currentHAlphaPoints = useMemo(() => {
    if (!showErosionZone) return hAlphaPoints;
    const erosionPts = [];
    for(let i=0; i<15; i++) erosionPts.push({ H: 0.3 + Math.random()*0.2, alpha: 30 + Math.random()*20, type: 'erosion' });
    return [...hAlphaPoints, ...erosionPts];
  }, [hAlphaPoints, showErosionZone]);


  return (
    <div className="sar-lab" style={{ background: 'transparent', minHeight: '100vh', color: 'var(--text)' }}>
      <div className="navbar-spacer" /><details className="workspace-data-note" style={{margin:"18px auto 0",maxWidth:1400}}><summary><strong>WORKSPACE INPUTS · OBSERVATIONS + EDUCATIONAL LAB</strong></summary><p>Image exercises use the active Sentinel-1 RTC VV observations and source-derived masks. NISAR physics diagrams, model sliders and synthetic polarimetry are teaching simulations. Display brightness is not a numeric dB measurement.</p></details>

      <main className="sar-lab__main" style={{ padding: 'var(--s6) clamp(var(--s5), 3vw, var(--s8))', maxWidth: 1640, margin: '0 auto' }}>

        {/* ═══ HERO ═══ */}
        <div className="sar-lab__hero" style={{ textAlign: 'center', marginBottom: 'var(--s8)', paddingTop: 'var(--s4)' }}>
          <div className="globe-hero__badge" style={{ borderColor: 'var(--water)', color: 'var(--water)' }}>
            <span className="globe-hero__badge-dot" style={{ background: 'var(--water)', boxShadow: '0 0 8px var(--water)' }} />
            INTERACTIVE SAR SCIENCE LAB
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 7.2vw, 6.5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: 'var(--s4)', marginTop: 'var(--s3)', letterSpacing: '-0.03em' }}>
            <span style={{ color: 'var(--text)' }}>Radar Remote Sensing</span><br />
            <span className="glow-text">Deep Dive</span>
          </h1>
          <p style={{ color: 'var(--text-2)', maxWidth: 1000, margin: '0 auto', fontSize: 'clamp(1.15rem, 1.7vw, 1.6rem)', lineHeight: 1.65 }}>
            Explore how NISAR radar works, then adjust the controls to see how wavelength, surface conditions, and processing choices shape the signals we interpret.
          </p>
          <div className="sar-lab__hero-stats" aria-label="NISAR at a glance">
            <span><strong>24 cm</strong><small>L-band wavelength</small></span>
            <span><strong>~242 km</strong><small>imaging swath</small></span>
            <span><strong>12 days</strong><small>repeat cycle</small></span>
            <span><strong>Day / night</strong><small>cloud tolerant</small></span>
          </div>
        </div>

        <nav className="sar-lab__nav" aria-label="SAR Lab sections">
          <a href="#mission">Mission</a><a href="#signals">Radar signals</a><a href="#simulations">Simulations</a><a href="#pipeline">Our pipeline</a><a href="#insar">InSAR</a>
        </nav>

        {/* ═══ SECTION 1: NISAR MISSION SPECS ═══ */}
        <div id="mission" className="sar-section">
          <SectionTitle title="NISAR Mission" subtitle="A NASA–ISRO Earth-observing mission using L-band and S-band SAR to measure changes in land, ice, water, and vegetation." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--s3)' }}>
            {NISAR_SPECS.map((spec) => (
              <div key={spec.param} className="glass-panel hover-lift sar-spec-card" style={{ padding: '0.95rem 1.05rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.15rem', flexShrink: 0, width: 28, textAlign: 'center' }}>{spec.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{spec.param}</div>
                  <div style={{ fontSize: '1.02rem', color: 'var(--water)', fontWeight: 700, marginTop: 3 }}>{spec.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SECTION 2: FREQUENCY BANDS ═══ */}
        <div id="signals" className="sar-section">
      <SectionTitle title="Radar Frequency Bands" subtitle="Wavelength influences how radar interacts with vegetation and surface structure. Penetration varies with canopy, moisture, geometry, and frequency; it is not a fixed depth." />
          
          <GlassCard>
            {/* Band selector tabs */}
            <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s5)', flexWrap: 'wrap' }}>
              {BANDS.map((b, i) => (
                <button
                  key={b.name}
                  onClick={() => setActiveBand(i)}
                  style={{
                    padding: '10px 20px',
                    border: `2px solid ${activeBand === i ? b.color : 'rgba(var(--fg-rgb), 0.1)'}`,
                    borderRadius: 'var(--r-md)',
                    background: activeBand === i ? `${b.color}15` : 'transparent',
                    color: activeBand === i ? b.color : 'var(--text-3)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s',
                    boxShadow: activeBand === i ? `0 0 20px ${b.color}20` : 'none'
                  }}
                >
                  {b.name} {b.highlight ? <Star size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> : ''}
                </button>
              ))}
            </div>

            {/* Active band details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s5)' }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Frequency Range</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: BANDS[activeBand].color, fontFamily: 'var(--font-num)' }}>{BANDS[activeBand].freq}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Wavelength</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: BANDS[activeBand].color, fontFamily: 'var(--font-num)' }}>{BANDS[activeBand].wl}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Canopy interaction (qualitative)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: BANDS[activeBand].color }}>{BANDS[activeBand].pen}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Key Missions</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{BANDS[activeBand].sat}</div>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--s4)', padding: 'var(--s3)', background: 'rgba(var(--fg-rgb), 0.03)', borderRadius: 'var(--r-md)', borderLeft: `3px solid ${BANDS[activeBand].color}` }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                    <strong>Primary Use:</strong> {BANDS[activeBand].use}
                  </div>
                </div>
              </div>

              {/* Penetration depth visualization */}
              <div style={{ position: 'relative', height: 250, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                {/* Sky */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20%', background: 'linear-gradient(180deg, #0a1628 0%, #152238 100%)' }} />
                {/* Canopy */}
                <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '30%', background: 'linear-gradient(180deg, #1a3a1a 0%, #0f2810 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(var(--fg-rgb), 0.5)', textTransform: 'uppercase' }}>🌿 Forest Canopy</span>
                </div>
                {/* Soil */}
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '30%', background: 'linear-gradient(180deg, #3a2a1a 0%, #2a1a0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(var(--fg-rgb), 0.4)', textTransform: 'uppercase' }}>🏔️ Soil / Ground</span>
                </div>
                {/* Bedrock */}
                <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, height: '20%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(var(--fg-rgb), 0.3)', textTransform: 'uppercase' }}>⛰️ Bedrock</span>
                </div>
                {/* Penetration arrow */}
                <div style={{
                  position: 'absolute',
                  left: '70%',
                  top: '15%',
                  width: 4,
                  height: `${activeBand === 0 ? 10 : activeBand === 1 ? 17 : activeBand === 2 ? 24 : 29}%`,
                  background: `linear-gradient(180deg, ${BANDS[activeBand].color}, transparent)`,
                  borderRadius: 2,
                  transition: 'height 0.5s ease',
                  boxShadow: `0 0 15px ${BANDS[activeBand].color}50`
                }} />
                <div style={{
                  position: 'absolute',
                  left: 'calc(70% + 10px)',
                  top: '18%',
                  fontSize: '0.82rem',
                  color: BANDS[activeBand].color,
                  fontWeight: 700,
                  fontFamily: 'var(--font-num)',
                  writingMode: 'vertical-rl'
                }}>
                  CANOPY INTERACTION: {BANDS[activeBand].pen}
                </div>
                {/* SAR satellite icon */}
                <div style={{ position: 'absolute', left: 'calc(70% - 12px)', top: '8%', fontSize: '1.5rem' }}><Satellite size={24} /></div>
                <div style={{ position: 'absolute', right: 10, bottom: 8, color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', background: 'rgba(0,0,0,0.45)', padding: '4px 7px', borderRadius: 4 }}>Conceptual canopy interaction; not to scale</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ═══ SECTION 3: POLARIMETRY ═══ */}
        <div className="sar-section">
          <SectionTitle title="Polarization" subtitle="Polarization channels provide complementary clues about surface structure. NISAR's selected mode depends on the observation target; these cards explain channel notation, not a claim that every scene is quad-pol." />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--s4)' }}>
            {POL_CHANNELS.map((pol, i) => (
              <div
                key={pol.id}
                className="glass-panel hover-lift"
                onClick={() => setActivePol(i)}
                style={{
                  padding: 'var(--s4)',
                  cursor: 'pointer',
                  border: activePol === i ? `2px solid ${pol.color}` : '1px solid var(--glass-border)',
                  transition: 'all 0.3s',
                  boxShadow: activePol === i ? `0 0 30px ${pol.color}20` : 'var(--glass-shadow)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: pol.color, fontFamily: 'var(--font-num)' }}>{pol.id}</div>
                  <div style={{ fontSize: '0.76rem', color: pol.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pol.mechanism}</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>{pol.label}</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 'var(--s2)' }}>{pol.desc}</div>
                <div style={{ display: 'inline-block', padding: '3px 10px', background: `${pol.color}15`, border: `1px solid ${pol.color}30`, borderRadius: 'var(--r-full)', fontSize: '0.78rem', color: pol.color, fontWeight: 600 }}>
                  {pol.mechanism}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SECTION 4: InSAR PIPELINE ═══ */}
        <div id="insar" className="sar-section">
          <SectionTitle title="InSAR Processing Pipeline" subtitle="Repeat-pass interferometry can measure line-of-sight surface motion when phase remains coherent and topography, orbit, and atmospheric effects are handled. This is a processing overview, not a displacement result from our river analysis." />
          
          <div className="snake-grid">
            {INSAR_STEPS.map((step, i) => {
              // Snake layout: 1 2 3 / 6 5 4
              const row = Math.floor(i / 3);
              const pos = i % 3;
              const col = row % 2 === 0 ? pos : 2 - pos;
              const cls = ['snake-node', activeStep === i ? 'is-active' : '', row % 2 === 1 ? 'snake-node--rtl' : '', pos === 2 ? 'snake-node--end' : '', i === INSAR_STEPS.length - 1 ? 'snake-node--last' : ''].filter(Boolean).join(' ');
              return (
                <div key={i} className={cls} onClick={() => setActiveStep(i)} style={{ gridRow: row + 1, gridColumn: col + 1 }}>
                  <div className="snake-node__head">
                    <span className="snake-node__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="snake-node__icon">{step.icon}</span>
                  </div>
                  <div className="snake-node__title">{step.title}</div>
                  <div className="snake-node__desc">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        
        {/* ═══ SECTION 5: TEMPORAL COHERENCE MODEL ═══ */}
        <div className="sar-section">
          <SectionTitle title="Temporal Coherence Model" subtitle="Explore the first-order exponential temporal term γₜ = exp(−Δt / τ). This is a parameterized teaching model, not a land-cover prediction or NISAR measurement." />
          <GlassCard>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, .65fr)', gap: 'var(--s5)', alignItems: 'center' }}>
              <div style={{ minWidth: 0, background: 'rgba(var(--shadow-rgb), .25)', borderRadius: 'var(--r-md)', padding: 'var(--s3)' }}>
                <svg viewBox="0 0 720 300" role="img" aria-label={`Temporal coherence model curve with ${coherenceDays} day interval`} style={{ width: '100%', display: 'block' }}>
                  {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1="58" x2="700" y1={250 - v * 210} y2={250 - v * 210} stroke="rgba(255,255,255,.13)"/><text x="12" y={254 - v * 210} fill="#9aa8b7" fontSize="12">{v.toFixed(2)}</text></g>)}
                  <path d={Array.from({ length: 65 }, (_, i) => { const d = i; const g = Math.exp(-d / coherenceTau); return `${i ? 'L' : 'M'} ${58 + d * 10} ${250 - g * 210}`; }).join(' ')} fill="none" stroke="var(--water)" strokeWidth="4" />
                  <line x1={58 + coherenceDays * 10} x2={58 + coherenceDays * 10} y1="40" y2="250" stroke="var(--warn)" strokeDasharray="6 5" />
                  <circle cx={58 + coherenceDays * 10} cy={250 - Math.exp(-coherenceDays / coherenceTau) * 210} r="8" fill="var(--warn)" stroke="#fff" strokeWidth="2" />
                  <text x="360" y="286" fill="#c3ced8" fontSize="13" textAnchor="middle">Temporal separation Δt (days)</text>
                </svg>
              </div>
              <div style={{ display: 'grid', gap: 'var(--s4)' }}>
                <label style={{ color: 'var(--text-2)', fontSize: '.9rem' }}>Temporal separation Δt <strong style={{ float: 'right', color: 'var(--water)' }}>{coherenceDays} days</strong><input aria-label="Temporal separation in days" type="range" min="0" max="60" value={coherenceDays} onChange={e => setCoherenceDays(Number(e.target.value))} style={{ width: '100%' }}/></label>
                <label style={{ color: 'var(--text-2)', fontSize: '.9rem' }}>Illustrative time constant τ <strong style={{ float: 'right', color: 'var(--water)' }}>{coherenceTau} days</strong><input aria-label="Illustrative coherence time constant" type="range" min="3" max="90" value={coherenceTau} onChange={e => setCoherenceTau(Number(e.target.value))} style={{ width: '100%' }}/></label>
                <div style={{ padding: 'var(--s4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(var(--water-rgb),.2)', background: 'rgba(var(--water-rgb),.05)' }}><div style={{ color: 'var(--text-3)', fontSize: '.76rem', letterSpacing: '.08em' }}>MODELED TEMPORAL TERM</div><strong style={{ display: 'block', marginTop: 5, color: 'var(--water)', fontSize: '2rem', fontFamily: 'var(--font-num)' }}>{Math.exp(-coherenceDays / coherenceTau).toFixed(3)}</strong><span style={{ color: 'var(--text-3)', fontSize: '.8rem' }}>γₜ only · other coherence losses omitted</span></div>
                <div style={{ color: 'var(--text-3)', fontSize: '.82rem', lineHeight: 1.5 }}>Real interferometric coherence also depends on thermal noise, spatial baseline, coregistration, atmosphere, and scatterer changes. τ is a user-set scenario parameter, not a measured surface constant.</div>
              </div>
            </div>
          </GlassCard>
        </div>
{/* ═══ SECTION 6: WHY NISAR L-BAND MATTERS ═══ */}
        <div className="sar-section">
          <SectionTitle title="Complementary Radar Wavelengths" subtitle="L-band and C-band offer different sensitivities. Neither band guarantees a usable signal in every landscape or condition." />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
            <GlassCard style={{ borderLeft: '3px solid var(--warn)' }}>
              <h3 style={{ margin: '0 0 var(--s3) 0', color: 'var(--warn)', fontSize: '1.1rem' }}><XCircle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> C-band Limitations (Sentinel-1)</h3>
              <ul style={{ margin: 0, paddingLeft: 'var(--s4)', color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.8, listStyleType: "'– '" }}>
                <li>Shorter wavelength (about 5.6 cm) often interacts strongly with leaves and small branches</li>
                <li>Vegetation can decorrelate between repeat observations, depending on conditions</li>
                <li>Still valuable for land change, agriculture, ice, and deformation monitoring</li>
              </ul>
            </GlassCard>

            <GlassCard style={{ borderLeft: '3px solid var(--water)' }}>
              <h3 style={{ margin: '0 0 var(--s3) 0', color: 'var(--water)', fontSize: '1.1rem' }}><CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', margin: '0 4px' }} /> L-band Advantages (NISAR)</h3>
              <ul style={{ margin: 0, paddingLeft: 'var(--s4)', color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.8, listStyleType: "'✓ '" }}>
                <li>Longer wavelength (24 cm) can retain sensitivity to woody structure and sometimes ground beneath canopy</li>
                <li>Can maintain coherence longer than shorter wavelengths in some vegetated settings; it is not guaranteed</li>
                <li>Dual-polarization observations provide complementary surface information; mode varies by target</li>
                <li>Roughly 242 km swath and a 12-day repeat cycle support broad, regular coverage</li>
                <li>Supports ecosystem, soil moisture, ice, and surface deformation studies with appropriate methods</li>
              </ul>
            </GlassCard>
          </div>
        </div>

        
        {/* ═══ NEW: SweepSAR Beam Animation ═══ */}
        <FeatureSweepSAR />

        {/* ═══ THE SAR PIPELINE: FROM PHOTONS TO PIXELS ═══ */}
        <FeatureSARvsOptical />
        <FeatureFloodMechanisms />
          <FeatureRadarGeometry />
          <FeatureDielectric />
          <FeatureDualFrequency />
          <FeatureSpeckleFilter />
          <FeaturePauliRGB />
          <FeatureCloudePottier />
          <FeaturePipelineWalkthrough />
          <FeatureRadarViewer />

        {/* ═══ SECTION 7: ADVANCED SAR PHYSICS ═══ */}
        <div style={{ marginBottom: 'var(--s8)' }}>
          <SectionTitle title="Processing Concepts" subtitle="Interactive examples for threshold sensitivity and interferometric phase. Synthetic inputs are identified; only the change estimate above is drawn from the project manifest." />
          
          <div style={{ display: 'grid', gap: 'var(--s4)' }}>
            
            {/* Otsu Threshold */}
            <GlassCard>
              <h3 style={{ margin: '0 0 var(--s3) 0', color: 'var(--water)', fontSize: '1.2rem' }}>Threshold Sensitivity (synthetic histogram)</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: 'var(--s3)' }}>This generated histogram illustrates how a cutoff divides two overlapping backscatter populations. The slider is not running Otsu; water and land thresholds vary by scene and conditions.</p>
              
              <div style={{ position: 'relative', height: '150px', display: 'flex', alignItems: 'flex-end', gap: '2px', paddingBottom: '20px', borderBottom: '1px solid rgba(var(--fg-rgb), 0.1)' }}>
                {otsuData.map((d, i) => {
                  const isWater = d.db < otsuThreshold;
                  return (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: `${(d.count / Math.max(...otsuData.map(o => o.count))) * 100}%`,
                      background: isWater ? 'var(--water)' : 'var(--warn)',
                      opacity: 0.8
                    }} title={`${d.db.toFixed(1)} dB: ${d.count} pixels`} />
                  );
                })}
                {/* Threshold line overlay */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, top: 0, 
                  left: `${((otsuThreshold + 25) / 20) * 100}%`, 
                  width: '2px', background: '#fff', 
                  boxShadow: '0 0 8px #fff', zIndex: 10 
                }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginTop: 'var(--s4)' }}>
                <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-num)' }}>-25 dB</span>
                <input 
                  type="range" 
                  min="-25" max="-5" step="0.5" 
                  value={otsuThreshold} 
                  onChange={(e) => setOtsuThreshold(parseFloat(e.target.value))} 
                  style={{ flex: 1, accentColor: '#fff' }} 
                />
                <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-num)' }}>-5 dB</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--s3)' }}>
                <div style={{ color: 'var(--water)', fontWeight: 700 }}>Water Pixels: {otsuStats.water}</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-num)' }}>Threshold: {otsuThreshold.toFixed(1)} dB</div>
                <div style={{ color: 'var(--warn)', fontWeight: 700 }}>Land Pixels: {otsuStats.land}</div>
              </div>
            </GlassCard>

            {/* InSAR Fringes */}
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s3)' }}>
                <div>
                  <h3 style={{ margin: '0 0 var(--s2) 0', color: 'var(--erosion)', fontSize: '1.2rem' }}>InSAR Fringe Synthesizer</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: 0 }}>Synthetic wrapped phase: φ(x,y) = (4π/λ) × d<sub>LOS</sub>(x,y). L-band λ = 23.8 cm.</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Click on the canvas to set deformation center.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <canvas 
                    ref={insarCanvasRef}
                    width={400} 
                    height={300}
                    onClick={handleInsarClick}
                    style={{ width: '100%', height: 'auto', background: '#000', borderRadius: 'var(--r-md)', cursor: 'crosshair', border: '1px solid var(--glass-border)' }} 
                  />
                </div>
                
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                  <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '4px' }}>Peak line-of-sight displacement: {insarMaxDisp} cm</div>
                    <input type="range" min="1" max="20" step="0.5" value={insarMaxDisp} onChange={e => setInsarMaxDisp(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--erosion)' }} />
                  </div>
                  <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '4px' }}>Synthetic deformation radius: {insarRadius} m</div>
                    <input type="range" min="100" max="2000" step="100" value={insarRadius} onChange={e => setInsarRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--erosion)' }} />
                  </div>
                  
                  <div style={{ padding: 'var(--s3)', background: 'rgba(var(--fg-rgb), 0.05)', borderRadius: 'var(--r-md)', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '4px' }}>Calculated Fringes</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--erosion)', fontFamily: 'var(--font-num)' }}>
                      {(insarMaxDisp / (23.8 / 2)).toFixed(1)} <span style={{ fontSize: '1rem' }}>fringes</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            
</div>
        </div>

        {/* Footer */}
        <footer className="sar-lab__footer">
          <p className="sar-lab__footer-note">
            This educational module is part of <strong>FluviSAR</strong> — built for NASA Space Apps Challenge 2026, "Dancing with the SARs".
            Mission facts link to NASA/JPL and ESA references. Interactive models are labeled where they are schematic.
          </p>

          <div className="sar-lab__sources" aria-label="Scientific references — every link opens the cited source in a new tab">
            <span className="sar-lab__sources-hint">
              <ExternalLink size={11} aria-hidden="true" />
              Scientific references · all links live, open in a new tab
            </span>

            <div className="sar-lab__sources-row">
              <span className="sar-lab__sources-label">NISAR mission</span>
              <div className="sar-lab__sources-group">
                <SourceChip href="https://science.nasa.gov/mission/nisar/mission-overview/">NISAR mission overview</SourceChip>
                <SourceChip href="https://science.nasa.gov/mission/nisar/sweepsar/">SweepSAR</SourceChip>
                <SourceChip href="https://nisar.jpl.nasa.gov/mission/get-to-know-sar/polarimetry/">Polarimetry</SourceChip>
                <SourceChip href="https://nisar.jpl.nasa.gov/documents/26/NISAR_FINAL_9-6-19.pdf">NISAR Science Users’ Handbook</SourceChip>
                <SourceChip href="https://science.nasa.gov/mission/nisar/interferometry/">Interferometry</SourceChip>
              </div>
            </div>

            <div className="sar-lab__sources-row">
              <span className="sar-lab__sources-label">Flood applications</span>
              <div className="sar-lab__sources-group">
                <SourceChip href="https://svs.gsfc.nasa.gov/5661/">NISAR flood example · Mozambique</SourceChip>
                <SourceChip href="https://appliedsciences.nasa.gov/sites/default/files/2023-11/SAR_Part3.pdf">NASA ARSET · Flood mapping limits</SourceChip>
              </div>
            </div>

            <div className="sar-lab__sources-row">
              <span className="sar-lab__sources-label">Research papers</span>
              <div className="sar-lab__sources-group">
                <SourceChip href="https://www.mdpi.com/2072-4292/7/6/7447">H/α decomposition method</SourceChip>
                <SourceChip href="https://doi.org/10.1016/j.patrec.2025.02.021">Gamma speckle model</SourceChip>
                <SourceChip href="https://www.mdpi.com/2072-4292/12/16/2545">Temporal decorrelation model</SourceChip>
              </div>
            </div>

            <div className="sar-lab__sources-row">
              <span className="sar-lab__sources-label">ESA Biomass</span>
              <div className="sar-lab__sources-group">
                <SourceChip href="https://www.esa.int/Applications/Observing_the_Earth/FutureEO/Biomass">ESA BIOMASS</SourceChip>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}} />
    </div>
  );
}

