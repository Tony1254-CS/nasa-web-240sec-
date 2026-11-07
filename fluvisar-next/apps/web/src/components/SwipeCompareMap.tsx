import { Calendar, Columns2, Layers, SplitSquareHorizontal, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useObservatoryEvidence as useEvidence, readableDate } from '../data/evidence';
import type { KeyboardEvent, PointerEvent } from 'react';
export function SwipeCompareMap({dateA,dateB}:{dateA:string;dateB:string}){
 const {evidence}=useEvidence();
 const {swipePosition,setSwipePosition,comparisonMode,setComparisonMode,comparisonLayout,setComparisonLayout,comparisonEnabled,setComparisonEnabled,basemapType,selectedDate,selectedPair,selectedOpticalDate,selectedOpticalPair}=useWorkspaceStore();
 const optical=basemapType==='satellite';
 const radarPair=selectedPair??[dateA,dateB];
 const opticalPair=selectedOpticalPair??evidence.optical_pair;
 const radarDate=comparisonEnabled&&comparisonMode==='dates'?radarPair[1]:selectedDate;
 const opticalDate=comparisonEnabled&&comparisonMode==='dates'?opticalPair?.[1]:selectedOpticalDate;
 const opticalScene=evidence.optical_observations?.find(o=>o.date===opticalDate);
 const opticalLabel=(date:string|undefined)=>date?'Sentinel-2 optical · '+readableDate(date):'Esri context mosaic';
 const radarLabel=(date:string)=>'Sentinel-1 radar · '+readableDate(date);
 const leftLabel=comparisonMode==='sensors'?opticalLabel(selectedOpticalDate):optical?opticalLabel(opticalPair?.[0]):radarLabel(radarPair[0]);
 const rightLabel=comparisonMode==='sensors'?radarLabel(selectedDate):optical?opticalLabel(opticalDate):radarLabel(radarDate);
 const pointer=(event:PointerEvent<HTMLDivElement>)=>{if(event.type!=='pointerdown'&&!event.currentTarget.hasPointerCapture(event.pointerId))return;if(event.type==='pointerdown')event.currentTarget.setPointerCapture(event.pointerId);const rect=event.currentTarget.parentElement!.getBoundingClientRect();setSwipePosition(Math.max(2,Math.min(98,(event.clientX-rect.left)/rect.width*100)));};
 const keyboard=(event:KeyboardEvent<HTMLDivElement>)=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setSwipePosition(Math.max(2,Math.min(98,swipePosition+(event.key==='ArrowLeft'?-1:1))));}};
 return <div className="restored-comparison-overlay">
  <div className="restored-comparison-toolbar" aria-label="Comparison controls"><div className="comparison-mode-buttons"><button className={comparisonEnabled&&comparisonMode==='dates'?'selected':''} onClick={()=>{setComparisonMode('dates');setComparisonEnabled(true);}}><Calendar size={13}/>Dates</button><button className={comparisonEnabled&&comparisonMode==='sensors'?'selected':''} onClick={()=>{setComparisonMode('sensors');setComparisonEnabled(true);}}><Layers size={13}/>Sat vs Radar</button></div><span className="control-divider"/><button aria-label={comparisonLayout==='split'?'Switch to swipe view':'Switch to split view'} onClick={()=>{setComparisonLayout(comparisonLayout==='split'?'swipe':'split');setComparisonEnabled(true);}}>{comparisonLayout==='split'?<Columns2 size={13}/>:<SplitSquareHorizontal size={13}/>} {comparisonLayout==='split'?'Split':'Swipe'}</button><button aria-pressed={!comparisonEnabled} onClick={()=>setComparisonEnabled(!comparisonEnabled)}>{comparisonEnabled?<><X size={12}/>Single</>:'Compare'}</button></div>
  {comparisonEnabled&&comparisonLayout==='swipe'&&<div className="restored-swipe-handle" style={{left:swipePosition+'%'}} role="slider" aria-label="Map comparison slider" aria-valuemin={2} aria-valuemax={98} aria-valuenow={Math.round(swipePosition)} tabIndex={0} onKeyDown={keyboard} onPointerDown={pointer} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerMove={pointer}><div className="swipe-divider-line"/><div className="swipe-knob">↔</div><div className="swipe-description">{comparisonMode==='sensors'?'Optical ↔ Radar':'Drag to compare actual acquisitions'}</div></div>}
  {comparisonEnabled&&comparisonLayout==='split'&&<div className="restored-split-divider"/>}
  {comparisonEnabled&&<><div className="restored-compare-label left">{leftLabel}</div><div className="restored-compare-label right">{rightLabel}</div></>}
  {!comparisonEnabled&&<div className="restored-compare-label right">{optical?opticalLabel(selectedOpticalDate):radarLabel(selectedDate)}{opticalScene?.detail_tiles_url?' / 10 m source':''}{opticalScene?' · '+Math.round(opticalScene.cloud_fraction*100)+'% ROI cloud/shadow':''}</div>}
  <span className="comparison-source-sr">{evidence.observations[0].sensor}</span>
 </div>;
}
