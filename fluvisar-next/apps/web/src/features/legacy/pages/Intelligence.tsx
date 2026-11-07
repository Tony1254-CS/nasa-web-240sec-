import { analysisImage, reachForRegion, isoDate } from '../../../data/analysisRegistry';
import { useWorkspaceStore } from '../../../store/workspaceStore';
import { AlertTriangle, ArrowRight, BrainCircuit, Check, CircleHelp, ExternalLink, Radio, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDiagnosticControl } from '../data/intelligenceControls';

import { loadReachBundle, type ReachBundle } from '../data/load';
import type { ChangeFeature, QCCheck } from '../data/types';

import { confusionMatrix, createSyntheticSamples, DEMO_CLASSES, permutationImportance, splitSyntheticSamples, trainSyntheticForest, type DemoClass, type DemoClassifier, type SarFeatures, type SarSample } from './sarForestDemo';
import { trainTemporalMlp, type LossPoint } from './temporalMlpDemo';
import { simulateSpeckleStress } from './sarSpeckleDemo';
import { assessFeatureNovelty, simulateSarTimeSeries } from './sarAdvancedDiagnostics';

const CLASS_COLORS: Record<DemoClass, string> = {
  'Stable land': '#56c8d8', 'Open water': '#7588ff', 'Seasonal inundation': '#e7b45d', 'Persistent transition candidate': '#ef745c',
};
const QC_STATUS: Record<QCCheck['status'], string> = { PASS: 'Pass', WARN: 'Review', FAIL: 'Fail', NOT_EVALUATED: 'Not evaluated', INFO: 'Context' };
function fmt(value: number, digits = 1) { return new Intl.NumberFormat('en', { maximumFractionDigits: digits }).format(value); }
function utcDate(value: string) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value)); }
function compactDate(value: string) { return value.replace(/-/g, '').slice(0, 8); }

// γ⁰ is power: interpolate linear power before converting the illustrative blend back to dB.
function blendGamma0Db(beforeDb: number, eventDb: number, persistence: number) {
  const beforePower=10**(beforeDb/10), eventPower=10**(eventDb/10);
  return 10*Math.log10(beforePower*(1-persistence)+eventPower*persistence);
}

function getPrediction(model: DemoClassifier, features: SarFeatures) {
  const scores = model.predict(features);
  const label = DEMO_CLASSES.reduce((winner, current) => scores[current] > scores[winner] ? current : winner, DEMO_CLASSES[0]);
  return { scores, label };
}

function scoreEntropy(scores: Record<DemoClass, number>) {
  const entropy = DEMO_CLASSES.reduce((sum, label) => sum - (scores[label] > 0 ? scores[label] * Math.log(scores[label]) : 0), 0);
  return entropy / Math.log(DEMO_CLASSES.length);
}

export type ScenePerturbation = { eventDb: number; stageShift: number; persistenceShift: number };
function perturb(features: SarFeatures, scene: ScenePerturbation): SarFeatures {
  return [features[0], Math.max(-28,Math.min(-2,features[1]+scene.eventDb)), Math.max(0,Math.min(1,features[2]+scene.stageShift)), Math.max(0,Math.min(1,features[3]+scene.persistenceShift))];
}

function SceneControls({ scene, onChange }: { scene: ScenePerturbation; onChange: (next: ScenePerturbation) => void }) {
  const controls:[keyof ScenePerturbation,string,number,number,number,string][]=[
    ['eventDb','Scene-wide T1 backscatter offset',-6,6,.1,' dB'],
    ['stageShift','Stage-difference shift',-.4,.4,.01,''],
    ['persistenceShift','Later-water persistence shift',-.5,.5,.01,''],
  ];
  return <section className="ml-panel ml-scene-controls"><div className="ml-panel-head"><div><span className="ml-overline">SCENE PERTURBATION</span><h2>What-if controls</h2></div><span className="ml-live-dot">LIVE</span></div><p className="ml-panel-desc">Apply controlled offsets to every generated pixel across the scenario tile.</p><div className="ml-scene-control-grid">{controls.map(([key,label,min,max,step,suffix])=><label className="ml-slider" key={key}><span><b>{label}</b><output>{scene[key].toFixed(key==='eventDb'?1:2)}{suffix}</output></span><input type="range" min={min} max={max} step={step} value={scene[key]} onChange={(event)=>onChange({...scene,[key]:Number(event.target.value)})}/></label>)}</div></section>;
}

function ScenarioCube({ samples, model, modelName, selected, onSelect, scene }: { samples: SarSample[]; model: DemoClassifier; modelName: string; selected: SarFeatures; onSelect: (features: SarFeatures) => void; scene: ScenePerturbation }) {
  const columns=26, rows=13;
  const cells=Array.from({length:columns*rows},(_,index)=>{
    const column=index%columns, row=Math.floor(index/columns);
    const center=6.2+1.65*Math.sin(column*.25)+.65*Math.sin(column*.72);
    const distance=Math.abs(row-center);
    let target:DemoClass='Stable land';
    if(distance<1.05)target='Open water';
    else if(distance<2.05){const transition=(column>=7&&column<=13&&row<center)||(column>=18&&column<=23&&row>center);target=transition?'Persistent transition candidate':'Seasonal inundation';}
    const candidates=samples.filter((sample)=>sample.y===target);
    const sample=candidates[index%candidates.length]??samples[index%samples.length];
    const features=perturb(sample.x,scene);
    const prediction=getPrediction(model,features);
    return {column,row,sample,features,target,prediction,entropy:scoreEntropy(prediction.scores)};
  });
  const frame=(kind:'t0'|'t1'|'t2'|'class'|'entropy',title:string)=><article className="ml-cube-frame" key={kind}><div className="ml-cube-frame-head"><b>{title}</b><span>{kind==='class'?modelName:kind==='entropy'?'normalized class-score entropy':kind.toUpperCase()}</span></div><svg viewBox="0 0 390 230" role="img" aria-label={`${title}, schematic generated scenario visualization`}><rect x="4" y="4" width="382" height="210" rx="7" fill="#0c151e" stroke="rgba(132,191,204,.2)"/><path d="M9 161 C74 122 112 163 168 132 S264 94 300 126 354 153 381 106" fill="none" stroke="rgba(58,95,147,.14)" strokeWidth="38"/>{cells.map((cell,index)=>{const db=kind==='t0'?cell.features[0]:kind==='t1'?cell.features[1]:blendGamma0Db(cell.features[0],cell.features[1],cell.features[3]);const intensity=Math.max(.08,Math.min(.92,.12+(db+25)/25*.78));const isSelected=cell.features.every((v,i)=>Math.abs(v-selected[i])<.001);const color=kind==='class'?CLASS_COLORS[cell.prediction.label]:kind==='entropy'?`hsl(${Math.round(212-cell.entropy*130)} 82% ${Math.round(30+cell.entropy*34)}%)`:`hsl(190 45% ${Math.round(12+intensity*56)}%)`;return <rect key={index} x={9+cell.column*14.25} y={9+cell.row*15.4} width="12.2" height="13.2" rx="1.2" fill={color} opacity={kind==='entropy'?.35+cell.entropy*.65:.78} stroke={isSelected?'#fff':kind==='class'&&cell.prediction.label!==cell.target?'#f0d28b':'rgba(7,12,17,.7)'} strokeWidth={isSelected?2:kind==='class'&&cell.prediction.label!==cell.target?1.2:.45} role="button" tabIndex={0} aria-label={`Generated pixel: ${kind==='class'?`reference ${cell.target}, prediction ${cell.prediction.label}`:kind==='entropy'?`normalized score entropy ${cell.entropy.toFixed(2)}`:`HH backscatter ${db.toFixed(1)} decibels`}. Select pixel`} onClick={()=>onSelect(cell.sample.x)} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' ')onSelect(cell.sample.x);}}/>;})}<text x="11" y="226" className="ml-tile-label">{kind==='class'?'GOLD OUTLINE = LABEL / OUTPUT DIFFER':kind==='entropy'?'BRIGHTER = MORE CLASS-SCORE SPREAD':'LOW RETURN ← HH BACKSCATTER → HIGH RETURN'}</text></svg></article>;
  return <section className="ml-panel ml-tile-panel"><div className="ml-panel-head"><div><span className="ml-overline">SCENARIO STACK · INFERENCE</span><h2>Follow a pixel through the model</h2></div><span className="ml-live-dot">CLICK ANY PIXEL</span></div><p className="ml-panel-desc">Three generated HH observations linked to {modelName} outputs. Gold outlines mark label disagreement.</p><div className="ml-cube-subhead"><span>INPUT SEQUENCE · HH γ⁰</span><span>T0 → T1 → T2</span></div><div className="ml-cube-frames">{frame('t0','T0 · BEFORE')}{frame('t1','T1 · EVENT')}{frame('t2','T2 · FOLLOW-UP')}</div><div className="ml-cube-subhead ml-output-subhead"><span>ACTIVE MODEL · {modelName.toUpperCase()}</span><span>CLASS MAP + SCORE SPREAD</span></div><div className="ml-cube-frames ml-cube-frames--outputs">{frame('class','PREDICTED CLASS')}{frame('entropy','SCORE ENTROPY')}</div><div className="ml-legend ml-tile-legend">{DEMO_CLASSES.map((label)=><span key={label}><i style={{backgroundColor:CLASS_COLORS[label]}}/>{label}</span>)}</div></section>;
}

function FeatureSpace({ samples, selected, onSelect, scene }: { samples: SarSample[]; selected: SarFeatures; onSelect: (features: SarFeatures) => void; scene: ScenePerturbation }) {
  const px=(db:number)=>45+((db+28)/26)*390;
  const py=(delta:number)=>210-((delta+22)/28)*165;
  const transformed=samples.map((sample)=>({sample,features:perturb(sample.x,scene)}));
  const selectedEffective=perturb(selected,scene);
  return <section className="ml-panel ml-feature-space"><div className="ml-panel-head"><div><span className="ml-overline">FEATURE SPACE</span><h2>Backscatter change distribution</h2></div></div><p className="ml-panel-desc">Click a point to load it into the pixel inspector.</p><svg viewBox="0 0 480 270" role="img" aria-label="Generated examples plotted by pre-event backscatter and backscatter change">{[0,1,2,3].map((i)=><g key={i}><line x1="45" y1={45+i*50} x2="445" y2={45+i*50} className="ml-chart-grid"/><text x="39" y={49+i*50} textAnchor="end" className="ml-chart-label">{5-i*8} dB</text></g>)}{transformed.filter((_,i)=>i%3===0).map(({sample,features},index)=><circle key={index} cx={px(features[0])} cy={py(features[1]-features[0])} r="3.3" fill={CLASS_COLORS[sample.y]} opacity=".52" role="button" tabIndex={0} onClick={()=>onSelect(sample.x)} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' ')onSelect(sample.x);}}/>)}<circle cx={px(selectedEffective[0])} cy={py(selectedEffective[1]-selectedEffective[0])} r="8" fill="#fff" stroke="#101820" strokeWidth="3"/><line x1="45" y1="210" x2="445" y2="210" className="ml-chart-axis"/><line x1="45" y1="45" x2="45" y2="210" className="ml-chart-axis"/><text x="245" y="253" textAnchor="middle" className="ml-chart-caption">PRE-EVENT HH γ⁰ (dB)</text><text x="13" y="132" textAnchor="middle" transform="rotate(-90 13 132)" className="ml-chart-caption">POST − PRE (dB)</text></svg><div className="ml-legend">{DEMO_CLASSES.map((label)=><span key={label}><i style={{backgroundColor:CLASS_COLORS[label]}}/>{label}</span>)}</div></section>;
}

function TemporalTraining({ history, bestEpoch }: { history: LossPoint[]; bestEpoch: number }) {
  const [inspectEpoch,setInspectEpoch]=useDiagnosticControl('inspectEpoch',bestEpoch);
  const losses = history.flatMap((point) => [point.train, point.validation]);
  const min = Math.max(0, Math.min(...losses) - .05);
  const max = Math.max(...losses) + .05;
  const x = (index: number) => 38 + (history.length <= 1 ? 0 : index / (history.length - 1)) * 426;
  const y = (value: number) => 183 - ((value - min) / Math.max(.01, max - min)) * 142;
  const train = history.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(point.train)}`).join(' ');
  const validation = history.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(point.validation)}`).join(' ');
  const active=history[Math.max(0,Math.min(history.length-1,inspectEpoch-1))]??history[0];
  const selectEpoch=(clientX:number,left:number,width:number)=>{
    const plotX=((clientX-left)/width)*500;
    const index=Math.round(Math.max(0,Math.min(1,(plotX-38)/426))*(history.length-1));
    setInspectEpoch(index+1);
  };
  return <section className="ml-panel ml-training-panel">
    <div className="ml-panel-head"><div><span className="ml-overline">OPTIMIZATION TRACE</span><h2>Temporal MLP training</h2></div><span className="ml-live-dot">BEST EPOCH {bestEpoch}</span></div>
    <p className="ml-panel-desc">Training and validation cross-entropy across epochs.</p>
    <div className="ml-training-layout">
      <div className="ml-loss-chart-wrap"><svg className="ml-loss-chart" viewBox="0 0 500 235" role="img" aria-label="MLP training and validation cross-entropy by epoch">
        {[0,1,2,3].map((step) => { const yy=42+step*45; return <g key={step}><line x1="38" y1={yy} x2="464" y2={yy} className="ml-chart-grid" /><text x="31" y={yy+3} textAnchor="end" className="ml-chart-label">{(max-(max-min)*step/3).toFixed(2)}</text></g>; })}
        <path d={train} fill="none" stroke="#69d7df" strokeWidth="2.5" /><path d={validation} fill="none" stroke="#b39aff" strokeWidth="2.5" strokeDasharray="6 4" />
        <line x1={x(bestEpoch - 1)} y1="40" x2={x(bestEpoch - 1)} y2="184" stroke="#f0c879" strokeDasharray="3 4" opacity=".7" />
        <line x1={x(inspectEpoch - 1)} y1="40" x2={x(inspectEpoch - 1)} y2="184" stroke="#f4f7f7" strokeWidth="1.5" opacity=".82" />
        <circle cx={x(inspectEpoch - 1)} cy={y(active.train)} r="4" fill="#69d7df" stroke="#081016" strokeWidth="1.5" />
        <circle cx={x(inspectEpoch - 1)} cy={y(active.validation)} r="4" fill="#b39aff" stroke="#081016" strokeWidth="1.5" />
        <rect x="38" y="40" width="426" height="145" fill="transparent" className="ml-chart-hit-area" onPointerMove={(event)=>{const rect=event.currentTarget.ownerSVGElement?.getBoundingClientRect();if(rect)selectEpoch(event.clientX,rect.left,rect.width);}} onClick={(event)=>{const rect=event.currentTarget.ownerSVGElement?.getBoundingClientRect();if(rect)selectEpoch(event.clientX,rect.left,rect.width);}} />
        <text x="39" y="211" className="ml-chart-label">EPOCH 1</text><text x="464" y="211" textAnchor="end" className="ml-chart-label">EPOCH {history.length}</text><text x="250" y="230" textAnchor="middle" className="ml-chart-caption">CROSS-ENTROPY · LOWER IS BETTER</text>
      </svg><div className="ml-loss-legend"><span><i className="ml-loss-legend--train" />Training loss</span><span><i className="ml-loss-legend--validation" />Validation loss</span><span><i className="ml-loss-legend--best" />Best validation weights</span></div><label className="ml-epoch-inspector"><span>Inspect epoch <b>{inspectEpoch}</b><small>Best weights: epoch {bestEpoch}</small></span><input aria-label="Training epoch to inspect" type="range" min="1" max={history.length} step="1" value={inspectEpoch} onChange={(event)=>setInspectEpoch(Number(event.target.value))}/><output>Train {active.train.toFixed(3)} · Validation {active.validation.toFixed(3)}</output></label></div>
      <div className="ml-network-card"><div className="ml-network-label">TEMPORAL MLP · FORWARD PASS</div><div className="ml-network-flow">{[{title:'4 inputs',sub:'HH₀ · HH₁ · derived HH₂ · stage'},{title:'Dense · 16',sub:'ReLU activation'},{title:'Dense · 8',sub:'ReLU activation'},{title:'Softmax · 4',sub:'scenario classes'}].map((layer,index)=><div className="ml-network-layer" key={layer.title}><span>{['⌁','••••','•••','◉◉◉◉'][index]}</span><b>{layer.title}</b><small>{layer.sub}</small>{index<3&&<ArrowRight size={13} />}</div>)}</div><div className="ml-network-foot"><span>Optimizer</span><b>Mini-batch SGD</b><span>Batch size</span><b>24</b><span>Weight selection</span><b>Validation loss · early stopping</b></div></div>
    </div>
  </section>;
}

function SpeckleStressProbe({model,features,modelName}:{model:DemoClassifier;features:SarFeatures;modelName:string}) {
  const [looks,setLooks]=useDiagnosticControl('speckleLooks',3),[seed,setSeed]=useDiagnosticControl('speckleSeed',17);
  const result=useMemo(()=>simulateSpeckleStress(model,features,looks,seed),[model,features,looks,seed]);
  const maxCount=Math.max(...result.deltaHistogram,1);
  const plotX=(value:number)=>42+((value+30)/60)*416;
  return <section className="ml-panel ml-speckle-probe">
    <div className="ml-panel-head"><div><span className="ml-overline">SPECKLE STRESS TEST · {modelName.toUpperCase()}</span><h2>Class stability under speckle noise</h2></div><span className="ml-live-dot">{result.trialCount} DRAWS</span></div>
    <p className="ml-panel-desc">Perturbs T0/T1 HH γ⁰ means with independent Gamma intensity speckle. Effective looks controls variance (1/L); stage and persistence stay fixed.</p>
    <div className="ml-speckle-controls"><label className="ml-slider"><span><b>Effective looks · simulation</b><output>{looks} looks</output></span><input aria-label="Effective looks for Gamma speckle simulation" type="range" min="1" max="8" step="1" value={looks} onChange={(event)=>setLooks(Number(event.target.value))}/></label><button className="ml-speckle-resample" onClick={()=>setSeed((value)=>value+1)}>Resample Monte Carlo draws <span>seed {seed}</span></button></div>
    <div className="ml-speckle-stats"><article><span>MODAL MODEL LABEL</span><b style={{color:CLASS_COLORS[result.modalClass]}}>{result.modalClass}</b><small>Modal across {result.trialCount} draws</small></article><article><span>MODAL-LABEL FREQUENCY</span><b>{(result.modalShare*100).toFixed(1)}%</b><small>Simulation consistency</small></article><article><span>OBSERVED T1 − T0 Δ HH γ⁰</span><b>{result.observedDeltaMeanDb.toFixed(2)} ± {result.observedDeltaSdDb.toFixed(2)} dB</b><small>Monte Carlo statistics</small></article></div>
    <div className="ml-speckle-visuals"><article className="ml-speckle-chart"><div className="ml-speckle-chart-head"><b>Draw-level backscatter difference</b><span>Δ dB · T1 − T0</span></div><svg viewBox="0 0 500 205" role="img" aria-label={`Histogram of ${result.trialCount} simulated speckle-perturbed T1 minus T0 backscatter differences`}><line x1="42" y1="162" x2="458" y2="162" className="ml-chart-axis"/><line x1={plotX(0)} y1="24" x2={plotX(0)} y2="162" stroke="#e7bc69" strokeDasharray="4 4" opacity=".8"/>{result.deltaHistogram.map((count,index)=>{const width=416/result.deltaHistogram.length-2;const x=42+index*416/result.deltaHistogram.length+1;const height=(count/maxCount)*115;return <rect key={index} x={x} y={162-height} width={width} height={height} rx="2" fill="url(#speckleBar)" opacity=".88"><title>{count} draws</title></rect>;})}<defs><linearGradient id="speckleBar" x1="0" x2="1"><stop stopColor="#55cbd4"/><stop offset="1" stopColor="#a68cff"/></linearGradient></defs>{[-30,-15,0,15,30].map((value)=><text key={value} x={plotX(value)} y="183" textAnchor="middle" className="ml-chart-label">{value>0?'+':''}{value}</text>)}<text x="458" y="201" textAnchor="end" className="ml-chart-caption">OUTER BINS INCLUDE VALUES BEYOND ±30 dB</text></svg></article>
      <article className="ml-speckle-counts"><div className="ml-speckle-chart-head"><b>Classifier outputs across draws</b><span>counts · {result.trialCount} trials</span></div>{DEMO_CLASSES.map((label)=><div className="ml-speckle-count-row" key={label}><div><span>{label}</span><b>{result.classCounts[label]}</b></div><i><em style={{width:`${result.classCounts[label]/result.trialCount*100}%`,backgroundColor:CLASS_COLORS[label]}}/></i></div>)}</article>
    </div><div className="ml-speckle-footnote"><AlertTriangle size={14}/> Idealized Gamma speckle model. Excludes spatial correlation, heterogeneous land cover, terrain, and RFI artifacts.</div>
  </section>;
}

function NoveltyMonitor({train,reference,features}:{train:SarSample[];reference:SarSample[];features:SarFeatures}) {
  const [coverage,setCoverage]=useDiagnosticControl('noveltyPercentile',95);
  const result=useMemo(()=>assessFeatureNovelty(train,reference,features,coverage/100),[train,reference,features,coverage]);
  const max=Math.max(result.cutoff,...Object.values(result.distances),1);
  return <section className="ml-panel ml-research-panel"><div className="ml-panel-head"><div><span className="ml-overline">DOMAIN SHIFT DIAGNOSTIC</span><h2>Is this input inside the model’s scenario domain?</h2></div><span key={String(result.isNovel)} className={`ml-novelty-badge${result.isNovel?' is-novel':''} is-flash-pop`}>{result.isNovel?'OUTSIDE REFERENCE RANGE':'WITHIN REFERENCE RANGE'}</span></div><p className="ml-panel-desc">Diagonal Mahalanobis distance from class-conditional feature distributions.</p><label className="ml-slider ml-novelty-control"><span><b>Generated-reference percentile</b><output key={coverage} className="ml-output-flash">{coverage}th percentile · cutoff {result.cutoff.toFixed(2)}</output></span><input aria-label="Generated reference percentile for novelty cutoff" type="range" min="90" max="99" step="1" value={coverage} onChange={(event)=>setCoverage(Number(event.target.value))}/></label><div className="ml-novelty-results"><article key={result.nearest} className="is-flash"><span>NEAREST CLASS DISTRIBUTION</span><b style={{color:CLASS_COLORS[result.nearest]}}>{result.nearest}</b></article><article key={result.score.toFixed(3)} className="is-flash"><span>SELECTED VECTOR DISTANCE</span><b>{result.score.toFixed(2)}</b></article><article key={`cut-${result.cutoff.toFixed(3)}`} className="is-flash"><span>REFERENCE CUTOFF</span><b>{result.cutoff.toFixed(2)}</b></article></div><div className="ml-novelty-bars">{DEMO_CLASSES.map((label)=>{const value=result.distances[label];return <div key={label} className="ml-novelty-row"><span>{label}</span><div><i style={{width:`${Math.min(100,value/max*100)}%`,backgroundColor:CLASS_COLORS[label]}}/><b>{value.toFixed(2)}</b></div></div>;})}<div className="ml-novelty-threshold" aria-hidden="true"><i/><div><em style={{left:`${(Math.min(100,result.cutoff/max*100)).toFixed(2)}%`,transition:'left .25s cubic-bezier(.22,1,.36,1)'}}><span>reference cutoff {result.cutoff.toFixed(2)}</span></em></div></div></div><small className="ml-research-note">Cutoff is the empirical {coverage}th-percentile of generated-reference nearest-class distances: above-cutoff pixels are flagged novel, with a {100-coverage}% target false-alarm rate on in-domain pixels. Diagonal covariance approximation.</small></section>;
}

function TemporalCusumProbe({features}:{features:SarFeatures}) {
  const [looks,setLooks]=useDiagnosticControl('onsetLooks',3),[onset,setOnset]=useDiagnosticControl('onset',10),[duration,setDuration]=useDiagnosticControl('duration',3),[seed,setSeed]=useDiagnosticControl('onsetSeed',23);
  const result=useMemo(()=>simulateSarTimeSeries(features,looks,onset,duration,seed),[features,looks,onset,duration,seed]);
  const values=result.series,min=Math.min(...values)-1,max=Math.max(...values)+1;
  const x=(i:number)=>38+i/(values.length-1)*424,y=(v:number)=>25+(max-v)/(max-min)*130;
  const path=values.map((value,index)=>`${index?'L':'M'} ${x(index)} ${y(value)}`).join(' ');
  const maxCusum=Math.max(result.threshold,...result.cusum,1),cy=(value:number)=>13+(maxCusum-value)/maxCusum*50,cpath=result.cusum.map((value,index)=>`${index?'L':'M'} ${x(index)} ${cy(value)}`).join(' ');
  return <section className="ml-panel ml-research-panel"><div className="ml-panel-head"><div><span className="ml-overline">CUSUM CHANGE DETECTION</span><h2>Temporal onset detection</h2></div><span className="ml-live-dot">24 SIMULATED ACQUISITIONS</span></div><p className="ml-panel-desc">Simulated HH time series with Gamma speckle. Two-sided CUSUM estimated from six baseline samples.</p><div className="ml-temporal-controls"><label className="ml-slider"><span><b>Effective looks</b><output>{looks}</output></span><input aria-label="CUSUM simulation effective looks" type="range" min="1" max="8" value={looks} onChange={(event)=>setLooks(Number(event.target.value))}/></label><label className="ml-slider"><span><b>Event onset</b><output>Acquisition {onset}</output></span><input aria-label="Simulated event onset acquisition" type="range" min="7" max="16" value={onset} onChange={(event)=>setOnset(Number(event.target.value))}/></label><label className="ml-slider"><span><b>Event duration</b><output>{duration} acquisitions</output></span><input aria-label="Simulated event duration" type="range" min="1" max="7" value={duration} onChange={(event)=>setDuration(Number(event.target.value))}/></label><button className="ml-speckle-resample" onClick={()=>setSeed((value)=>value+1)}>Resample sequence <span>seed {seed}</span></button></div><div className="ml-cusum-summary"><article><span>CUSUM FIRST ALARM</span><b>{result.alarm===null?'No alarm':`Acquisition ${result.alarm}`}</b><small>5σ threshold · baseline estimated from first 6</small></article><article><span>SCENARIO EVENT ONSET</span><b>Acquisition {onset}</b><small>Simulation parameter</small></article><article><span>FOLLOW-UP STATE</span><b>{features[3]>=.7?'Persistent':'Transient / partial'}</b><small>From persistence input</small></article></div><div className="ml-cusum-chart"><svg viewBox="0 0 500 220" role="img" aria-label="Simulated HH backscatter time series with event window and baseline"><rect x={x(5)} y="20" width={x(onset-1)-x(5)} height="145" fill="rgba(91,185,190,.07)"/><rect x={x(onset-1)} y="20" width={x(Math.min(23,onset+duration-2))-x(onset-1)} height="145" fill="rgba(232,180,93,.09)"/><line x1="38" y1={y(result.baseline)} x2="462" y2={y(result.baseline)} stroke="#91a7ae" strokeDasharray="3 4"/><path d={path} fill="none" stroke="#65d6dc" strokeWidth="2.5"/>{values.map((value,index)=><circle key={index} cx={x(index)} cy={y(value)} r={result.alarm===index+1?5:2.2} fill={result.alarm===index+1?'#f2c56c':'#65d6dc'}><title>Acquisition {index+1}: {value.toFixed(2)} dB</title></circle>)}<line x1="38" y1="165" x2="462" y2="165" className="ml-chart-axis"/>{[0,5,11,17,23].map((index)=><text key={index} x={x(index)} y="185" textAnchor="middle" className="ml-chart-label">{index+1}</text>)}<text x="250" y="207" textAnchor="middle" className="ml-chart-caption">ACQUISITION INDEX · SYNTHETIC HH γ⁰ (dB)</text></svg><svg className="ml-cusum-subchart" viewBox="0 0 500 85" role="img" aria-label="CUSUM excursion statistic compared with its detection threshold"><line x1="38" y1={cy(result.threshold)} x2="462" y2={cy(result.threshold)} stroke="#ef745c" strokeDasharray="4 4"/><path d={cpath} fill="none" stroke="#b39aff" strokeWidth="2"/>{result.alarm!==null&&<line x1={x(result.alarm-1)} y1="10" x2={x(result.alarm-1)} y2="65" stroke="#f2c56c" strokeDasharray="3 3"/>}<text x="45" y="11" className="ml-chart-caption">CUSUM EXCURSION · DASHED = 5σ THRESHOLD</text><text x="458" y="78" textAnchor="end" className="ml-chart-label">{result.alarm===null?'NO ALARM':`ALARM AT ${result.alarm}`}</text></svg><div className="ml-cusum-legend"><span><i/>Baseline period</span><span><i/>Event window</span><span>Dashed line: baseline mean / detection threshold</span></div></div><small className="ml-research-note">CUSUM is a change alarm, not a classifier. Behavior depends on baseline stationarity and acquisition geometry.</small></section>;
}

function SegmentationAudit({samples,model,scene,onSelect}:{samples:SarSample[];model:DemoClassifier;scene:ScenePerturbation;onSelect:(features:SarFeatures)=>void}) {
  const [minimum,setMinimum]=useDiagnosticControl('minimumComponent',3),[cutoff,setCutoff]=useDiagnosticControl('segmentationCutoff',.45);
  const cols=26,rows=13;
  const cells=useMemo(()=>Array.from({length:cols*rows},(_,index)=>{
    const column=index%cols,row=Math.floor(index/cols),center=6.2+1.65*Math.sin(column*.25)+.65*Math.sin(column*.72),distance=Math.abs(row-center);
    let truth:DemoClass='Stable land';
    if(distance<1.05)truth='Open water';else if(distance<2.05){const transition=(column>=7&&column<=13&&row<center)||(column>=18&&column<=23&&row>center);truth=transition?'Persistent transition candidate':'Seasonal inundation';}
    const candidates=samples.filter((sample)=>sample.y===truth),sample=candidates[index%candidates.length]??samples[index%samples.length];
    const base=sample.x,features:[number,number,number,number]=[base[0],Math.max(-28,Math.min(-2,base[1]+scene.eventDb)),Math.max(0,Math.min(1,base[2]+scene.stageShift)),Math.max(0,Math.min(1,base[3]+scene.persistenceShift))];
    const scores=model.predict(features),winner=DEMO_CLASSES.reduce((best,label)=>scores[label]>scores[best]?label:best,DEMO_CLASSES[0]);
    let predicted=winner;if(winner==='Persistent transition candidate'&&scores[winner]<cutoff)predicted=DEMO_CLASSES.filter((label)=>label!==winner).reduce((best,label)=>scores[label]>scores[best]?label:best,DEMO_CLASSES[0]);
    return {truth,predicted,sample,score:scores['Persistent transition candidate']};
  }),[samples,model,scene,cutoff]);
  const labels=new Set<number>(),seen=new Set<number>(),components:number[][]=[];
  cells.forEach((cell,index)=>{if(cell.predicted==='Persistent transition candidate')labels.add(index);});
  for(const start of labels){if(seen.has(start))continue;const queue=[start],component:number[]=[];seen.add(start);for(let cursor=0;cursor<queue.length;cursor++){const current=queue[cursor];component.push(current);const n=current%cols,neighbors=[current-cols,current+cols,n>0?current-1:-1,n<cols-1?current+1:-1];for(const next of neighbors)if(next>=0&&next<cells.length&&labels.has(next)&&!seen.has(next)){seen.add(next);queue.push(next);}}components.push(component);}
  const removedComponents=components.filter((component)=>component.length<minimum);
  const removed=new Set(removedComponents.flat());
  const stats=(after:boolean)=>{let tp=0,fp=0,fn=0;cells.forEach((cell,index)=>{const predicted=cell.predicted==='Persistent transition candidate'&&(!after||!removed.has(index)),truth=cell.truth==='Persistent transition candidate';if(predicted&&truth)tp++;else if(predicted&&!truth)fp++;else if(!predicted&&truth)fn++;});const precision=tp/(tp+fp||1),recall=tp/(tp+fn||1),iou=tp/(tp+fp+fn||1);return {precision,recall,iou,dice:2*iou/(1+iou||1)};};
  const before=stats(false),after=stats(true),componentCount=components.length-removedComponents.length;
  const paint=(label:DemoClass)=>CLASS_COLORS[label];
  const grid=(cleaned:boolean)=><svg viewBox={`0 0 ${cols*13} ${rows*14}`} role="img" aria-label={cleaned?'Connected-component filtered generated SAR scenario segmentation':'Raw generated SAR scenario segmentation'}>{cells.map((cell,index)=>{const category=cleaned&&removed.has(index)?'Stable land':cell.predicted;return <rect key={index} x={(index%cols)*13} y={Math.floor(index/cols)*14} width="12.2" height="13.2" rx="1" fill={paint(category)} opacity={cleaned&&removed.has(index)?0.25:0.86} stroke={removed.has(index)&&!cleaned?'#fff':'#0a1117'} strokeWidth=".4" onClick={()=>onSelect(cell.sample.x)}><title>{cell.truth} scenario label → {cell.predicted} model output{removed.has(index)?' · removed as a small component':''} · transition score {cell.score.toFixed(2)}</title></rect>;})}</svg>;
  return <section className="ml-panel ml-research-panel"><div className="ml-panel-head"><div><span className="ml-overline">SEGMENTATION QA</span><h2>Spatial filtering & reference patches</h2></div><span className="ml-live-dot">4-CONNECTED COMPONENTS</span></div><p className="ml-panel-desc">Turns the active classifier’s generated tile outputs into a transition-candidate mask, then removes connected components smaller than the selected pixel count. Compare raw versus filtered labels and the trade-off against the tile’s generated scenario labels.</p><div className="ml-seg-controls"><label className="ml-slider"><span><b>Candidate score cutoff</b><output>{cutoff.toFixed(2)}</output></span><input aria-label="Segmentation transition score cutoff" type="range" min="0.2" max="0.85" step="0.01" value={cutoff} onChange={(event)=>setCutoff(Number(event.target.value))}/></label><label className="ml-slider"><span><b>Minimum component size</b><output>{minimum} pixels</output></span><input aria-label="Minimum connected component pixels" type="range" min="1" max="12" value={minimum} onChange={(event)=>setMinimum(Number(event.target.value))}/></label></div><div className="ml-seg-layout"><article><div className="ml-speckle-chart-head"><b>Raw model mask</b><span>{labels.size} candidate pixels · {components.length} components</span></div>{grid(false)}</article><article><div className="ml-speckle-chart-head"><b>After component filter</b><span>{labels.size-removed.size} remain · {removed.size} pixels removed</span></div>{grid(true)}</article></div><div className="ml-seg-metrics"><span>Metric on generated tile labels</span>{[['IoU',before.iou,after.iou],['Dice',before.dice,after.dice],['Precision',before.precision,after.precision],['Recall',before.recall,after.recall]].map(([name,a,b])=><article key={String(name)}><b>{name}</b><span>{(Number(a)*100).toFixed(1)}% → {(Number(b)*100).toFixed(1)}%</span></article>)}<small>{componentCount} components retained. These scores quantify a toy tile exercise, not NISAR segmentation performance; small true features can be removed.</small></div><div className="ml-legend ml-seg-legend">{DEMO_CLASSES.map((label)=><span key={label}><i style={{backgroundColor:CLASS_COLORS[label]}}/>{label}</span>)}</div></section>;
}

function SelectiveReviewCurve({model,samples,modelName}:{model:DemoClassifier;samples:SarSample[];modelName:string}) {
  const [cutoff,setCutoff]=useDiagnosticControl('selectiveCutoff',.55);
  const result=useMemo(()=>{
    const records=samples.map((sample)=>{const scores=model.predict(sample.x),label=DEMO_CLASSES.reduce((best,current)=>scores[current]>scores[best]?current:best,DEMO_CLASSES[0]),score=scores[label];return {score,error:label!==sample.y};});
    const curve=Array.from({length:20},(_,index)=>{const threshold=.05+index*.05,accepted=records.filter((record)=>record.score>=threshold),errors=accepted.filter((record)=>record.error).length;return {threshold,coverage:accepted.length/Math.max(records.length,1),risk:accepted.length?errors/accepted.length:0};});
    const accepted=records.filter((record)=>record.score>=cutoff),errors=accepted.filter((record)=>record.error).length;
    return {curve,coverage:accepted.length/Math.max(records.length,1),risk:accepted.length?errors/accepted.length:0,accepted:accepted.length,rejected:records.length-accepted.length};
  },[model,samples,cutoff]);
  const x=(coverage:number)=>38+coverage*414,y=(risk:number)=>20+(1-risk)*130;
  const path=result.curve.map((point,index)=>`${index?'L':'M'} ${x(point.coverage)} ${y(point.risk)}`).join(' ');
  const selected=result.curve.reduce((best,point)=>Math.abs(point.threshold-cutoff)<Math.abs(best.threshold-cutoff)?point:best,result.curve[0]);
  return <section className="ml-panel ml-research-panel"><div className="ml-panel-head"><div><span className="ml-overline">SELECTIVE REVIEW</span><h2>Coverage–error trade-off</h2></div><span className="ml-live-dot">{modelName.toUpperCase()} · GENERATED HOLDOUT</span></div><p className="ml-panel-desc">Selective risk vs. coverage on the generated holdout set.</p><label className="ml-slider ml-review-control"><span><b>Auto-accept score cutoff</b><output key={cutoff.toFixed(2)} className="ml-output-flash">{cutoff.toFixed(2)} · raw model score</output></span><input aria-label="Selective review raw model score threshold" type="range" min="0.2" max="0.95" step="0.01" value={cutoff} onChange={(event)=>setCutoff(Number(event.target.value))}/></label><div className="ml-review-stats"><article key={`cov-${result.accepted}`} className="is-flash"><span>AUTO-ACCEPTED COVERAGE</span><b>{(result.coverage*100).toFixed(1)}%</b><small>{result.accepted} of {samples.length} cases</small></article><article key={`risk-${(result.risk*100).toFixed(1)}-${result.accepted}`} className="is-flash"><span>ERROR AMONG ACCEPTED</span><b>{(result.risk*100).toFixed(1)}%</b><small>Scenario-label disagreement</small></article><article key={`abs-${result.rejected}`} className="is-flash"><span>ABSTAINED FOR REVIEW</span><b>{result.rejected}</b><small>Low-score cases routed to analyst</small></article></div><div className="ml-review-chart"><svg viewBox="0 0 500 205" role="img" aria-label="Selective risk versus coverage curve for generated model holdout"><line x1="38" y1="150" x2="452" y2="150" className="ml-chart-axis"/><line x1="38" y1="20" x2="38" y2="150" className="ml-chart-axis"/>{[0,25,50,75,100].map((value,index)=><g key={value}><line x1="38" y1={150-index*32.5} x2="452" y2={150-index*32.5} className="ml-chart-grid"/><text x="31" y={154-index*32.5} textAnchor="end" className="ml-chart-label">{value}%</text><text x={38+value/100*414} y="169" textAnchor="middle" className="ml-chart-label">{value}</text></g>)}<g className="ml-review-band ml-review-band--accepted" style={{transform:`translateX(${(38*(1-selected.coverage)).toFixed(2)}px) scaleX(${selected.coverage.toFixed(3)})`,transformOrigin:'0 0',transition:'transform .3s cubic-bezier(.22,1,.36,1)'}}><rect x="38" y="20" width="414" height="130"/></g><g className="ml-review-band ml-review-band--review" style={{transform:`translateX(${(452*selected.coverage).toFixed(2)}px) scaleX(${(1-selected.coverage).toFixed(3)})`,transformOrigin:'0 0',transition:'transform .3s cubic-bezier(.22,1,.36,1)'}}><rect x="38" y="20" width="414" height="130"/></g><path d={path} fill="none" stroke="#69d7df" strokeWidth="2.5"/>{result.curve.map((point,index)=><circle key={index} cx={x(point.coverage)} cy={y(point.risk)} r="2.4" fill="#b39aff"><title>Cutoff {point.threshold.toFixed(2)}: coverage {(point.coverage*100).toFixed(1)}%, accepted-case error {(point.risk*100).toFixed(1)}%</title></circle>)}<g style={{transform:`translate(${x(selected.coverage)}px, ${y(selected.risk)}px)`,transition:'transform .3s cubic-bezier(.22,1,.36,1)'}}><line x1="0" y1="0" x2="0" y2={150-y(selected.risk)} className="ml-review-guide"/><line x1={38-x(selected.coverage)} y1="0" x2="0" y2="0" className="ml-review-guide"/><circle r="12" className="ml-review-marker-halo" key={selected.threshold}/><circle r="6" fill="#f1c66f" stroke="#111a22" strokeWidth="2"/></g><text x="245" y="195" textAnchor="middle" className="ml-chart-caption">COVERAGE · ACCEPTED SHARE (%)</text><text x="10" y="85" textAnchor="middle" transform="rotate(-90 10 85)" className="ml-chart-caption">SELECTIVE RISK · ERROR (%)</text></svg></div><small className="ml-research-note">Score threshold is a triage control. Deployment requires independent validation.</small></section>;
}

function ScenarioDiagnostics({ importance, samples, model, scoreCutoff, onScoreCutoffChange, modelName }: { importance: ReturnType<typeof permutationImportance>; samples: SarSample[]; model: DemoClassifier; scoreCutoff: number; onScoreCutoffChange: (value:number)=>void; modelName: string }) {
  const [selectedCell,setSelectedCell]=useState<{actual:DemoClass;predicted:DemoClass}|null>(null);
  const [selectedFeature,setSelectedFeature]=useState<string|null>(null);
  const matrix=useMemo(()=>{
    const result=Object.fromEntries(DEMO_CLASSES.map((actual)=>[actual,Object.fromEntries(DEMO_CLASSES.map((predicted)=>[predicted,0]))])) as ReturnType<typeof confusionMatrix>;
    for(const sample of samples){
      const scores=model.predict(sample.x);
      const transition:DemoClass='Persistent transition candidate';
      const predicted=scores[transition]>=scoreCutoff?transition:DEMO_CLASSES.filter((label)=>label!==transition).reduce((winner,current)=>scores[current]>scores[winner]?current:winner,DEMO_CLASSES[0]);
      result[sample.y][predicted]+=1;
    }
    return result;
  },[model,samples,scoreCutoff]);
  const short = ['Land', 'Water', 'Seasonal', 'Transition'];
  const values = DEMO_CLASSES.flatMap((actual) => DEMO_CLASSES.map((predicted) => matrix[actual][predicted]));
  const max = Math.max(...values, 1);
  const classScores = DEMO_CLASSES.map((label) => {
    const tp=matrix[label][label];
    const actual=DEMO_CLASSES.reduce((sum,category)=>sum+matrix[label][category],0);
    const predicted=DEMO_CLASSES.reduce((sum,category)=>sum+matrix[category][label],0);
    return {label,precision:predicted?tp/predicted:0,recall:actual?tp/actual:0};
  });
  const selectedRowTotal=selectedCell?DEMO_CLASSES.reduce<number>((sum,label)=>sum+matrix[selectedCell.actual][label],0):0;
  const selectedCount=selectedCell?matrix[selectedCell.actual][selectedCell.predicted]:0;
  const featureNotes:Record<string,string>={
    'Pre-event HH backscatter':'Baseline co-polarized γ⁰ backscatter in dB. It responds to dielectric properties, roughness, vegetation, and viewing geometry.',
    'Post-event HH backscatter':'Event-date co-polarized γ⁰ backscatter in dB. Change can reflect water, vegetation, roughness, or acquisition conditions.',
    'Stage-difference index':'Scenario-only normalized stage context; it is not measured river stage in this generated holdout.',
    'Later-water persistence':'Scenario-only follow-up evidence. It is post-event information and cannot support an event-time forecast.',
  };
  return <section className="ml-analysis-grid ml-scenario-diagnostics">
    <article className="ml-panel"><div className="ml-panel-head"><div><span className="ml-overline">SCENARIO HOLDOUT / {modelName.toUpperCase()}</span><h2>Confusion matrix</h2></div><ShieldCheck size={18} className="ml-cyan"/></div><p className="ml-panel-desc">Rows = scenario labels, columns = model outputs.</p><label className="ml-cutoff-control"><span>Transition review cutoff <b>{scoreCutoff.toFixed(2)}</b><small>Raw class score · not calibrated probability</small></span><input aria-label="Transition review cutoff" type="range" min="0.2" max="0.9" step="0.01" value={scoreCutoff} onChange={(event)=>onScoreCutoffChange(Number(event.target.value))}/></label><div className="ml-confusion-wrap"><div className="ml-confusion-axis">PREDICTED CLASS →</div><div className="ml-confusion"><div className="ml-confusion-corner">ACTUAL ↓</div>{short.map((label)=><div className="ml-confusion-head" key={label}>{label}</div>)}{DEMO_CLASSES.map((actual,row)=><div className="ml-confusion-row" key={actual}><div className="ml-confusion-side">{short[row]}</div>{DEMO_CLASSES.map((predicted)=><button type="button" key={predicted} aria-pressed={selectedCell?.actual===actual&&selectedCell?.predicted===predicted} aria-label={`${actual} classified as ${predicted}: ${matrix[actual][predicted]} of ${DEMO_CLASSES.reduce<number>((sum,label)=>sum+matrix[actual][label],0)}`} onClick={()=>setSelectedCell((current)=>current?.actual===actual&&current?.predicted===predicted?null:{actual,predicted})} className={`ml-confusion-cell${actual===predicted?' is-correct':''}${selectedCell?.actual===actual&&selectedCell?.predicted===predicted?' is-selected':''}`} style={{backgroundColor:`rgba(88,174,186,${.08+.75*matrix[actual][predicted]/max})`}}>{matrix[actual][predicted]}</button>)}</div>)}</div><div className="ml-microcopy">{samples.length} generated holdout examples · click a cell to inspect its row share</div>{selectedCell&&<div className="ml-cell-inspector"><b>{selectedCell.actual} → {selectedCell.predicted}</b><span>{selectedCount} of {selectedRowTotal} {selectedCell.actual} examples · {selectedRowTotal?(100*selectedCount/selectedRowTotal).toFixed(1):'0.0'}% of that actual-class row</span></div>}<div className="ml-class-scores">{classScores.map((item)=><div key={item.label}><b>{item.label}</b><span>Precision {(item.precision*100).toFixed(0)}% · Recall {(item.recall*100).toFixed(0)}%</span></div>)}</div></div></article>
    <article className="ml-panel"><div className="ml-panel-head"><div><span className="ml-overline">MODEL EXPLANATION / {modelName.toUpperCase()}</span><h2>Input sensitivity</h2></div><BrainCircuit size={18} className="ml-violet"/></div><p className="ml-panel-desc">Accuracy drop when one input column is shuffled.</p><div className="ml-importance">{importance.map((item,index)=><button type="button" aria-pressed={selectedFeature===item.name} className={`ml-importance-row${selectedFeature===item.name?' is-selected':''}`} key={item.name} onClick={()=>setSelectedFeature((current)=>current===item.name?null:item.name)}><span className="ml-importance-rank">0{index+1}</span><div><div className="ml-importance-label"><b>{item.name}</b><small>{(item.score*100).toFixed(1)} pp</small></div><div className="ml-importance-track"><i style={{width:`${Math.max(2,Math.max(0,item.score)/Math.max(importance[0]?.score??.01,.01)*100)}%`}}/></div></div></button>)}</div>{selectedFeature&&<div className="ml-cell-inspector"><b>{selectedFeature}</b><span>{featureNotes[selectedFeature]??'This sensitivity estimate describes the generated holdout only.'}</span></div>}<div className="ml-caution-note"><AlertTriangle size={14}/> Correlated inputs may share importance.</div><div className="iw-sensitivity-guide"><h3>Read the result in context</h3><p>A larger bar means the model depends more on that input in this generated holdout. Correlated features can share influence; this is not a causal explanation.</p><dl>{Object.entries(featureNotes).map(([name,note])=><div key={name}><dt>{name}</dt><dd>{note}</dd></div>)}</dl></div></article>
  </section>;
}

function ScenarioLab({ forest, neural, history, bestEpoch, testSamples, trainSamples, referenceSamples, onShowReal }: { forest: DemoClassifier; neural: DemoClassifier; history: LossPoint[]; bestEpoch: number; testSamples: SarSample[]; trainSamples:SarSample[]; referenceSamples:SarSample[]; onShowReal: () => void }) {
  const [mode, setMode] = useState<'neural'|'forest'>('neural');
  const [features, setFeatures] = useState<SarFeatures>([-10, -17, .08, .9]);
  const [cutoff,setCutoff]=useState(.55);
  const [matrixCutoff,setMatrixCutoff]=useState(.55);
  const [scene,setScene]=useState<ScenePerturbation>({eventDb:0,stageShift:0,persistenceShift:0});
  const model = mode === 'neural' ? neural : forest;
  const diagnostics = useMemo(() => ({ importance: permutationImportance(model, testSamples) }), [model, testSamples]);
  const effectiveFeatures=perturb(features,scene);
  const prediction = getPrediction(model, effectiveFeatures);
  const accepted=prediction.scores[prediction.label]>=cutoff;
  const setFeature = (index: number, value: number) => setFeatures((current) => { const next: SarFeatures = [...current]; next[index] = value; return next; });
  const presets: {label:string;values:SarFeatures}[] = [
    {label:'Stable bank',values:[-9.4,-9.1,.06,.08]}, {label:'Open water',values:[-19.1,-18.5,.04,.94]},
    {label:'Flood pulse',values:[-9.8,-17.4,.62,.14]}, {label:'Persistent change',values:[-10.2,-17.1,.07,.91]},
  ];
  const trajectory = [effectiveFeatures[0], effectiveFeatures[1], blendGamma0Db(effectiveFeatures[0],effectiveFeatures[1],effectiveFeatures[3])];
  return <>
    <section className="ml-sim-banner">
      <div className="ml-sim-badge"><BrainCircuit size={15} /> EDUCATIONAL SIMULATION</div>
      <p>
        <strong>DECLARED EDUCATIONAL TEACHING SANDBOX:</strong> The Random Forest and Temporal MLP classifiers below are educational demonstrations trained on synthetic scenario samples to illustrate SAR feature sensitivity. They are <strong>NOT</strong> operational flood forecasts, and do not represent verified ground truth.
      </p>
      <button className="ml-sim-link" onClick={onShowReal}>View Calibrated Satellite Evidence <ArrowRight size={13}/></button>
    </section>
    <div className="ml-model-selector" role="tablist" aria-label="Choose model"><button role="tab" aria-selected={mode==='neural'} className={mode==='neural'?'is-active':''} onClick={()=>setMode('neural')}><BrainCircuit size={17}/><span><b>Temporal MLP</b><small>4 → 16 → 8 → 4 · trained with SGD</small></span></button><button role="tab" aria-selected={mode==='forest'} className={mode==='forest'?'is-active':''} onClick={()=>setMode('forest')}><Radio size={17}/><span><b>Random Forest</b><small>31 trees · bootstrap voting</small></span></button></div>
    <SceneControls scene={scene} onChange={setScene}/>
    <div className="ml-visual-grid"><ScenarioCube samples={testSamples} model={model} modelName={mode==='neural'?'Temporal MLP':'Random Forest'} selected={effectiveFeatures} onSelect={setFeatures} scene={scene}/><FeatureSpace samples={testSamples} selected={features} onSelect={setFeatures} scene={scene}/></div>
    <section className="ml-panel ml-scenario-panel"><div className="ml-panel-head"><div><span className="ml-overline">INFERENCE · {mode==='neural'?'TEMPORAL MLP':'RANDOM FOREST'}</span><h2>Radar-change sandbox</h2></div><span className="ml-live-dot">LIVE</span></div>
      <div className="ml-presets">{presets.map((preset)=><button key={preset.label} className="ml-preset" onClick={()=>setFeatures(preset.values)}>{preset.label}</button>)}</div>
      <div className="ml-scenario-grid"><div className="ml-sliders">{[{label:'T0 · pre-event HH γ⁰',index:0,min:-25,max:-3,step:.1,suffix:' dB'},{label:'T1 · event HH γ⁰',index:1,min:-25,max:-3,step:.1,suffix:' dB'},{label:'Stage-difference index',index:2,min:0,max:1,step:.01,suffix:''},{label:'Later-water persistence input',index:3,min:0,max:1,step:.01,suffix:''}].map((item)=><label className="ml-slider" key={item.index}><span><b>{item.label}</b><output>{features[item.index].toFixed(item.index<2?1:2)}{item.suffix}</output></span><input type="range" min={item.min} max={item.max} step={item.step} value={features[item.index]} onChange={(event)=>setFeature(item.index,Number(event.target.value))}/></label>)}
        <div className={`ml-prediction${accepted?'':' ml-prediction--review'}`}><div className="ml-prediction__top"><span>{accepted?'SCENARIO CLASS OUTPUT':'BELOW REVIEW THRESHOLD · REVIEW'}</span><span>{(prediction.scores[prediction.label]*100).toFixed(1)}% {mode==='neural'?'SOFTMAX SCORE':'TREE-VOTE SHARE'}</span></div><strong style={{color:CLASS_COLORS[prediction.label]}}>{prediction.label}</strong><small>Largest model output for the selected inputs.</small></div>
        <div className="ml-votes">{DEMO_CLASSES.map((label)=><div className="ml-vote" key={label}><span><i style={{backgroundColor:CLASS_COLORS[label]}}/>{label}</span><b>{(prediction.scores[label]*100).toFixed(1)}%</b><div><i style={{width:`${prediction.scores[label]*100}%`,backgroundColor:CLASS_COLORS[label]}}/></div></div>)}</div>
        <label className="ml-slider ml-score-cutoff"><span><b>Review threshold for selected pixel</b><output>{Math.round(cutoff*100)}%</output></span><input type="range" min=".4" max=".9" step=".01" value={cutoff} onChange={(event)=>setCutoff(Number(event.target.value))}/></label>
      </div><div className="ml-trajectory-card"><div className="ml-trajectory-head"><b>INPUT SEQUENCE · HH γ⁰</b><span>T2 is derived from persistence input</span></div><svg viewBox="0 0 360 180" role="img" aria-label="Generated HH backscatter scenario values at T0, T1 and T2"><line x1="38" y1="145" x2="330" y2="145" className="ml-chart-axis"/><line x1="38" y1="25" x2="38" y2="145" className="ml-chart-axis"/>{[-25,-15,-5].map((v,i)=><g key={v}><line x1="38" y1={145-i*55} x2="330" y2={145-i*55} className="ml-chart-grid"/><text x="30" y={149-i*55} textAnchor="end" className="ml-chart-label">{v}</text></g>)}<path d={trajectory.map((v,i)=>`${i?'L':'M'} ${75+i*115} ${145-(v+25)*5.5}`).join(' ')} fill="none" stroke="#69d7df" strokeWidth="3"/>{trajectory.map((v,i)=><g key={i}><circle cx={75+i*115} cy={145-(v+25)*5.5} r="5" fill="#101922" stroke="#9bf0ec" strokeWidth="2"/><text x={75+i*115} y={165} textAnchor="middle" className="ml-chart-label">{['T0','T1','T2'][i]}</text></g>)}</svg><p>Illustrative sequence only.</p></div></div>
    </section>
    <SpeckleStressProbe model={model} features={effectiveFeatures} modelName={mode==='neural'?'Temporal MLP':'Random Forest'} />
    <TemporalCusumProbe features={effectiveFeatures}/>
    <NoveltyMonitor train={trainSamples} reference={referenceSamples} features={effectiveFeatures}/>
    <SegmentationAudit samples={testSamples} model={model} scene={scene} onSelect={setFeatures}/>
    <SelectiveReviewCurve model={model} samples={testSamples} modelName={mode==='neural'?'Temporal MLP':'Random Forest'} />
    {mode==='neural'&&<TemporalTraining history={history} bestEpoch={bestEpoch}/>}
    <ScenarioDiagnostics importance={diagnostics.importance} samples={testSamples} model={model} scoreCutoff={matrixCutoff} onScoreCutoffChange={setMatrixCutoff} modelName={mode==='neural'?'Temporal MLP':'Random Forest'} />
    <details className="ml-method-details ml-scenario-model-card" open><summary>{mode==='neural'?'Temporal MLP':'Random Forest'}</summary><div className="ml-method-copy"><p><strong>Model:</strong> {mode==='neural'?'Dense network with 4 inputs, 16 and 8 ReLU units, and 4-way softmax; trained with mini-batch SGD and validation-loss early stopping.':'31 shallow CART trees trained by bootstrap aggregation; two randomly selected features are considered per split.'}</p><p><strong>Input features:</strong> Pre-event HH backscatter, event HH backscatter, a stage-difference index, and later-water persistence. The follow-up HH value in this scenario is derived from persistence.</p><p><strong>Training labels:</strong> Generated from hand-set scenario distributions. Held-out matrix and permutation sensitivity describe agreement with those generated rules only; they are not field-label validation.</p><p><strong>Intended use:</strong> Demonstrate model mechanics and compare responses to controlled scenarios. Do not interpret outputs as NISAR scene classifications, calibrated probabilities, or erosion estimates.</p></div></details>
  </>;
}

function featureRings(feature: ChangeFeature): number[][][] {
  const coords=feature.geometry.coordinates as number[][][]|number[][][][];
  return feature.geometry.type==='Polygon'?coords as number[][][]:(coords as number[][][][]).map((polygon)=>polygon[0]??[]);
}

function NisarEvidenceWorkbench({ bundle }: { bundle: ReachBundle }) {
  const [panel,setPanel]=useState<'pair'|'candidates'>('pair');
  const [layer,setLayer]=useState<'compare'|'change'|'water'>('compare');
  const [waterDate,setWaterDate]=useState<'t0'|'t1'>('t0');
  const [split,setSplit]=useState(50);
  const [showErosion,setShowErosion]=useState(true);
  const [showAccretion,setShowAccretion]=useState(true);
  const [minimumArea,setMinimumArea]=useState(.2);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const t0=compactDate(bundle.reach.primary_pair.t0),t1=compactDate(bundle.reach.primary_pair.t1);
  const imageFor=(kind: 'radar'|'water'|'change',date:string)=>analysisImage(bundle.reach.reach_id,kind,date,[isoDate(t0),isoDate(t1)]);
  const [imageError,setImageError]=useState(false);
  const image=layer==='change'?imageFor('change',t0):layer==='water'?imageFor('water',waterDate==='t0'?t0:t1):null;
  useEffect(()=>setImageError(false),[image]);
  const bounds=bundle.bounds.coordinates;
  const minLon=Math.min(...bounds.map(([lon])=>lon)),maxLon=Math.max(...bounds.map(([lon])=>lon));
  const minLat=Math.min(...bounds.map(([,lat])=>lat)),maxLat=Math.max(...bounds.map(([,lat])=>lat));
  const project=(lon:number,lat:number)=>[24+((lon-minLon)/Math.max(1e-9,maxLon-minLon))*672,24+((maxLat-lat)/Math.max(1e-9,maxLat-minLat))*672] as const;
  const allFeatures=[...(showErosion?bundle.erosion?.features??[]:[]),...(showAccretion?bundle.accretion?.features??[]:[])];
  const candidates=allFeatures.filter((feature)=>feature.properties.area_ha>=minimumArea);
  const selected=candidates.find((feature)=>String(feature.properties.id)===selectedId)??[...candidates].sort((a,b)=>b.properties.area_ha-a.properties.area_ha)[0];
  const area=candidates.reduce((sum,feature)=>sum+feature.properties.area_ha,0);
  const pixels=candidates.length && candidates.every(feature=>feature.properties.pixel_count!==null) ? candidates.reduce((sum,feature)=>sum+(feature.properties.pixel_count??0),0) : null;
  const pathFor=(feature:ChangeFeature)=>featureRings(feature).map((ring)=>ring.map(([lon,lat],index)=>{const [x,y]=project(lon,lat);return `${index?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(' ')+' Z').join(' ');
  const largest=[...(bundle.erosion?.features??[]),...(bundle.accretion?.features??[])].sort((a,b)=>b.properties.area_ha-a.properties.area_ha).slice(0,5);
  return <section className="ml-evidence-workbench">
    <div className="ml-workbench-tabs" role="tablist" aria-label="NISAR evidence views"><button role="tab" aria-selected={panel==='pair'} className={panel==='pair'?'is-active':''} onClick={()=>setPanel('pair')}><Radio size={15}/> Acquisitions and masks</button><button role="tab" aria-selected={panel==='candidates'} className={panel==='candidates'?'is-active':''} onClick={()=>setPanel('candidates')}><BrainCircuit size={15}/> Candidate polygons</button></div>
    {panel==='pair'?<section className="ml-panel ml-product-inspector"><div className="ml-panel-head"><div><span className="ml-overline">REAL SENTINEL-1 C-BAND · JAMUNA / CHILMARI–ROUMARI</span><h2>Acquisition pair inspector</h2></div><span className="ml-data-stamp">{t0} → {t1}</span></div><p className="ml-panel-desc">Browse the HH quicklooks, threshold water masks, and pairwise change candidates from this bundle. Quicklook contrast is display-scaled.</p>
      <div className="ml-product-tabs" role="tablist" aria-label="Select image product">{(['compare','change','water'] as const).map((item)=><button role="tab" aria-selected={layer===item} className={layer===item?'is-active':''} key={item} onClick={()=>setLayer(item)}>{item==='compare'?'Swipe compare':item==='change'?'Change candidates':'Water mask'}<small>{item==='compare'?'T0 / T1 HH':item==='change'?'pair mask':'single date'}</small></button>)}</div>
      {layer==='water'&&<div className="ml-image-date-toggle"><button className={waterDate==='t0'?'is-active':''} onClick={()=>setWaterDate('t0')}>T0 · {t0}</button><button className={waterDate==='t1'?'is-active':''} onClick={()=>setWaterDate('t1')}>T1 · {t1}</button></div>}
      <div className={`ml-image-stage${layer==='compare'?' is-compare':''}`}>{layer==='compare'?<><img className="ml-pair-image" src={imageFor('radar',t0)} alt={`Workspace SAR display ${t0}`}/><img className="ml-pair-image ml-pair-image-overlay" style={{clipPath:`inset(0 ${100-split}% 0 0)`}} src={imageFor('radar',t1)} alt={`Workspace SAR display ${t1}`}/><i className="ml-swipe-divider" style={{left:`${split}%`}}/><span className="ml-image-chip left">T1 · {t1}</span><span className="ml-image-chip right">T0 · {t0}</span></>:imageError?<div className="ml-image-fallback">This image layer is unavailable in the loaded bundle.</div>:<><img className="ml-pair-image" src={image??''} alt={layer==='change'?`Pairwise change candidate mask ${t0} to ${t1}`:`Threshold water mask ${waterDate==='t0'?t0:t1}`} onError={()=>setImageError(true)}/><span className="ml-image-chip left">{layer==='change'?'LAND ↔ WATER CANDIDATES':`${waterDate.toUpperCase()} · THRESHOLD WATER MASK`}</span></>}</div>
      {layer==='compare'&&<label className="ml-swipe-control"><span>Reveal T1</span><input aria-label="Swipe comparison position" type="range" min="2" max="98" value={split} onChange={(event)=>setSplit(Number(event.target.value))}/><output>{split}%</output></label>}
      <div className="ml-image-caption"><span>{bundle.reach.track.direction===null?'Acquisition geometry':bundle.reach.track.direction==='D'?'Descending':'Ascending'} · relative orbit {bundle.reach.track.relative_orbit??'—'}</span><span>Calibrated gamma0 · display-scaled PNG</span></div>
    </section>:<section className="ml-panel ml-candidate-inspector"><div className="ml-panel-head"><div><span className="ml-overline">GEOREFERENCED OUTPUT · SOURCE GEOJSON</span><h2>Explore pairwise change candidates</h2></div><span className="ml-data-stamp">WGS84</span></div><p className="ml-panel-desc">Select polygons to inspect connected-component attributes. These are threshold-derived candidates, not verified bank retreat.</p>
      <div className="ml-candidate-controls"><div className="ml-layer-toggles"><button className={showErosion?'is-active':''} onClick={()=>setShowErosion((value)=>!value)}><i className="ml-legend-erosion"/>Erosion <small>{bundle.erosion?.features.length.toLocaleString()??'—'}</small></button><button className={showAccretion?'is-active':''} onClick={()=>setShowAccretion((value)=>!value)}><i className="ml-legend-accretion"/>Accretion <small>{bundle.accretion?.features.length.toLocaleString()??'—'}</small></button></div><label className="ml-slider ml-area-filter"><span><b>Minimum patch area</b><output>{minimumArea.toFixed(2)} ha</output></span><input aria-label="Minimum polygon area" type="range" min="0" max="2" step=".04" value={minimumArea} onChange={(event)=>setMinimumArea(Number(event.target.value))}/></label></div>
      <div className="ml-candidate-layout"><div className="ml-vector-map-wrap"><svg className="ml-vector-map" viewBox="0 0 720 720" role="img" aria-label="Geographic distribution of Jamuna erosion and accretion candidates"><defs><pattern id="ml-evidence-grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="rgba(145,180,190,.1)"/></pattern></defs><rect width="720" height="720" fill="#0a1219"/><rect width="720" height="720" fill="url(#ml-evidence-grid)"/>{candidates.map((feature,index)=><path key={String(feature.id??feature.properties.id??index)} d={pathFor(feature)} fill={feature.properties.class==='erosion'?'#e8644e':'#e5b85f'} fillOpacity={String(feature.properties.id)===String(selected?.properties.id)?.98:.68} stroke={String(feature.properties.id)===String(selected?.properties.id)?'#fff':'rgba(5,10,14,.7)'} strokeWidth={String(feature.properties.id)===String(selected?.properties.id)?1.4:.35} onClick={()=>setSelectedId(String(feature.properties.id))}/>)}</svg><span className="ml-map-north">N ↑</span><div className="ml-map-caption">{bundle.reach.name.toUpperCase()} · {candidates.length.toLocaleString()} FILTERED PATCHES</div></div><aside className="ml-feature-inspector"><div className="ml-feature-total"><span>FILTERED CANDIDATE AREA</span><strong>{fmt(area,2)} <small>ha</small></strong><div>{candidates.length.toLocaleString()} patches · {pixels?.toLocaleString()??'Unavailable'} calibrated pixels</div></div>{selected?<div className="ml-selected-feature"><span className="ml-overline">SELECTED PATCH</span><b className={selected.properties.class==='erosion'?'is-erosion':'is-accretion'}>{selected.properties.class.toUpperCase()} CANDIDATE</b><dl><dt>Feature ID</dt><dd>{selected.properties.id}</dd><dt>Area</dt><dd>{fmt(selected.properties.area_ha,2)} ha</dd><dt>Pixels</dt><dd>{selected.properties.pixel_count?.toLocaleString()??'Unavailable'}</dd><dt>Pair</dt><dd>{selected.properties.t0} → {selected.properties.t1}</dd><dt>Source</dt><dd>Sentinel-1 RTC VV</dd></dl></div>:<div>No polygons match these filters.</div>}<div className="ml-largest-patches"><span className="ml-overline">LARGEST STORED PATCHES</span>{largest.map((feature)=><button key={String(feature.properties.id)} onClick={()=>{setShowErosion(feature.properties.class==='erosion');setShowAccretion(feature.properties.class==='accretion');setMinimumArea(0);setSelectedId(String(feature.properties.id));}}><i className={feature.properties.class==='erosion'?'ml-legend-erosion':'ml-legend-accretion'}/><span>{feature.properties.id}<small>{feature.properties.class}</small></span><b>{fmt(feature.properties.area_ha,2)} ha</b></button>)}</div></aside></div>
      <p className="ml-candidate-note"><AlertTriangle size={14}/> {bundle.reach.verdict_reasons.join(" ")}</p>
    </section>}
  </section>;
}

function EvidenceGate({ checks, bundle }: { checks: QCCheck[]; bundle: ReachBundle }) {
  const byId=(id:string)=>checks.find((check)=>check.id===id);
  const items=checks.map(check=>({id:check.id,title:check.label??check.id,detail:check.explanation??''}));
  const blocking=items.filter((item)=>byId(item.id)?.status!=='PASS').length;
  const rainfall=byId('rainfall_anomaly');
  return <section className="ml-evidence-gate"><div className="ml-evidence-gate-head"><div><span className="ml-overline">SAR QUALITY CONTROL · EVIDENCE GATE</span><h2>{blocking?'Withhold a confirmed erosion label':'Evidence gates passed for review'}</h2><p>This rule-based gate checks recorded quality evidence. It is not an ML probability or a substitute for reference validation.</p></div><b>{blocking} / {items.length} GATES OPEN</b></div><div className="ml-evidence-gate-grid">{items.map((item)=>{const check=byId(item.id);const status=check?.status??'NOT_EVALUATED';return <details className={`ml-evidence-gate-item is-${status.toLowerCase()}`} key={item.id}><summary><span><i/>{item.title}</span><b>{status==='NOT_EVALUATED'?'Not evaluated':status==='PASS'?'Pass':status==='WARN'?'Review':'Fail'}</b></summary><p>{item.detail}</p>{check?.value!=null&&<small>Recorded value: {fmt(check.value,1)} {check.unit??''}</small>}</details>;})}</div><div className="ml-evidence-context"><span><b>PAIR</b> {compactDate(bundle.reach.primary_pair.t0)} → {compactDate(bundle.reach.primary_pair.t1)} · same relative orbit {bundle.reach.track.relative_orbit}</span>{rainfall&&<span><b>RAINFALL CONTEXT</b> {rainfall.value?.toFixed(2)??'—'}× seasonal norm · contextual evidence only, not causal attribution</span>}</div></section>;
}

function RealCaseTab({ bundle, error }: { bundle: ReachBundle | null; error: string | null }) {
  if (error) return <div className="ml-case-error">Could not load the processed observation bundle: {error}</div>;
  if (!bundle) return <div className="ml-case-loading">Loading the workspace evidence bundle…</div>;
  const metric=bundle.manifest.metrics.find((item)=>item.id==='erosion_area');
  const checks=bundle.qc?.checks??[];
  const channels=[...new Set(metric?.inputs?.map((input)=>input.layer).filter((value):value is string=>Boolean(value)))];
  const acquisitions=bundle.reach.dates.filter((date)=>date.status==='ok');
  const unevaluated=checks.filter(check=>check.status==='NOT_EVALUATED').length;

  return <section className="ml-real-case" id="real-case">
    <div className="ml-real-verdict"><div className="ml-real-verdict__icon"><AlertTriangle size={20}/></div><div><span>MEASURED RADAR CASE · {bundle.reach.verdict}</span><h2>The current observations do not support a confirmed erosion estimate.</h2><p>These values are calculated from downloaded radar observations. The transition area is a threshold-based screening result, not independent ground truth.</p></div></div>
    <section className="ml-validation-gate"><div className="ml-validation-gate__head"><BrainCircuit size={20}/><div><span>CALIBRATED SATELLITE INPUTS</span><h2>Measured signal. Explicit limits.</h2></div><b>VV + VH · SOURCE DATA</b></div><p>The values below are calculated from downloaded calibrated radar pixels. Water transitions are screening candidates; independent reference labels are required before reporting model accuracy or confirmed erosion.</p><div className="ml-validation-grid">{bundle.source.observations.map(observation=><article key={observation.id}><span>{observation.date} · MEAN VV</span><strong>{observation.mean_vv_db.toFixed(2)} dB</strong><small>VH {observation.mean_vh_db.toFixed(2)} dB · {(observation.valid_fraction*100).toFixed(1)}% valid support</small></article>)}<article><span>COMMON VALID SUPPORT</span><strong>{bundle.source.metrics.common_valid_area_ha.toLocaleString()} ha</strong><small>Pixels valid on both acquisition dates</small></article><article><span>CLASSIFIED WATER · T1</span><strong>{bundle.source.metrics.water_area_t1_ha.toLocaleString()} ha</strong><small>Declared VV water-screening threshold</small></article></div></section>
    <EvidenceGate checks={checks} bundle={bundle}/>
    <NisarEvidenceWorkbench bundle={bundle}/>
    <div className="ml-real-summary"><article><span>USABLE ACQUISITIONS</span><strong>{acquisitions.length}</strong><small>Relative orbit {bundle.reach.track.relative_orbit??'—'}</small></article><article><span>POLARIZATION</span><strong>{channels.join(', ')||'Not registered'}</strong><small>Calibrated RTC polarizations</small></article><article><span>LAND → WATER CANDIDATE AREA</span><strong>{metric?`${fmt(metric.value)} ha`:'Not reported'}</strong><small>Screening result, not confirmed erosion</small></article><article><span>QC WARNINGS / FAILS</span><strong>{checks.filter((check)=>check.status==='WARN'||check.status==='FAIL').length}</strong><small>{unevaluated} checks not evaluated</small></article></div>
    <div className="ml-real-dates">{bundle.reach.dates.map((date)=><article key={date.date}><span className="ml-real-dot"/><div><b>{utcDate(date.acq_utc)}</b><small>{metric?.inputs?.find((input)=>input.acq_utc?.slice(0,10)===date.acq_utc.slice(0,10))?.granule??'Granule reference unavailable'}</small><em>{'Calibrated Sentinel-1 RTC · recorded acquisition time'}</em></div></article>)}</div>
    <div className="ml-real-qc">{checks.map((check)=><article key={check.id} className={`ml-qc-card ml-qc-card--${check.status.toLowerCase()}`}><div><span>{check.status==='PASS'?<Check size={14}/>:check.status==='WARN'||check.status==='FAIL'?<AlertTriangle size={14}/>:<CircleHelp size={14}/>}</span><b>{check.label??check.id}</b><em>{QC_STATUS[check.status]}</em></div><p>{check.explanation??'No explanation recorded.'}</p></article>)}</div>
    <aside className="ml-real-caveat"><strong>Evidence needed to resolve this case</strong><span>Same-track temporal coverage, gauge-level stage control, persistence evidence, and independent reference validation.</span></aside>
  </section>;
}

export function IntelligencePage() {
  const reachId=reachForRegion(useWorkspaceStore(s=>s.regionId));
  const [tab,setTab]=useState<'lab'|'case'>('lab');
  const [bundle,setBundle]=useState<ReachBundle|null>(null);
  const [error,setError]=useState<string|null>(null);
  const model=useMemo(()=>{
    const samples=createSyntheticSamples(2609,180);
    const split=splitSyntheticSamples(samples,2031);
    const forest=trainSyntheticForest(split.train,941,31);
    const temporal=trainTemporalMlp(split.train,split.validation,4021);
    return {forest,neural:temporal.model,history:temporal.history,bestEpoch:temporal.bestEpoch,testSamples:split.test,trainSamples:split.train,referenceSamples:split.validation};
  },[]);
  useEffect(()=>{
    let active=true;
    loadReachBundle(reachId).then((loaded)=>{if(!active)return;setBundle(loaded);}).catch((cause:unknown)=>{if(active)setError(cause instanceof Error?cause.message:'Bundle unavailable');});
    return()=>{active=false;};
  },[reachId]);
  return <div className="page-container ml-page"><main className="ml-shell"><details className="workspace-data-note"><summary><strong>SOURCE-LINKED RADAR EVIDENCE</strong> · Current region and date pair</summary><p>Evidence uses calibrated Sentinel-1 RTC VV/VH scenes and computed screening geometries. The model sandbox remains a synthetic teaching exercise.</p></details>
    <header className="ml-hero"><div className="ml-hero-radar"><i/><i/><i/><span/></div><div className="ml-hero-copy"><div className="ml-eyebrow"><span className="ml-eyebrow-dot"/> SAR CHANGE INTELLIGENCE</div><h1>ML Intelligence</h1><p>Interactive ML models for SAR-based river change analysis.</p><div className="ml-hero-meta"><span><Radio size={14}/> SENTINEL-1 C-BAND</span><span><BrainCircuit size={14}/> RANDOM FOREST · TEMPORAL MLP</span><span><ShieldCheck size={14}/> WORKSPACE EVIDENCE</span></div></div><div className="ml-hero-orbit"><div className="ml-orbit-ring ml-orbit-ring--one"/><div className="ml-orbit-ring ml-orbit-ring--two"/><div className="ml-orbit-center"><BrainCircuit size={31}/><small>RF + DL</small></div><b>TEMPORAL<br/>INFERENCE</b></div></header>
    <div className="ml-tabbar" role="tablist" aria-label="ML intelligence views"><button role="tab" aria-selected={tab==='lab'} className={tab==='lab'?'is-active':''} onClick={()=>setTab('lab')}><BrainCircuit size={16}/> Model sandbox <span>SYNTHETIC</span></button><button role="tab" aria-selected={tab==='case'} className={tab==='case'?'is-active':''} onClick={()=>setTab('case')}><Radio size={16}/> Workspace evidence <span>CURRENT RUN</span></button></div>
    {tab==='lab'?<ScenarioLab {...model} onShowReal={()=>setTab('case')}/>:<RealCaseTab bundle={bundle} error={error}/>}
    <footer className="ml-bottomline"><span>FLUVISAR · ML INTELLIGENCE</span><span>Scenario outputs are demonstrative, not validated predictions.</span></footer><div className="ml-footer-sources"><a href="https://planetarycomputer.microsoft.com/dataset/sentinel-1-rtc" target="_blank" rel="noreferrer">Sentinel-1 RTC source catalogue <ExternalLink size={13}/></a><a href="https://nisar.jpl.nasa.gov/mission/get-to-know-sar/overview/" target="_blank" rel="noreferrer">NASA/JPL SAR interpretation <ExternalLink size={13}/></a><a href="/reports">FluviSAR methods and case limits <ExternalLink size={13}/></a></div>
  </main></div>;
}

// Shared interactive diagnostics retained in the redesigned Intelligence workspace.
export { ScenarioCube, FeatureSpace, SceneControls, SpeckleStressProbe, TemporalCusumProbe, NoveltyMonitor, SegmentationAudit, SelectiveReviewCurve, TemporalTraining, ScenarioDiagnostics, perturb, getPrediction, blendGamma0Db };
