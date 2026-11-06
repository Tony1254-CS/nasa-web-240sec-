import { ExternalLink, Radio, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { readableDate, useEvidence } from '../data/evidence';
export function PageIntro({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children?:ReactNode}) {
  return <header className="science-hero"><div className="science-hero-rings"/><span className="science-eyebrow"><Radio size={13}/>{eyebrow}</span><h1>{title}</h1><p>{description}</p>{children}</header>;
}
export function MetricCard({label,value,unit,detail}:{label:string;value:string|number;unit?:string;detail:string}) {
  return <article className="science-card metric-card"><span className="science-eyebrow">{label}</span><strong>{value}<small>{unit}</small></strong><p>{detail}</p></article>;
}
export function SourceList() {
  const {evidence}=useEvidence();
  return <section className="science-card source-list"><div className="section-heading"><ShieldCheck size={17}/><h2>Trace every observation</h2><span className="science-tag">COPERNICUS · SENTINEL-1 RTC</span></div>{evidence.observations.map(observation=><a key={observation.id} href={observation.source_url} target="_blank" rel="noreferrer"><div><b>{observation.sensor} · {readableDate(observation.datetime)}</b><code>{observation.id}</code></div><ExternalLink size={16}/></a>)}<p>Downloaded scene data, numerical processing and local artifact hashes are recorded in the exported manifest.</p></section>;
}
export function QualityChecks() {
  const {evidence}=useEvidence();
  return <div className="quality-grid">{evidence.qc.map(check=><article className="science-card" key={check.id}><span className={`science-tag ${check.status==='pass'?'is-pass':'is-warn'}`}>{check.status.replaceAll('-',' ')}</span><h3>{check.name}</h3><p>{check.reason}</p></article>)}</div>;
}
