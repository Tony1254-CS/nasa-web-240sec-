import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, ImageSource, Map as MapLibreMap } from 'maplibre-gl';
import type * as GeoJSON from 'geojson';
import type { RegionEvidence } from '../../../data/evidence';
import { Crosshair, Minus, Plus } from 'lucide-react';

const EMPTY:GeoJSON.FeatureCollection={type:'FeatureCollection',features:[]};
interface Props {
 evidence:RegionEvidence;date:string;channel:'vv'|'vh';radar:boolean;water:boolean;compare:boolean;swipe:number;
 selected:string|null;topN:number;assets:GeoJSON.FeatureCollection|null;showAssets:boolean;
 scenario:GeoJSON.Feature<GeoJSON.Polygon>|null;onSelect:(id:string)=>void;focus:number;
 optical:boolean;onSwipe:(value:number)=>void;
}
function boundsOf(geometry:GeoJSON.Geometry):[number,number,number,number]{
 const points:number[][]=[];
 const visit=(value:unknown)=>{if(Array.isArray(value)){if(typeof value[0]==='number')points.push(value as number[]);else value.forEach(visit);}};
 if('coordinates'in geometry)visit(geometry.coordinates);
 return [Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
}
export function ImpactMap(props:Props){
 const root=useRef<HTMLDivElement>(null), mainEl=useRef<HTMLDivElement>(null), beforeEl=useRef<HTMLDivElement>(null);
 const main=useRef<MapLibreMap|null>(null),before=useRef<MapLibreMap|null>(null);
 const latest=useRef(props);useLayoutEffect(()=>{latest.current=props;});
 const [ready,setReady]=useState(false),[failure,setFailure]=useState('');
 const fit=()=>{
  const p=latest.current;const selected=p.evidence.findings.features.find(f=>f.properties.id===p.selected);
  main.current?.fitBounds(selected?boundsOf(selected.geometry):p.evidence.bbox,{padding:selected?80:24,duration:450,maxZoom:selected?15:11});
 };
 useEffect(()=>{
  if(!mainEl.current||!beforeEl.current)return;
  let disposed=false,syncing=false;
  const make=(container:HTMLDivElement,isBefore:boolean)=>{
   const map=new maplibregl.Map({container,attributionControl:isBefore?false:{compact:true},
    interactive:!isBefore,style:{version:8,sources:{satellite:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'}},layers:[{id:'background',type:'background',paint:{'background-color':'#162a30'}},{id:'satellite',type:'raster',source:'satellite'}]},
    bounds:props.evidence.bbox,fitBoundsOptions:{padding:24},minZoom:5,maxZoom:18});
   map.once('style.load',()=>{
    const p=latest.current, [w,s,e,n]=p.evidence.bbox;const corners:[[number,number],[number,number],[number,number],[number,number]]=[[w,n],[e,n],[e,s],[w,s]];
    const observation=p.evidence.observations.find(o=>o.date===p.evidence.pair[isBefore?0:1])!;
    for(const [id,url] of [['radar',observation.vv_url],['water',observation.water_url]] as const){
     map.addSource(id,{type:'image',url,coordinates:corners});map.addLayer({id,type:'raster',source:id,paint:{'raster-opacity':id==='radar'?.96:0,'raster-fade-duration':0}});
    }
    const optics=p.evidence.optical_observations??[];
    if(optics.length){const o=optics.at(-1)!;const b=(o.display_bbox??p.evidence.bbox) as number[];map.addSource('optical',{type:'image',url:o.url,coordinates:[[b[0],b[3]],[b[2],b[3]],[b[2],b[1]],[b[0],b[1]]]});map.addLayer({id:'optical',type:'raster',source:'optical',paint:{'raster-opacity':0,'raster-fade-duration':0}},'radar');}
    map.addSource('footprint',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[w,s],[e,s],[e,n],[w,n],[w,s]]]}}});
    map.addLayer({id:'footprint',type:'line',source:'footprint',paint:{'line-color':'#80dfd1','line-width':1,'line-dasharray':[5,4],'line-opacity':.7}});
    map.addSource('changes',{type:'geojson',data:EMPTY});
    map.addLayer({id:'change-fill',type:'fill',source:'changes',paint:{'fill-color':['match',['get','category'],'land-to-water','#f47d64','#58c8ac'],'fill-opacity':.2}});
    map.addLayer({id:'change-line',type:'line',source:'changes',paint:{'line-color':['match',['get','category'],'land-to-water','#ff957d','#74e3c3'],'line-width':1.6}});
    map.addSource('selected',{type:'geojson',data:EMPTY});map.addLayer({id:'selected',type:'line',source:'selected',paint:{'line-color':'#ffffff','line-width':3,'line-dasharray':[3,1]}});
    map.addSource('assets',{type:'geojson',data:EMPTY});
    map.addLayer({id:'asset-polygons',type:'fill',source:'assets',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#f5db8b','fill-opacity':.85}});
    map.addLayer({id:'asset-lines',type:'line',source:'assets',filter:['==',['geometry-type'],'LineString'],paint:{'line-color':'#f5db8b','line-width':3}});
    map.addLayer({id:'asset-points',type:'circle',source:'assets',filter:['==',['geometry-type'],'Point'],paint:{'circle-color':'#f5db8b','circle-radius':5,'circle-stroke-color':'#19303b','circle-stroke-width':1}});
    map.addSource('scenario',{type:'geojson',data:EMPTY});map.addLayer({id:'scenario-fill',type:'fill',source:'scenario',paint:{'fill-color':'#efbc56','fill-opacity':.14}});map.addLayer({id:'scenario-line',type:'line',source:'scenario',paint:{'line-color':'#efbc56','line-width':2,'line-dasharray':[3,2]}});
    if(!isBefore){map.on('click','change-fill',event=>{const id=event.features?.[0]?.properties?.id;if(id)latest.current.onSelect(String(id));});map.on('mouseenter','change-fill',()=>{map.getCanvas().style.cursor='pointer';});map.on('mouseleave','change-fill',()=>{map.getCanvas().style.cursor='';});}
    if(!disposed&&main.current?.getSource('changes')&&before.current?.getSource('changes'))setReady(true);
   });
   map.on('error',event=>{if(event.error?.message?.includes('WebGL'))setFailure('The map needs WebGL. The candidate list and evidence remain accessible.');});
   return map;
  };
  const a=make(mainEl.current,false),b=make(beforeEl.current,true);main.current=a;before.current=b;
  a.addControl(new maplibregl.ScaleControl({maxWidth:90}),'bottom-left');
  const sync=()=>{if(syncing)return;syncing=true;b.jumpTo({center:a.getCenter(),zoom:a.getZoom(),bearing:a.getBearing(),pitch:a.getPitch()});syncing=false;};a.on('move',sync);
  const resize=new ResizeObserver(()=>{a.resize();b.resize();sync();});resize.observe(root.current!);
  return()=>{disposed=true;resize.disconnect();a.remove();b.remove();main.current=null;before.current=null;};
 },[props.evidence.region_id,props.evidence.bbox]);
 useEffect(()=>{
  if(!ready)return;
  const p=props;
  for(const [map,isBefore] of [[main.current,false],[before.current,true]] as const){
   if(!map?.getSource('changes'))continue;
   const date=isBefore?p.evidence.pair[0]:(p.compare?p.evidence.pair[1]:p.date);
   const observation=p.evidence.observations.find(o=>o.date===date);if(!observation)continue;
   (map.getSource('radar') as ImageSource).updateImage({url:p.channel==='vh'?observation.vh_url:observation.vv_url});
   (map.getSource('water') as ImageSource).updateImage({url:observation.water_url});
   map.setPaintProperty('radar','raster-opacity',p.radar?.96:0);map.setPaintProperty('water','raster-opacity',p.water?.68:0);
   if(map.getSource('optical')){
    const optics=p.evidence.optical_observations??[];const o=[...optics].sort((a,b)=>Math.abs(Date.parse(a.date)-Date.parse(date))-Math.abs(Date.parse(b.date)-Date.parse(date)))[0];
    if(o){const b=(o.display_bbox??p.evidence.bbox) as number[];(map.getSource('optical') as ImageSource).updateImage({url:o.url,coordinates:[[b[0],b[3]],[b[2],b[3]],[b[2],b[1]],[b[0],b[1]]]});map.setPaintProperty('optical','raster-opacity',p.optical?1:0);}
   }
   const changes=['land-to-water','water-to-land'].flatMap(category=>p.evidence.findings.features.filter(f=>f.properties.category===category).sort((a,b)=>b.properties.area_ha-a.properties.area_ha).slice(0,p.topN));
   (map.getSource('changes') as GeoJSONSource).setData({type:'FeatureCollection',features:changes});
   (map.getSource('selected') as GeoJSONSource).setData({type:'FeatureCollection',features:p.evidence.findings.features.filter(f=>f.properties.id===p.selected)});
   (map.getSource('assets') as GeoJSONSource).setData(p.showAssets?(p.assets??EMPTY):EMPTY);
   (map.getSource('scenario') as GeoJSONSource).setData(p.scenario??EMPTY);
  }
 },[props,ready]);
 useEffect(()=>{if(ready)fit();},[props.focus,props.selected,ready]);
 return <div className="impact-map" ref={root} data-map-ready={ready}>
  <div ref={mainEl} className="impact-map-canvas"/>
  <div className="impact-map-curtain" style={{clipPath:`inset(0 ${props.compare?100-props.swipe:100}% 0 0)`}}><div ref={beforeEl} className="impact-map-canvas"/></div>
  {props.compare&&<><div className="impact-swipe-line" style={{left:`${props.swipe}%`}}><span>↔</span></div><input className="impact-map-swipe-input" aria-label="Map comparison divider" type="range" min="0" max="100" value={props.swipe} onChange={event=>props.onSwipe(Number(event.target.value))}/></>}
  <div className="impact-map-nav"><button onClick={()=>main.current?.zoomIn()} aria-label="Zoom in"><Plus size={17}/></button><button onClick={()=>main.current?.zoomOut()} aria-label="Zoom out"><Minus size={17}/></button><button onClick={fit} aria-label="Focus study area or selected change"><Crosshair size={17}/></button></div>
  {failure&&<p role="alert" className="impact-map-failure">{failure}</p>}
 </div>;
}
