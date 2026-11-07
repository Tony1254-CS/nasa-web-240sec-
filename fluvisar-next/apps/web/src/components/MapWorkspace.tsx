import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { flyToStudyArea } from '../utils/mapFlyIn';
import { Camera, Check, Crosshair, Layers, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useObservatoryEvidence as useEvidence, number, type RegionEvidence } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';
maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');

type Corners = [[number,number],[number,number],[number,number],[number,number]];
type Side = 'a'|'b';
function selectedObservation(evidence:RegionEvidence,side:Side){
 const state=useWorkspaceStore.getState();
 const date=state.comparisonEnabled&&state.comparisonMode==='dates'?(state.selectedPair?.[side==='a'?0:1]??evidence.pair[side==='a'?0:1]):state.selectedDate;
 return evidence.observations.find(o=>o.date===date)??evidence.observations[1];
}
function actualRadarUrl(evidence:RegionEvidence,side:Side){
 const observation=selectedObservation(evidence,side);const {selectedPol,activeLens}=useWorkspaceStore.getState();
 if(selectedPol==='Ratio'&&observation.ratio_url)return String(observation.ratio_url);
 if((selectedPol==='RGB'||selectedPol==='Pauli')&&observation.rgb_url)return String(observation.rgb_url);
 return selectedPol==='VH'||selectedPol==='HV'||activeLens==='vh'?observation.vh_url:observation.vv_url;
}
function selectedOpticalObservation(evidence:RegionEvidence,side:Side){
 const state=useWorkspaceStore.getState();
 const date=state.basemapType==='satellite'&&state.comparisonEnabled&&state.comparisonMode==='dates'?state.selectedOpticalPair?.[side==='a'?0:1]:state.selectedOpticalDate;
 return evidence.optical_observations?.find(o=>o.date===date)??evidence.optical_observations?.at(-1);
}
function opticalCorners(observation:{[key:string]:unknown},fallback:Corners):Corners{
 const bbox=observation.display_bbox as number[]|undefined;
 return bbox?[[bbox[0],bbox[3]],[bbox[2],bbox[3]],[bbox[2],bbox[1]],[bbox[0],bbox[1]]]:fallback;
}
function coverStudyArea(map:maplibregl.Map,evidence:RegionEvidence){
 map.resize();
 const [w,s,e,n]=evidence.bbox;
 const compact=map.getContainer().clientWidth<600;
 map.fitBounds([[w,s],[e,n]],{padding:{top:compact?112:86,bottom:compact?90:80,left:compact?24:64,right:compact?24:64},maxZoom:14,duration:0,bearing:0,pitch:0});
}
export function MapWorkspace({observatory=false}:{observatory?:boolean}={}){
 const {evidence,comparisonReady}=useEvidence();
 const {regionId,viewId,basemapType,overlayStyle,comparisonMode,comparisonLayout,comparisonEnabled,swipePosition,selectedDate,selectedPair,selectedOpticalDate,selectedOpticalPair,selectedPol,activeLens,layerVisibility,isRightInspectorOpen,selectedFindingId,isAgentDrawerOpen,setBasemapType,setOverlayStyle}=useWorkspaceStore();
 const elementA=useRef<HTMLDivElement>(null),elementB=useRef<HTMLDivElement>(null);
 const maps=useRef<{a:maplibregl.Map|null;b:maplibregl.Map|null}>({a:null,b:null});
 const markers=useRef<maplibregl.Marker[]>([]);
 const aborts=useRef<{a:AbortController|null;b:AbortController|null}>({a:null,b:null});
 const [loaded,setLoaded]=useState({a:false,b:false}),[radarLoaded,setRadarLoaded]=useState(false),[zoom,setZoom]=useState(11.8),[saved,setSaved]=useState(false),[legend,setLegend]=useState(true);
 const [flyStage,setFlyStage]=useState('');const flight=useRef<((fit?:boolean)=>void)|null>(null);const arrived=useRef('');
 const compare=comparisonEnabled&&viewId!=='M0';
 const split=compare&&comparisonLayout==='split';
 const drawer=isRightInspectorOpen||Boolean(selectedFindingId)||isAgentDrawerOpen;
 const corners=useMemo<Corners>(()=>{const [w,s,e,n]=evidence.bbox;return [[w,n],[e,n],[e,s],[w,s]];},[evidence]);
 useEffect(()=>{for(const side of ['a','b'] as const)aborts.current[side]?.abort();useWorkspaceStore.getState().setSelectedSample(null);},[selectedDate,selectedPol,comparisonMode]);

 useEffect(()=>{
  if(!elementA.current||!elementB.current)return;
  setLoaded({a:false,b:false});setRadarLoaded(false);
  let synchronizing=false;
  const recordCamera=(map:maplibregl.Map)=>{
   const [w,s,e,n]=evidence.bbox,point=map.project([(w+e)/2,(s+n)/2]);
   const nw=map.project([w,n]),se=map.project([e,s]);
   map.getContainer().dataset.camera=JSON.stringify({center:map.getCenter().toArray(),zoom:map.getZoom(),bearing:map.getBearing(),pitch:map.getPitch(),anchor:[point.x,point.y],bounds:[[nw.x,nw.y],[se.x,se.y]]});
  };
  const sync=(from:Side,to:Side)=>{
   const source=maps.current[from],target=maps.current[to];if(!source||!target||synchronizing)return;
   synchronizing=true;target.jumpTo({center:source.getCenter(),zoom:source.getZoom(),bearing:source.getBearing(),pitch:source.getPitch()});recordCamera(source);recordCamera(target);synchronizing=false;
   setZoom(Number(source.getZoom().toFixed(1)));
  };
  for(const side of ['b','a'] as const){
   const map=new maplibregl.Map({container:(side==='a'?elementA.current:elementB.current)!,canvasContextAttributes:{preserveDrawingBuffer:true},attributionControl:false,
    style:{version:8,sources:{satellite:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'},carto:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'background',type:'background',paint:{'background-color':'#0f172a'}},{id:'satellite',type:'raster',source:'satellite',paint:{'raster-opacity':1}},{id:'carto',type:'raster',source:'carto',layout:{visibility:'none'}}]},
    center:regionId==='jamuna'?[89.75,25.575]:[89.70,21.875],zoom:viewId==='M0'?6.8:regionId==='jamuna'?11.5:11.8,minZoom:1,maxZoom:18});
   maps.current[side]=map;
   map.addControl(new maplibregl.ScaleControl({unit:'metric',maxWidth:100}),'bottom-left');
   if(side==='b')map.addControl(new maplibregl.AttributionControl({compact:true,customAttribution:'Copernicus Sentinel-1 / Sentinel-2'}),'bottom-right');
   map.on('move',()=>sync(side,side==='a'?'b':'a'));
   map.on('sourcedata',event=>{if(side==='b'&&event.sourceId==='observation'&&event.isSourceLoaded)setRadarLoaded(true);if(event.sourceId==='optical-observation'&&event.isSourceLoaded)map.getContainer().dataset.opticalLoaded='true';});
   map.once('style.load',()=>{
    map.addSource('observation',{type:'image',url:actualRadarUrl(evidence,side),coordinates:corners});
    map.addLayer({id:'observation',type:'raster',source:'observation',layout:{visibility:'none'},paint:{'raster-opacity':1,'raster-resampling':'nearest'}});
    const optical=selectedOpticalObservation(evidence,side);
    if(optical){map.getContainer().dataset.opticalUrl=optical.url;map.getContainer().dataset.opticalLoaded='false';map.addSource('optical-observation',{type:'image',url:optical.url,coordinates:opticalCorners(optical,corners)});map.addLayer({id:'optical-observation',type:'raster',source:'optical-observation',paint:{'raster-opacity':1,'raster-resampling':'linear'}});map.moveLayer('optical-observation','observation');}
    map.addSource('water-mask',{type:'image',url:selectedObservation(evidence,side).water_url,coordinates:corners});
    map.addLayer({id:'water-mask',type:'raster',source:'water-mask',layout:{visibility:'none'},paint:{'raster-opacity':0.5,'raster-resampling':'nearest'}});
    map.addSource('findings',{type:'geojson',data:evidence.findings});
    const [west,south,east,north]=evidence.bbox;
    map.addSource('support',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[west,north],[east,north],[east,south],[west,south],[west,north]]]}}});
    map.addLayer({id:'study-boundary',type:'line',source:'support',layout:{visibility:observatory?'visible':'none'},paint:{'line-color':'#57e0d2','line-width':1.5,'line-opacity':0.8,'line-dasharray':[5,3]}});
    map.addLayer({id:'support-outline',type:'line',source:'support',layout:{visibility:'none'},paint:{'line-color':'#38BDF8','line-width':3,'line-dasharray':[3,2]}});
    map.addLayer({id:'candidate-fill',type:'fill',source:'findings',paint:{'fill-color':['match',['get','category'],'land-to-water','#EF4444','#10B981'],'fill-opacity':0}});
    map.addLayer({id:'candidate-outline',type:'line',source:'findings',paint:{'line-color':['match',['get','category'],'land-to-water','#EF4444','#10B981'],'line-width':2,'line-dasharray':[3,2]}});
    map.on('click','candidate-fill',event=>{const id=event.features?.[0]?.properties?.id;if(id)useWorkspaceStore.getState().setSelectedFinding(String(id));});
    if(side==='b')for(const category of ['land-to-water','water-to-land'] as const){
     const feature=evidence.findings.features.find(f=>f.properties.category===category);if(!feature)continue;
     const button=document.createElement('button');button.className='restored-candidate-marker '+(category==='land-to-water'?'is-retreat':'is-emergence');
     button.textContent=(category==='land-to-water'?'🔴 Land → water: ':'🌱 Water → land: ')+number(feature.properties.area_ha,2)+' ha';
     button.title=feature.properties.id+' · inspect source-derived candidate';button.addEventListener('click',event=>{event.stopPropagation();useWorkspaceStore.getState().setSelectedFinding(feature.properties.id);});
     markers.current.push(new maplibregl.Marker({element:button}).setLngLat(feature.properties.centroid).addTo(map));
    }
    recordCamera(map);
    setLoaded(previous=>({...previous,[side]:true}));
   });
   map.on('click',async event=>{
    const state=useWorkspaceStore.getState();
    const visibleSide=state.comparisonEnabled&&state.comparisonLayout==='swipe'&&side==='b'&&event.point.x<map.getContainer().clientWidth*state.swipePosition/100?'a':side;
    const viewingOptical=state.comparisonEnabled&&state.comparisonMode==='sensors'?visibleSide==='a':state.basemapType==='satellite';
    if(viewingOptical)return;
    const observation=selectedObservation(evidence,visibleSide);
    const channel=state.selectedPol==='VH'||state.selectedPol==='HV'||state.activeLens==='vh'?'vh':'vv';
    aborts.current[side]?.abort();const controller=new AbortController();aborts.current[side]=controller;
    const lon=event.lngLat.lng,lat=event.lngLat.lat;
    try{
     const read=async(band:string)=>{const response=await fetch('/api/artifacts/'+encodeURIComponent(observation.id)+'/sample?lon='+lon+'&lat='+lat+'&channel='+band,{signal:controller.signal});if(!response.ok)throw new Error('Pixel sampling connection interrupted');return response.json();};
     let sample;
     if(state.selectedPol==='Ratio'){const [vv,vh]=await Promise.all([read('vv'),read('vh')]);sample={...vv,source_channel:'VV/VH ratio (dB)',value:vv.masked||vh.masked?null:vv.value-vh.value,masked:vv.masked||vh.masked,reason:vv.reason??vh.reason};}
     else sample=await read(channel);
     if(!controller.signal.aborted)useWorkspaceStore.getState().setSelectedSample({...sample,lon,lat});
    }
    catch(error){if(!controller.signal.aborted)useWorkspaceStore.getState().setSelectedSample({lon,lat,value:null,unit:'dB',masked:true,reason:String(error)});}
   });
  }
  const observer=new ResizeObserver(()=>{for(const map of Object.values(maps.current))map?.resize();sync('b','a');});observer.observe(elementB.current);observer.observe(elementA.current);
  return()=>{flight.current?.(false);flight.current=null;observer.disconnect();for(const marker of markers.current)marker.remove();markers.current=[];for(const side of ['a','b'] as const){aborts.current[side]?.abort();maps.current[side]?.remove();maps.current[side]=null;}};
 },[evidence,corners,regionId,observatory]);

 useEffect(()=>{
  for(const side of ['a','b'] as const){
   const map=maps.current[side];if(!map||!loaded[side]||!map.getLayer('observation'))continue;
   const type=compare&&comparisonMode==='sensors'?(side==='a'?'satellite':'sar'):basemapType;
   const optical=selectedOpticalObservation(evidence,side);
   if(map.getLayer('optical-observation')){
    map.setLayoutProperty('optical-observation','visibility',type!=='carto'?'visible':'none');
    if(optical&&map.getContainer().dataset.opticalUrl!==optical.url){map.getContainer().dataset.opticalLoaded='false';map.getContainer().dataset.opticalUrl=optical.url;(map.getSource('optical-observation') as maplibregl.ImageSource).updateImage({url:optical.url,coordinates:opticalCorners(optical,corners)});}
   }
   const shown=type==='satellite'?optical:selectedObservation(evidence,side);
   map.getContainer().dataset.observationId=shown?.id??'esri-context';
   map.getContainer().dataset.observationDate=shown?.date??'';
   map.getContainer().dataset.observationUrl=type==='satellite'?optical?.url??'':actualRadarUrl(evidence,side);
   map.setLayoutProperty('satellite','visibility',type==='carto'?'none':'visible');
   map.setLayoutProperty('carto','visibility',type==='carto'?'visible':'none');
   map.setLayoutProperty('observation','visibility',type==='sar'?'visible':'none');
   (map.getSource('observation') as maplibregl.ImageSource).updateImage({url:actualRadarUrl(evidence,side),coordinates:corners});
   (map.getSource('water-mask') as maplibregl.ImageSource).updateImage({url:selectedObservation(evidence,side).water_url,coordinates:corners});
   map.setLayoutProperty('water-mask','visibility',type==='sar'&&(activeLens==='water'||(overlayStyle==='tinted'&&layerVisibility.water))?'visible':'none');
   const showCandidates=comparisonReady&&type==='sar'&&Boolean(layerVisibility.transitions)&&(side==='b'||!compare);
   for(const id of ['candidate-fill','candidate-outline'])map.setLayoutProperty(id,'visibility',showCandidates?'visible':'none');
   map.setPaintProperty('candidate-fill','fill-opacity',overlayStyle==='tinted'?0.26:0);
   map.setPaintProperty('candidate-outline','line-width',overlayStyle==='tinted'?1.2:2);
   map.setLayoutProperty('support-outline','visibility',layerVisibility.coverage?'visible':'none');
  }
  for(const marker of markers.current)marker.getElement().style.display=comparisonReady&&(basemapType==='sar'||compare&&comparisonMode==='sensors')&&layerVisibility.transitions?'':'none';
 },[evidence,corners,loaded,basemapType,compare,comparisonMode,selectedDate,selectedPair,selectedOpticalDate,selectedOpticalPair,selectedPol,activeLens,layerVisibility,overlayStyle,comparisonReady]);

 const replay=()=>{
  const map=maps.current.b;if(!map||!loaded.b)return;
  flight.current?.(false);
  const compact=map.getContainer().clientWidth<600;
  flight.current=flyToStudyArea(map,evidence.bbox,{padding:{top:compact?112:86,bottom:compact?90:80,left:compact?24:64,right:compact?24:64},maxZoom:14,bearing:0,pitch:0},setFlyStage);
 };
 useEffect(()=>{
  const map=maps.current.b;if(!map||!loaded.b||!loaded.a)return;
  if(viewId==='M0'){map.jumpTo({center:[89.8,23.8],zoom:6.8});return;}
  let seen=false;try{seen=sessionStorage.getItem('fluvisar-flyin:'+regionId)==='seen';}catch{/* Session storage optional. */}
  if(observatory&&!seen&&arrived.current!==regionId){arrived.current=regionId;try{sessionStorage.setItem('fluvisar-flyin:'+regionId,'seen');}catch{}replay();}
  else if(!flyStage)coverStudyArea(map,evidence);
 },[evidence,loaded.b,loaded.a,viewId==='M0',split]);
 useEffect(()=>{
  if(!loaded.b||!selectedFindingId)return;
  const finding=evidence.findings.features.find(f=>f.properties.id===selectedFindingId);if(!finding)return;
  flight.current?.(false);maps.current.b?.flyTo({center:finding.properties.centroid,zoom:14,duration:850});
 },[selectedFindingId,loaded.b,evidence]);

 const recenter=()=>{flight.current?.(false);const map=maps.current.b;if(!map)return;if(observatory)coverStudyArea(map,evidence);else map.jumpTo({center:regionId==='jamuna'?[89.75,25.575]:[89.70,21.875],zoom:regionId==='jamuna'?11.5:11.8});};
 const capture=()=>{const a=maps.current.a,b=maps.current.b;if(!a||!b)return;try{const canvas=document.createElement('canvas'),ca=a.getCanvas(),cb=b.getCanvas();canvas.width=split?ca.width+cb.width:cb.width;canvas.height=cb.height;const ctx=canvas.getContext('2d')!;if(split){ctx.drawImage(ca,0,0);ctx.drawImage(cb,ca.width,0);}else{ctx.drawImage(cb,0,0);if(compare){ctx.save();ctx.beginPath();ctx.rect(0,0,canvas.width*swipePosition/100,canvas.height);ctx.clip();ctx.drawImage(ca,0,0);ctx.restore();}}const link=document.createElement('a');link.href=canvas.toDataURL('image/png');link.download='FluviSAR_'+regionId+'_'+comparisonMode+'.png';link.click();setSaved(true);}catch(error){console.error('Snapshot failed',error);}};
 const right=drawer?'min(440px, max(12px, calc(100vw - 370px)))':'12px';
 return <div className="restored-map-workspace" data-comparison-layout={split?'split':'swipe'} data-comparison-enabled={compare} data-flyin-active={Boolean(flyStage)}>
  {observatory&&<div className="map-flyin-controls">{flyStage?<><span>{flyStage}</span><button onClick={()=>flight.current?.(true)}>Skip intro</button></>:<button className="flyin-replay" onClick={replay}>Replay fly-in</button>}</div>}
  <div ref={elementB} className="restored-map-pane map-pane-b radar-map-canvas" data-map-loaded={loaded.b} data-radar-loaded={radarLoaded} style={split?{left:'50%',width:'50%'}:{left:0,width:'100%'}}/>
  <div ref={elementA} className="restored-map-pane map-pane-a" data-map-loaded={loaded.a} style={split?{left:0,width:'50%',visibility:compare?'visible':'hidden'}:{left:0,width:'100%',visibility:compare?'visible':'hidden',clipPath:'inset(0 '+(100-swipePosition)+'% 0 0)',pointerEvents:'none'}}/>
  <div className="restored-map-options" style={{right}} aria-label="Map display options"><div className="restored-basemaps">{(['satellite','sar','carto'] as const).map(type=><button key={type} aria-pressed={basemapType===type} title={type==='sar'?'Calibrated Sentinel-1 RTC radar':type==='satellite'?'High-resolution satellite imagery':'OpenStreetMap cartography'} onClick={()=>{setBasemapType(type);if(comparisonMode==='sensors')useWorkspaceStore.getState().setComparisonMode('dates');}} className={basemapType===type?'selected':''}>{type==='satellite'?'🛰️ Satellite':type==='sar'?'📡 Radar':'🗺️ Carto'}</button>)}</div><button aria-label="Toggle outlines and tint" className={'restored-outline-toggle '+(overlayStyle==='outlines'?'selected':'')} onClick={()=>setOverlayStyle(overlayStyle==='outlines'?'tinted':'outlines')}>{overlayStyle==='outlines'?'✏️ Outlines':'🎨 Tinted'}</button></div>
  <div className="restored-map-tools" style={{right}}><button aria-label="Zoom in" title="Zoom in" onClick={()=>maps.current.b?.zoomIn()}><Plus size={16}/></button>{observatory&&<input aria-label="Map zoom" type="range" min="1" max="18" step="0.1" value={zoom} onChange={event=>maps.current.b?.jumpTo({zoom:Number(event.target.value)})}/>}<span>{zoom.toFixed(1)}</span><button aria-label="Zoom out" title="Zoom out" onClick={()=>maps.current.b?.zoomOut()}><Minus size={16}/></button><hr/><button aria-label="Recenter study area" title="Fit the complete study area" onClick={recenter}><Crosshair size={16}/></button><button aria-label="Download map image" title="Download map snapshot" onClick={capture}>{saved?<Check size={16}/>:<Camera size={16}/>}</button></div>
  {viewId!=='M0'&&<div className="restored-map-legend" style={{right}}><button onClick={()=>setLegend(!legend)} aria-expanded={legend}><Layers size={14}/>Radar transitions{legend?<ChevronDown size={14}/>:<ChevronUp size={14}/>}</button>{legend&&comparisonReady&&<div><p><i className="candidate-red"/>Land → water: {number(evidence.metrics.land_to_water_ha,2)} ha</p><p><i className="candidate-green"/>Water → land: {number(evidence.metrics.water_to_land_ha,2)} ha</p><small>Source-derived screening candidates · {evidence.observations[0].sensor}</small></div>}</div>}
 </div>;
}
