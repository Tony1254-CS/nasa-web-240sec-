import '../styles/atlas.css';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowUpRight,MapPin,Globe2,ShieldCheck,Radio,Layers,ClipboardCheck,SlidersHorizontal} from 'lucide-react';
import {PageIntro} from './EvidenceUI';
import {useEvidence,number,readableDate} from '../data/evidence';
import {useWorkspaceStore} from '../store/workspaceStore';
import {AtlasOutlook} from './AtlasOutlook';

export function AtlasHero(){
 const {index}=useEvidence(),regions=Object.values(index.regions);
 return <PageIntro eyebrow="REGIONAL ATLAS" title="Two landscapes. Real observations." description="Choose a study area to inspect downloaded radar scenes, processing results and source records."><div className="atlas-hero-stats"><div><b>{regions.length}</b><span>study areas</span></div><div><b>{regions.reduce((n,r)=>n+r.observations.length,0)}</b><span>radar passes</span></div><div><b>{regions.reduce((n,r)=>n+(r.optical_observations?.length??0),0)}</b><span>optical scenes</span></div></div><a className="atlas-hero-scroll" href="#atlas-investigations">Choose your investigation <ArrowUpRight size={15}/></a></PageIntro>;
}
export function AtlasView(){
 const {index}=useEvidence(),navigate=useNavigate();
 const regions=Object.values(index.regions);
 return <div className="atlas-content">
  <section id="atlas-investigations" aria-labelledby="atlas-cases-title"><header className="atlas-section-heading"><div><span className="atlas-kicker"><Globe2 size={15}/>ACTIVE INVESTIGATIONS</span><h2 id="atlas-cases-title">Pick a landscape. Follow the evidence.</h2><p>Explore the location, recorded changes and quality checks before opening its observatory.</p></div><span className="atlas-section-label">BANGLADESH / SENTINEL-1 + SENTINEL-2</span></header>
   <div className="atlas-cards">{regions.map(region=>{
    const radar=[...region.observations].sort((a,b)=>a.date.localeCompare(b.date)),optical=[...(region.optical_observations??[])].sort((a,b)=>a.cloud_fraction-b.cloud_fraction),photo=optical[0];
    const passed=region.qc.filter(q=>q.status==='pass').length,failed=region.qc.some(q=>q.status==='fail'),review=region.qc.length-passed;
    const status=failed?'QC failed':review?'Review needed':'QC passed';
    const open=()=>{useWorkspaceStore.getState().setRegion(region.region_id);navigate('/observatory/'+region.region_id);};
    return <article className="science-card atlas-case-card" key={region.region_id}>
     <div className="atlas-case-image">{photo&&<img src={String(photo.roi_url??photo.url)} alt={region.region_id==='jamuna'?'Recorded satellite view of the braided Jamuna River':'Recorded satellite view of the Sundarbans estuary'} loading="lazy"/>}<span className="atlas-photo-credit">Sentinel-2 · {photo?readableDate(photo.date):''}</span><span className={'atlas-case-status '+(failed?'is-fail':review?'is-review':'is-pass')}><ShieldCheck size={13}/>{status}</span></div>
     <div className="atlas-case-body"><span className="science-eyebrow"><MapPin size={13}/>{region.region_id==='jamuna'?'BRAIDED RIVER':'MANGROVE ESTUARY'} · SOUTH ASIA</span><h2>{region.name}</h2><p className="atlas-case-description">{region.region_id==='jamuna'?'Trace changing water and exposed land across a braided river. Inspect transition candidates, challenge thresholds and plan field verification.':'Read changing water and shoreline signals in a tidal mangrove landscape. Compare radar and optical evidence before interpreting habitat change.'}</p>
     <div className="atlas-change-totals"><div><i/>Land → water<b>{number(region.metrics.land_to_water_ha,2)}<small>ha</small></b></div><div><i/>Water → land<b>{number(region.metrics.water_to_land_ha,2)}<small>ha</small></b></div></div>
     <p className="atlas-case-pair">Measured radar pair · {region.pair.map(readableDate).join(' → ')}</p><dl className="science-facts"><div><dt>Common valid support</dt><dd>{number(region.metrics.common_valid_fraction*100)}%</dd></div><div><dt>Processed area</dt><dd>{number(region.metrics.common_valid_area_ha)} ha</dd></div><div><dt>Sensor</dt><dd>{region.observations[0].sensor}</dd></div></dl>
     <div className="atlas-case-actions"><button className="science-button" onClick={open}>Open observatory <ArrowUpRight size={15}/></button><button className="science-button secondary" onClick={()=>{useWorkspaceStore.getState().setRegion(region.region_id);navigate('/impact');}}>Decision context</button></div>
     <details className="atlas-case-details"><summary>Case details, dates & source records</summary><dl><div><dt>Study bounds · W, S, E, N</dt><dd>{region.bbox.map(n=>n.toFixed(3)).join(', ')}</dd></div><div><dt>Retained radar archive</dt><dd>{radar.length} passes · {readableDate(radar[0].date)}–{readableDate(radar.at(-1)!.date)}</dd></div><div><dt>Retained optical archive</dt><dd>{optical.length} dated scenes</dd></div><div><dt>Catalogue generated</dt><dd>{readableDate(index.generated_at)}</dd></div><div><dt>Quality checks</dt><dd>{passed} pass · {review} require review</dd></div></dl><div className="atlas-case-checks">{region.qc.map(q=><p key={q.id}><b>{q.name} · {q.status}</b><span>{q.reason}</span></p>)}</div><div className="atlas-input-sources">{radar.map(o=><a key={o.id} href={o.source_url} target="_blank" rel="noreferrer"><span>{readableDate(o.date)} · {number(o.water_area_ha,2)} ha water</span><code>{o.id}</code><ArrowUpRight size={13}/></a>)}</div><p className="atlas-case-limit">These are screening candidates. Tides, stage, surface roughness and vegetation need independent context before a permanent erosion or habitat-loss claim.</p></details>
     </div>
    </article>;
   })}</div>
  </section>
  <AtlasOutlook/>
  <section className="atlas-workflow" aria-labelledby="atlas-workflow-title"><header className="atlas-section-heading"><div><span className="atlas-kicker"><Layers size={15}/>FROM SIGNAL TO REVIEW</span><h2 id="atlas-workflow-title">A finding should survive questions.</h2><p>Open the measured comparison, inspect its lineage and take the evidence into a review.</p></div><Link to="/reports" className="science-text-link">Methods & source manifests <ArrowUpRight size={15}/></Link></header><div className="atlas-workflow-grid">{[{icon:Radio,title:'01 / Observe',body:'Six same-orbit radar passes and six dated optical scenes per study area. Dates and sensor identities stay attached.'},{icon:SlidersHorizontal,title:'02 / Challenge',body:'Inspect common support and water-threshold sensitivity. Distinguish a stable signal from a fragile interpretation.'},{icon:ClipboardCheck,title:'03 / Verify',body:'Review a finding, record a field observation and export its geometry, source passport and decision brief.'}].map(step=><article key={step.title}><step.icon size={23}/><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>
  <section className="atlas-verdict-guide"><ShieldCheck size={25}/><div><h3>How evidence status works</h3><p>Statuses below describe the retained processing checks. They do not certify a flood, permanent erosion or mangrove loss.</p><div className="atlas-verdict-items"><span><i/>QC passed · all recorded checks pass</span><span><i/>Review needed · at least one warning</span><span><i/>QC failed · a recorded check fails</span></div></div></section>
  <footer className="atlas-footer"><span>FluviSAR · NASA Space Apps Challenge 2026</span><Link to="/reports">Full methods</Link><a href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar" target="_blank" rel="noreferrer">NASA SAR reference <ArrowUpRight size={13}/></a></footer>
 </div>;
}
