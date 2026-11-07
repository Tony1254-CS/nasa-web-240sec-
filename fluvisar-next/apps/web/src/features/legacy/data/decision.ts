import { useEffect, useState } from 'react';
import type * as GeoJSON from 'geojson';
import type { EvidenceResult } from '../../../components/EvidenceStagePanels';

export interface HistoryRow {date:string;datetime:string;id:string;source_url:string;valid_pixel_count:number;scope_pixel_count:number;valid_fraction:number;water_area_ha:number;water_fraction:number|null;mean_vv_db:number|null;mean_vh_db:number|null}
export interface NisarRecord {id:string;datetime:string;orbit_direction:string;polarization:string|null;track:number|null;frame:number;source_url:string;preview_url?:string;preview_sha256?:string;preview_source_url?:string;processing_level:string}
export interface NasaContext {
 retrieved_at:string;research_cutoff:string;
 rainfall:{name:string;parameter:string;units:string;time_standard:string;grid_degrees:number;point:[number,number];source_products:string[];source_url:string;fallback_source_url:string;fallback_sha256:string;documentation_url:string;sha256:string;rows:{date:string;mm:number|null;source?:string;imerg_mm?:number|null}[]};
 nisar:{name:string;record_count:number;records:NisarRecord[];preview_pair:NisarRecord[];query_url:string;documentation_url:string;interpretation:string;sha256:string};
}
export interface DecisionContext {run_id:string;region_id:string;pair:[string,string];finding_id:string|null;scope:string;threshold_db:number;history:HistoryRow[];exposure:EvidenceResult&{map_assets:GeoJSON.FeatureCollection};nasa:NasaContext|null;interpretation:string;candidate_review:Record<string,{building:number;road:number;facility:number;settlement:number;asset_count:number;robust_core_ha:number;robust_fraction:number}>}
const cache=new Map<string,DecisionContext>();
export const changeLabels={'land-to-water':'Land → water','water-to-land':'Water → land'};
export function useDecisionContext(run:string,finding:string|null,enabled=true){
 const key=run+':'+(finding??'all');
 const [value,setValue]=useState<{key:string;data:DecisionContext}|null>(null),[error,setError]=useState<{key:string;message:string}|null>(null),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  if(!enabled)return;
  if(cache.has(key))return;
  const controller=new AbortController();
  fetch(`/api/runs/${encodeURIComponent(run)}/decision-context`+(finding?'?finding_id='+encodeURIComponent(finding):''),{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error(`Evidence service returned ${response.status}. Retry the source analysis.`);
   const data=await response.json() as DecisionContext;
   if(data.run_id!==run||data.finding_id!==finding)throw new Error('Evidence does not match this selected run.');
   cache.set(key,data);setValue({key,data});setError(null);
  }).catch(cause=>{if(!controller.signal.aborted)setError({key,message:String(cause.message??cause)});});
  return()=>controller.abort();
 },[key,enabled,attempt,run,finding]);
 return {data:enabled?(cache.get(key)??(value?.key===key?value.data:null)):null,error:error?.key===key?error.message:'',retry:()=>setAttempt(n=>n+1)};
}
export function rainfallWindow(nasa:NasaContext|null|undefined,end:string,days:number){
 const last=Date.parse(end),first=last-(days-1)*86400000;
 const rows=nasa?.rainfall.rows.filter(row=>Date.parse(row.date)>=first&&Date.parse(row.date)<=last)??[];
 return {total:rows.length===days&&rows.every(row=>row.mm!==null)?rows.reduce((sum,row)=>sum+(row.mm??0),0):null,rows};
}
