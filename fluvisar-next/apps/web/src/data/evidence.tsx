import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWorkspaceStore, type RegionId } from '../store/workspaceStore';
import type * as GeoJSON from 'geojson';

export interface RadarObservation {
  id:string; date:string; datetime:string; sensor:string; source_url:string;
  vv_url:string; vh_url:string; water_url:string; numeric_path:string; vh_numeric_path?:string;
  valid_fraction:number; water_area_ha:number; mean_vv_db:number; mean_vh_db:number;
  [key:string]:unknown;
}
export interface ObservedFinding {
  type:'Feature'; geometry:GeoJSON.Polygon|GeoJSON.MultiPolygon;
  properties:{id:string; category:'land-to-water'|'water-to-land'; area_ha:number; pixel_count:number; centroid:[number,number]; [key:string]:unknown};
}
export interface RegionEvidence {
  region_id:RegionId; name:string; bbox:[number,number,number,number]; run_id:string; pair:[string,string];
  observations:RadarObservation[];
  optical_observations?:OpticalObservation[];
  optical_pair?:[string,string];
  pair_bundles?:Record<string,string>;
  metrics:{land_to_water_ha:number;water_to_land_ha:number;common_valid_area_ha:number;common_valid_fraction:number;water_area_t0_ha:number;water_area_t1_ha:number;[key:string]:number};
  findings:{type:'FeatureCollection';features:ObservedFinding[]};
  qc:{id:string;name:string;status:string;reason:string}[];
  sources:unknown[];
  [key:string]:unknown;
}
export interface EvidenceIndex { generated_at:string;method:unknown;regions:Record<RegionId,RegionEvidence> }
export interface OpticalObservation {id:string;date:string;datetime:string;sensor:string;url:string;source_url:string;cloud_fraction:number;display_sha256:string;[key:string]:unknown}
let cached:EvidenceIndex|undefined;
let pending:Promise<EvidenceIndex>|undefined;
export function loadEvidence():Promise<EvidenceIndex> {
  if(cached) return Promise.resolve(cached);
  if(!pending) pending=fetch('/observations/index.json').then(async response=>{
    if(!response.ok) throw new Error(`Observation bundle could not be loaded (${response.status}).`);
    const value=await response.json() as EvidenceIndex;
    for(const region of ['jamuna','sundarbans'] as const) {
      const entry=value.regions?.[region];
      if(!entry || entry.observations.length<2 || !entry.observations.every(o=>o.id&&o.datetime&&o.source_url)) throw new Error(`Incomplete observation provenance for ${region}.`);
      if(!Object.values(entry.metrics).every(Number.isFinite)) throw new Error(`Non-numeric measurement in ${region}.`);
    }
    cached=value; return value;
  }).catch(error=>{pending=undefined;throw error;});
  return pending;
}
export function currentEvidence(region:RegionId) {
  if(!cached) throw new Error('Observation catalogue is still loading.');
  return cached.regions[region];
}
const EvidenceContext=createContext<EvidenceIndex|null>(null);
export function EvidenceProvider({children}:{children:ReactNode}) {
  const [index,setIndex]=useState<EvidenceIndex|null>(null);
  const [error,setError]=useState('');
  const region=useWorkspaceStore(s=>s.regionId);
  useEffect(()=>{let active=true; loadEvidence().then(value=>{if(active){const evidence=value.regions[useWorkspaceStore.getState().regionId];useWorkspaceStore.setState({runId:evidence.run_id,availableDates:evidence.observations.map(o=>o.date).sort(),selectedPair:evidence.pair,selectedDate:evidence.pair[1],selectedSample:null,selectedOpticalPair:evidence.optical_pair??null,selectedOpticalDate:evidence.optical_pair?.[1]??''});setIndex(value);}}).catch(cause=>{if(active)setError(String(cause));});return()=>{active=false;};},[]);
  useEffect(()=>{if(index){const evidence=index.regions[region];useWorkspaceStore.setState({runId:evidence.run_id,availableDates:evidence.observations.map(o=>o.date).sort(),selectedPair:evidence.pair,selectedDate:evidence.pair[1],selectedFindingId:null,selectedSample:null,selectedOpticalPair:evidence.optical_pair??null,selectedOpticalDate:evidence.optical_pair?.[1]??''});}},[index,region]);
  if(error) return <div className="data-boot"><h1>Observation connection interrupted</h1><p>{error}</p><button onClick={()=>window.location.reload()}>Retry loading data</button></div>;
  if(!index) return <div className="data-boot"><div className="data-boot-radar"/><p>Opening the satellite evidence catalogue…</p></div>;
  return <EvidenceContext.Provider value={index}>{children}</EvidenceContext.Provider>;
}
export function useEvidence() {
  const index=useContext(EvidenceContext);
  const region=useWorkspaceStore(s=>s.regionId);
  if(!index) throw new Error('Evidence provider missing.');
  return {index,evidence:index.regions[region]};
}
const comparisonCache=new Map<string,Partial<RegionEvidence>>();
export function useObservatoryEvidence(){
 const {index,evidence:base}=useEvidence();
 const pair=useWorkspaceStore(state=>state.selectedPair);
 const key=base.region_id+':'+(pair??base.pair).join('_');
 const isDefault=!pair||pair.join('_')===base.pair.join('_');
 const url=base.pair_bundles?.[(pair??base.pair).join('_')];
 const [loaded,setLoaded]=useState<{key:string;bundle:Partial<RegionEvidence>}|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  setError('');if(isDefault||!url)return;
  const known=comparisonCache.get(key);if(known){setLoaded({key,bundle:known});return;}
  let active=true;
  fetch(url).then(response=>{if(!response.ok)throw new Error('Could not load selected pair');return response.json();}).then(bundle=>{comparisonCache.set(key,bundle);if(active)setLoaded({key,bundle});}).catch(cause=>{if(active)setError(String(cause));});
  return()=>{active=false;};
 },[key,url,isDefault]);
 const bundle=isDefault?null:loaded?.key===key?loaded.bundle:comparisonCache.get(key);
 const evidence=useMemo(()=>bundle?{...base,...bundle} as RegionEvidence:base,[base,bundle]);
 return {index,evidence,comparisonReady:isDefault||Boolean(bundle),comparisonError:error};
}
export const number = (value:number,digits=1)=>value.toLocaleString('en-US',{maximumFractionDigits:digits});
export const readableDate=(date:string)=>new Intl.DateTimeFormat('en',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date));
