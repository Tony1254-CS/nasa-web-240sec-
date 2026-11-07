import { Calendar, Columns2, Layers, SplitSquareHorizontal, X, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useObservatoryEvidence as useEvidence, readableDate } from '../data/evidence';
import type { KeyboardEvent, PointerEvent } from 'react';

export function SwipeCompareMap({dateA,dateB}:{dateA:string;dateB:string}){
 const {evidence}=useEvidence();
 const {swipePosition,setSwipePosition,comparisonMode,setComparisonMode,comparisonLayout,setComparisonLayout,comparisonEnabled,setComparisonEnabled,basemapType,satelliteView,selectedDate,selectedPair,selectedOpticalDate,selectedOpticalPair}=useWorkspaceStore();
 const optical=basemapType==='satellite';
 const radarPair=selectedPair??[dateA,dateB];
 const opticalPair=selectedOpticalPair??evidence.optical_pair;
 const radarDate=comparisonEnabled&&comparisonMode==='dates'?radarPair[1]:selectedDate;
 const opticalDate=comparisonEnabled&&comparisonMode==='dates'?opticalPair?.[1]:selectedOpticalDate;
 const opticalScene=evidence.optical_observations?.find(o=>o.date===opticalDate);
 const opticalLabel=(date:string|undefined)=>satelliteView==='context'?'Esri satellite mosaic / not date-matched':date?'Sentinel-2 optical · '+readableDate(date)+' / '+Math.round((evidence.optical_observations?.find(o=>o.date===date)?.cloud_fraction??0)*100)+'% ROI cloud/shadow':'Esri context mosaic';
 const radarLabel=(date:string)=>'Sentinel-1 radar · '+readableDate(date);
 const leftLabel=comparisonMode==='sensors'?opticalLabel(selectedOpticalDate):optical?opticalLabel(opticalPair?.[0]):radarLabel(radarPair[0]);
 const rightLabel=comparisonMode==='sensors'?radarLabel(selectedDate):optical?opticalLabel(opticalDate):radarLabel(radarDate);

 // Stage comparison check
 const isJamuna = evidence.region_id === 'jamuna';
 const stageMap: Record<string, number> = isJamuna ? {
   '2026-10-19': 18.25,
   '2026-10-31': 17.40,
 } : {
   '2026-07-06': 3.42,
   '2026-08-23': 3.85,
   '2026-09-28': 2.95,
   '2026-10-10': 2.10,
   '2026-10-22': 1.85,
   '2026-11-03': 1.60,
 };
 const sA = stageMap[radarPair[0]] ?? 18.0;
 const sB = stageMap[radarPair[1]] ?? 17.0;
 const stageDelta = Math.abs(sA - sB);
 const isStageIncompatible = isJamuna ? stageDelta > 1.0 : stageDelta > 1.5;

 const pointer=(event:PointerEvent<HTMLDivElement>)=>{if(event.type!=='pointerdown'&&!event.currentTarget.hasPointerCapture(event.pointerId))return;if(event.type==='pointerdown')event.currentTarget.setPointerCapture(event.pointerId);const rect=event.currentTarget.parentElement!.getBoundingClientRect();setSwipePosition(Math.max(2,Math.min(98,(event.clientX-rect.left)/rect.width*100)));};
 const keyboard=(event:KeyboardEvent<HTMLDivElement>)=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setSwipePosition(Math.max(2,Math.min(98,swipePosition+(event.key==='ArrowLeft'?-1:1))));}};
 const cloudy=satelliteView==='dated'&&(basemapType==='satellite'||comparisonEnabled&&comparisonMode==='sensors')?(evidence.optical_observations??[]).filter(o=>(comparisonEnabled&&comparisonMode==='dates'?(opticalPair??[]):[selectedOpticalDate]).includes(o.date)&&o.cloud_fraction>.1):[];
 return <div className="restored-comparison-overlay">
  {cloudy.length>0&&<div className="obs-cloud-note" role="status"><b>White areas are recorded clouds.</b><span>{cloudy.map(o=>readableDate(o.date)+': '+Math.round(o.cloud_fraction*100)+'% ROI cloud/shadow').join(' / ')}. Choose another date or Radar to inspect beneath clouds.</span></div>}
  <div className="restored-comparison-toolbar" aria-label="Comparison controls">
    <div className="comparison-mode-buttons">
      <button className={comparisonEnabled&&comparisonMode==='dates'?'selected':''} onClick={()=>{setComparisonMode('dates');setComparisonEnabled(true);}}><Calendar size={13}/>Dates</button>
      <button className={comparisonEnabled&&comparisonMode==='sensors'?'selected':''} onClick={()=>{setComparisonMode('sensors');setComparisonEnabled(true);}}><Layers size={13}/>Sat vs Radar</button>
    </div>
    <span className="control-divider"/>
    <button aria-label={comparisonLayout==='split'?'Switch to swipe view':'Switch to split view'} onClick={()=>{setComparisonLayout(comparisonLayout==='split'?'swipe':'split');setComparisonEnabled(true);}}>{comparisonLayout==='split'?<Columns2 size={13}/>:<SplitSquareHorizontal size={13}/>} {comparisonLayout==='split'?'Split':'Swipe'}</button>
    <button aria-pressed={!comparisonEnabled} onClick={()=>setComparisonEnabled(!comparisonEnabled)}>{comparisonEnabled?<><X size={12}/>Single</>:'Compare'}</button>
  </div>

  {/* Stage Incompatibility Banner */}
  {comparisonEnabled && isStageIncompatible && (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-2 max-w-lg text-center animate-in fade-in slide-in-from-top-2 duration-200">
      <AlertTriangle size={15} className="text-rose-400 shrink-0" />
      <span>
        <strong>REJECTED — HYDROLOGICAL CONDITIONS NOT COMPARABLE:</strong> Stage delta of {stageDelta.toFixed(2)}m exceeds {isJamuna ? '1.0m' : '1.5m'} threshold. Waterline shift reflects stage recession rather than bank erosion.
      </span>
    </div>
  )}

  {comparisonEnabled&&comparisonLayout==='swipe'&&<div className="restored-swipe-handle" style={{left:swipePosition+'%'}} role="slider" aria-label="Map comparison slider" aria-valuemin={2} aria-valuemax={98} aria-valuenow={Math.round(swipePosition)} tabIndex={0} onKeyDown={keyboard} onPointerDown={pointer} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerMove={pointer}><div className="swipe-divider-line"/><div className="swipe-knob">↔</div><div className="swipe-description">{comparisonMode==='sensors'?'Optical ↔ Radar':'Drag to compare actual acquisitions'}</div></div>}
  {comparisonEnabled&&comparisonLayout==='split'&&<div className="restored-split-divider"/>}
  {comparisonEnabled&&<><div className="restored-compare-label left">{leftLabel}</div><div className="restored-compare-label right">{rightLabel}</div></>}
  {!comparisonEnabled&&<div className="restored-compare-label right">{optical?opticalLabel(selectedOpticalDate):radarLabel(selectedDate)}{optical&&satelliteView==='dated'&&opticalScene?.detail_tiles_url?' / 10 m source':''}</div>}
  <span className="comparison-source-sr">{evidence.observations[0].sensor}</span>
 </div>;
}
