import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Check, ChevronLeft, Download, LoaderCircle, Maximize, Minimize, Map, MapPin, MessageSquare, Printer, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { useObservatoryEvidence, readableDate } from '../data/evidence';
import { downloadEvidence } from '../data/fieldEvidence';
import { useWorkspaceStore } from '../store/workspaceStore';
import { EVIDENCE_STAGES, useEvidenceWorkflow, type EvidenceStage } from '../store/evidenceWorkflowStore';
import { EvidenceStagePanels, type EvidenceResult } from './EvidenceStagePanels';
import '../styles/evidence-workbench.css';
import '../styles/evidence-report.css';
import '../styles/evidence-focus.css';
import '../styles/evidence-dashboard.css';

export function EvidenceWorkbench(){
 const workflow=useEvidenceWorkflow();const {evidence,comparisonReady,comparisonError}=useObservatoryEvidence();
 const {regionId,selectedPair,selectedFindingId,selectedOpticalPair}=useWorkspaceStore();
 const [results,setResults]=useState<Partial<Record<EvidenceStage,EvidenceResult>>>({}),[loading,setLoading]=useState(false),[error,setError]=useState(''),[complete,setComplete]=useState(false),[fieldCount,setFieldCount]=useState(0),[retry,setRetry]=useState(0);
 const [focused,setFocused]=useState(true),[presenting,setPresenting]=useState(false),[presentationError,setPresentationError]=useState('');
 const [readingView,setReadingView]=useState(false);
 const [mapPreview,setMapPreview]=useState(true);
 const ownsFullscreen=useRef(false);
 useEffect(()=>{if(workflow.open){setFocused(workflow.guided);setMapPreview(true);setPresentationError('');}},[workflow.open,workflow.session]);
 useEffect(()=>{const changed=()=>{const active=Boolean(document.fullscreenElement)&&ownsFullscreen.current;setPresenting(active);if(!document.fullscreenElement)ownsFullscreen.current=false;};document.addEventListener('fullscreenchange',changed);return()=>{document.removeEventListener('fullscreenchange',changed);if(ownsFullscreen.current&&document.fullscreenElement)void document.exitFullscreen().catch(()=>{});};},[]);
 useEffect(()=>{if(!workflow.open&&ownsFullscreen.current&&document.fullscreenElement)void document.exitFullscreen().catch(()=>{});},[workflow.open]);
 const togglePresentation=async()=>{setPresentationError('');try{if(ownsFullscreen.current&&document.fullscreenElement){await document.exitFullscreen();}else{setFocused(true);await document.documentElement.requestFullscreen();ownsFullscreen.current=true;setPresenting(true);}}catch{setPresentationError('Fullscreen is unavailable. Focus mode is still active; you can use your browser fullscreen control.');}};
 const dialog=useRef<HTMLElement>(null),content=useRef<HTMLDivElement>(null);const previousFocus=useRef<HTMLElement|null>(null);
 const context=regionId+'|'+(selectedPair??evidence.pair).join('|')+'|'+(selectedFindingId??'region')+'|'+(selectedOpticalPair??[]).join('|');
 const stageIndex=EVIDENCE_STAGES.findIndex(stage=>stage.id===workflow.stage),current=results[workflow.stage];
 useEffect(()=>{workflow.bindContext(context);},[context]);
 useEffect(()=>{setResults({});setError('');setComplete(false);setFieldCount(0);},[context,workflow.session]);
 useEffect(()=>{
  if(!workflow.open)return;previousFocus.current=document.activeElement as HTMLElement;dialog.current?.focus();
  return()=>previousFocus.current?.focus();
 },[workflow.open]);
 useEffect(()=>{
  if(!workflow.open||!comparisonReady)return;
  let active=true;const controller=new AbortController();setLoading(true);setError('');setComplete(false);content.current?.scrollTo({top:0});
  const params=new URLSearchParams();if(selectedFindingId)params.set('finding_id',selectedFindingId);
  if(selectedOpticalPair){params.set('optical_before',selectedOpticalPair[0]);params.set('optical_after',selectedOpticalPair[1]);}
  fetch('/api/runs/'+encodeURIComponent(evidence.run_id)+'/evidence/'+workflow.stage+'?'+params,{signal:controller.signal})
   .then(async response=>{if(!response.ok){const message=await response.json().catch(()=>({detail:'Evidence service connection interrupted'}));throw new Error(message.detail??'Evidence review interrupted');}return response.json() as Promise<EvidenceResult>;})
   .then(result=>{if(active)setResults(previous=>({...previous,[workflow.stage]:result}));})
   .catch(cause=>{if(active)setError(cause instanceof Error?cause.message:String(cause));})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;controller.abort();};
 },[workflow.open,workflow.stage,workflow.session,context,comparisonReady,evidence.run_id,retry]);
 if(!workflow.open)return null;
 const exportReview=()=>downloadEvidence(evidence.run_id+'-evidence-review.json',{version:1,exported_at:new Date().toISOString(),region_id:regionId,run_id:evidence.run_id,pair:evidence.pair,finding_id:selectedFindingId,
  stages:results,field_observations_on_device:fieldCount,interpretation:'Review completion is not independent confirmation of erosion, inundation or damage.'});
 const keyboard=(event:KeyboardEvent)=>{
  if(event.key==='Escape'){const detail=focused?dialog.current?.querySelector('details.ew-extra-details[open],details.ew-audit-details[open],details.ew-saved-details[open],.ew-checks details[open]'):null;if(detail){detail.removeAttribute('open');event.preventDefault();return;}workflow.close();return;}
  if(focused&&event.key==='Tab'){const items=dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,summary,[tabindex="0"]');if(items?.length){const first=items[0],last=items[items.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
 };
 return <section className={'evidence-workbench'+(focused?' is-focus':'')+(focused&&mapPreview?' has-map-context':'')+(readingView?' is-reading-view':'')+(presenting?' is-presenting':'')} role="dialog" aria-modal="false" aria-label={workflow.guided?'Live Analysis':'Evidence workspace'} tabIndex={-1} ref={dialog} onKeyDown={keyboard}>
  <header className="ew-toolbar"><div><h2>{workflow.guided?'Full Analysis Report':'Evidence Report'}</h2></div><div className="ew-report-actions">{focused&&<button className="ew-reading-toggle" aria-label={readingView?'Fit step to screen':'Comfortable reading view'} aria-pressed={readingView} onClick={()=>setReadingView(!readingView)}><Minimize size={15}/><span>{readingView?'Fit step':'Reading view'}</span></button>}{focused&&<button className="ew-map-preview-toggle" aria-label={mapPreview?'Hide small map':'Show small map'} aria-pressed={mapPreview} onClick={()=>setMapPreview(!mapPreview)}><MapPin size={15}/><span>{mapPreview?'Hide preview':'Show preview'}</span></button>}<button aria-label={focused?'View map alongside analysis':'Expand analysis'} onClick={()=>setFocused(!focused)}>{focused?<Map size={15}/>:<Maximize size={15}/>}<span>{focused?'View map':'Focus analysis'}</span></button><button aria-label={presenting?'Exit presentation':'Presentation mode'} onClick={()=>void togglePresentation()}>{presenting?<Minimize size={15}/>:<Maximize size={15}/>}<span>{presenting?'Exit presentation':'Present'}</span></button><button aria-label="Chat with Data" onClick={()=>{window.dispatchEvent(new CustomEvent('fluvisar-chat-inspect',{detail:{root:'.evidence-workbench',subject:({detect:'Change area summary',investigate:'Water area history',challenge:'Threshold sensitivity',explain:'Quality checks and reliability',field:'How to use field observations',impact:'Mapped asset exposure'})[workflow.stage]}}));}}><MessageSquare size={15}/><span>Chat with Data</span></button><button aria-label="Print report or save PDF" onClick={()=>window.print()}><Printer size={15}/><span>Save PDF</span></button><button aria-label="Close evidence workspace" title="Return to map" onClick={workflow.close}><X size={19}/></button></div></header>
  <details className="ew-context"><summary><b>{evidence.name}</b><span>{evidence.pair.map(readableDate).join(' → ')} · Sentinel-1</span></summary><code>{selectedFindingId??'Entire radar pair'}</code><small>Registered comparison context</small></details>
  <nav className="ew-tabs" role="tablist" aria-label="Evidence stages">{EVIDENCE_STAGES.map((stage,index)=><button key={stage.id} role="tab" aria-selected={workflow.stage===stage.id} aria-controls="evidence-stage-content" id={'evidence-tab-'+stage.id} disabled={workflow.guided&&index>stageIndex&&!results[stage.id]} onClick={()=>{workflow.select(stage.id);setComplete(false);}} title={stage.hint}><span>{results[stage.id]?<Check size={12}/>:index+1}</span>{stage.label}</button>)}</nav>
  <div className="ew-body" ref={content} id="evidence-stage-content" role="tabpanel" aria-labelledby={'evidence-tab-'+workflow.stage}>
   {presentationError&&<p role="status" className="ew-note">{presentationError}</p>}
   {complete?<div className="ew-completion"><span className="ew-completion-icon"><ShieldCheck size={32}/></span><h3>Evidence review complete.</h3><p>You reviewed all six stages for {evidence.name}. The result remains a screening candidate; field confirmation and damage assessment are separate.</p><div className="ew-summary-list">{EVIDENCE_STAGES.map(stage=><button key={stage.id} onClick={()=>{setComplete(false);workflow.select(stage.id);}}><Check size={15}/><b>{stage.label}</b><span>{stage.id==='field'?fieldCount+' saved field observations':results[stage.id]?.status}</span></button>)}</div><button className="ew-primary" onClick={exportReview}><Download size={15}/>Export evidence review</button></div>:<>
    <div className="ew-stage-heading"><span className="ew-kicker">STEP {stageIndex+1} OF 6</span><span className={'ew-status is-'+(loading?'processing':current?.status??'review')}>{loading?'Processing actual evidence':current?.status??'Preparing'}</span></div>
    {(loading||!comparisonReady)&&<div className="ew-processing" role="status"><LoaderCircle size={24}/><b>{!comparisonReady?'Opening the selected pair…':'Reviewing '+EVIDENCE_STAGES[stageIndex].label.toLowerCase()+' evidence…'}</b><p>{workflow.stage==='impact'?'Reading the archived asset geometry and reference land cover.':'Reading registered source artifacts for this region, pair and scope.'}</p></div>}
    {(error||comparisonError)&&<div className="ew-error" role="alert"><b>Evidence review interrupted</b><p>{error||comparisonError}</p><button onClick={()=>setRetry(value=>value+1)}>Retry this stage</button></div>}
    {current&&!loading&&comparisonReady&&!error&&<><EvidenceStagePanels result={current} evidence={evidence} findingId={selectedFindingId} onFieldCount={setFieldCount} onViewMap={()=>setFocused(false)}/><details className="ew-audit-details"><summary><ShieldCheck size={15}/>{current.logs.length} recorded analysis checks<span>View processing details</span></summary><div className="ew-terminal" aria-label="Recorded analysis checks">{current.logs.map((log,index)=><div key={log}><span>{String(index+1).padStart(2,'0')}</span><Check size={12}/>{log}</div>)}<small>Computed {new Date(current.computed_at).toLocaleTimeString()} · {current.scope}</small></div></details></>}
   </>}
  </div>
  <footer className="ew-footer"><span className="ew-scroll-hint">Details available in each step</span><button className="ew-secondary" onClick={()=>workflow.launch('detect',true)}><RotateCcw size={14}/>Restart</button>{complete?<button className="ew-primary" onClick={workflow.close}>Return to map <ArrowRight size={14}/></button>:workflow.guided?<><button className="ew-secondary" disabled={stageIndex===0||loading} onClick={()=>workflow.select(EVIDENCE_STAGES[stageIndex-1].id)}><ChevronLeft size={14}/>Back</button><button className="ew-primary" disabled={loading||!current||Boolean(error)||!comparisonReady} onClick={()=>{if(stageIndex===5)setComplete(true);else workflow.select(EVIDENCE_STAGES[stageIndex+1].id);}}>{stageIndex===5?'Complete Analysis':'Proceed to '+EVIDENCE_STAGES[stageIndex+1].label}<ArrowRight size={14}/></button></>:<button className="ew-primary" disabled={!current||loading} onClick={exportReview}><Download size={14}/>Export evidence</button>}</footer>
 </section>;
}
