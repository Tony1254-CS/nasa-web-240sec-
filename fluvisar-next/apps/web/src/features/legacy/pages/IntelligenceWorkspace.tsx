import { DataChatButton } from '../../../components/DataChatButton';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BrainCircuit, Check, ChevronRight, Fingerprint, FlaskConical, Play, ShieldCheck, Waves, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspaceStore } from '../../../store/workspaceStore';
import { useObservatoryEvidence, readableDate as date } from '../../../data/evidence';
import { intelligenceModels, ORIGINAL, type Experiment } from '../data/intelligence';
import { DiagnosticControls, DIAGNOSTIC_DEFAULTS } from '../data/intelligenceControls';
import { IntelligenceObservations } from './IntelligenceObservations';
import { IntelligenceExperiments } from './IntelligenceExperiments';
import '../styles/impact-desk.css';
import '../styles/intelligence-workspace.css';

type Workspace='real'|'playground'|'robustness'|'evaluation';
const tabs:{id:Workspace;title:string;description:string;icon:typeof Waves;badge:string}[]=[
 {id:'real',title:'Real observations',description:'Inspect actual satellite evidence',icon:Waves,badge:'MEASURED'},
 {id:'playground',title:'Model playground',description:'Explore one input, compare two models',icon:BrainCircuit,badge:'SYNTHETIC'},
 {id:'robustness',title:'Robustness & review',description:'Test noise, novelty and review thresholds',icon:ShieldCheck,badge:'SYNTHETIC'},
 {id:'evaluation',title:'Model evaluation',description:'Inspect training, errors and sensitivity',icon:FlaskConical,badge:'SYNTHETIC'},
];
const steps=[
 {title:'Choose a scenario',body:'Try Stable bank, Open water, Flood pulse or Persistent change. These presets supply generated model inputs.',target:'.iw-presets'},
 {title:'Inspect a pixel',body:'Select a generated tile or feature-space point. The linked inspector shows the input used by both models.',target:'.iw-input-inspector'},
 {title:'Compare the models',body:'Read both class-score distributions. Agreement and disagreement describe these generated examples.',target:'.iw-model-comparison'},
 {title:'Add speckle noise',body:'Change effective looks and resample the simulation. Watch whether the class remains stable.',target:'.ml-speckle-probe'},
 {title:'Examine review decisions',body:'Adjust the score cutoff to see the generated holdout coverage/error trade-off. This is not a deployed auto-approval rule.',target:'.ml-review-control'},
];

export function IntelligencePage(){
 const {index,evidence,comparisonReady,comparisonError}=useObservatoryEvidence();
 const store=useWorkspaceStore();
 const [params,setParams]=useSearchParams();
 const [workspace,setWorkspace]=useState<Workspace>(()=>tabs.some(tab=>tab.id===params.get('view'))?params.get('view') as Workspace:'real');
 const [experiment,setExperiment]=useState<Experiment>(()=>structuredClone(ORIGINAL)),[message,setMessage]=useState(''),[guide,setGuide]=useState<number|null>(null);
 const [visited,setVisited]=useState<Workspace[]>([workspace]);
 const activate=(value:Workspace)=>{setWorkspace(value);setVisited(previous=>previous.includes(value)?previous:[...previous,value]);};
 const dates=useMemo(()=>[...evidence.observations].sort((a,b)=>a.date.localeCompare(b.date)),[evidence.observations]);
 const models=useMemo(()=>intelligenceModels(),[]);
 useEffect(()=>{
  const before=params.get('before'),after=params.get('after');
  if(before&&after&&before<after&&evidence.observations.some(o=>o.date===before)&&evidence.observations.some(o=>o.date===after)&&useWorkspaceStore.getState().selectedPair?.join('_')!==[before,after].join('_'))useWorkspaceStore.getState().setSelectedPair([before,after]);
 },[params,evidence.observations]);
 useEffect(()=>{
  if(guide===null)return;
  const timer=setTimeout(()=>document.querySelector(`.iw-tab-content:not([hidden]) ${steps[guide].target}`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'}),100);
  return()=>clearTimeout(timer);
 },[guide]);
 const navigate=(value:Workspace)=>{activate(value);setGuide(null);setParams(previous=>{const next=new URLSearchParams(previous);next.set('view',value);return next;},{replace:true});};
 const selectPair=(before:string,after:string)=>{if(before>=after)return;store.setSelectedPair([before,after]);setParams(previous=>{const next=new URLSearchParams(previous);next.set('before',before);next.set('after',after);return next;},{replace:true});};
 const nextGuide=()=>{if(guide===null)return;if(guide===4){setGuide(null);setMessage('Walkthrough complete. Your experiment remains available in all three model workspaces.');return;}const next=guide+1;setGuide(next);activate(next>=3?'robustness':'playground');};
 const diagnosticValues={...DIAGNOSTIC_DEFAULTS,inspectEpoch:models.bestEpoch,...experiment.diagnostics};
 return <div className="impact-desk intelligence-workspace"><main className="id-shell iw-shell" aria-busy={!comparisonReady}>
  <header className="iw-header"><div><div className="id-kicker"><span/>FLUVISAR / EXPLAINABLE SAR INTELLIGENCE</div><h1>ML Intelligence</h1><p>Understand the signal. Compare the models. Inspect the evidence.</p></div><button className="is-primary" onClick={()=>{activate('playground');setGuide(0);}}><Play size={15}/>Guided walkthrough</button></header>
  <div className="iw-context-bar"><div><span className="iw-origin measured">SENTINEL-1 RTC</span><b>{evidence.name}</b><label>Before<select aria-label="Intelligence comparison before date" value={evidence.pair[0]} onChange={event=>selectPair(event.target.value,evidence.pair[1])}>{dates.filter(o=>o.date<evidence.pair[1]).map(o=><option key={o.id} value={o.date}>{date(o.date)}</option>)}</select></label><ArrowRight size={14}/><label>After<select aria-label="Intelligence comparison after date" value={evidence.pair[1]} onChange={event=>selectPair(evidence.pair[0],event.target.value)}>{dates.filter(o=>o.date>evidence.pair[0]).map(o=><option key={o.id} value={o.date}>{date(o.date)}</option>)}</select></label></div><span>Analysis archive · {date(index.generated_at.slice(0,10))}</span></div>
  {(!comparisonReady||comparisonError)&&<div role="status" className="id-note">{comparisonError||'Loading the registered comparison. Images, measurements and exports follow the same pair.'}</div>}
  <nav className="iw-workspaces" role="tablist" aria-label="ML intelligence views">{tabs.map((tab,i)=><button key={tab.id} role="tab" id={`iw-tab-${tab.id}`} aria-controls={`iw-panel-${tab.id}`} aria-selected={workspace===tab.id} onClick={()=>navigate(tab.id)}><div><tab.icon size={19}/><span>{String(i+1).padStart(2,'0')}</span><em className={'iw-origin '+(tab.id==='real'?'measured':'synthetic')}>{tab.badge}</em></div><b>{tab.title}</b><small>{tab.description}</small><ChevronRight size={15} className="iw-tab-arrow"/></button>)}</nav>
  <div className="iw-workspace-context">{workspace!=='real'&&<DataChatButton subject="Synthetic model experiments"/>}<div><Fingerprint size={15}/><span>{workspace==='real'?'Recorded VV/VH observations and rule-based change screening.':'Generated HH-like scenarios: learn model mechanics and inspect failure cases.'}</span></div><span>{workspace==='real'?'Actual acquisitions · source-linked evidence':'RF + Temporal MLP · reproducible seeds'}</span></div>
  <section role="tabpanel" id="iw-panel-real" aria-labelledby="iw-tab-real" hidden={workspace!=='real'} className="iw-tab-content"><IntelligenceObservations evidence={evidence} ready={comparisonReady}/></section>
  <DiagnosticControls.Provider value={{values:diagnosticValues,onChange:(key,value)=>setExperiment(current=>({...current,diagnostics:{...current.diagnostics,[key]:value}}))}}>
   {(['playground','robustness','evaluation'] as const).map(value=><section key={value} role="tabpanel" id={`iw-panel-${value}`} aria-labelledby={`iw-tab-${value}`} hidden={workspace!==value} className="iw-tab-content">{visited.includes(value)&&<IntelligenceExperiments view={value} experiment={experiment} onChange={setExperiment} onMessage={setMessage} guided={workspace===value?guide:null} onGuideNext={nextGuide}/>}</section>)}
  </DiagnosticControls.Provider>
  <footer className="id-page-footer"><span><Fingerprint size={14}/>FLUVISAR · EVIDENCE FIRST</span><span>Measured observations and generated model experiments carry separate source labels.</span><a href="/reports">Methods & source records <ArrowRight size={13}/></a></footer>
 </main>{message&&<div className="id-toast" role="status"><Check size={16}/><span>{message}</span><button aria-label="Dismiss intelligence notification" onClick={()=>setMessage('')}><X size={16}/></button></div>}
 {guide!==null&&<aside className="iw-guide" aria-label="Intelligence guided walkthrough"><div className="iw-guide-progress">{steps.map((step,i)=><i key={step.title} className={i<=guide?'is-active':''}/>)}</div><div><span>Step {guide+1} of {steps.length}</span><h3>{steps[guide].title}</h3><p>{steps[guide].body}</p></div><button className="is-primary" onClick={nextGuide}>{guide===4?'Finish':'Next'}<ArrowRight size={15}/></button><button className="iw-guide-close" aria-label="Close guided walkthrough" onClick={()=>setGuide(null)}><X size={17}/></button></aside>}
 </div>;
}
