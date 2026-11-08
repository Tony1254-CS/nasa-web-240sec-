import type {RegionEvidence, RadarObservation} from './evidence';

export type OutlookMethod='persistence'|'drift';
const DAY=86400000;
const time=(date:string)=>Date.parse(date+'T00:00:00Z')/DAY;
export const methodName=(method:OutlookMethod)=>method==='persistence'?'Last-observation baseline':'Elapsed-time drift';
function estimate(rows:RadarObservation[],target:string,method:OutlookMethod){
 const first=rows[0],last=rows.at(-1)!;
 return last.water_area_ha+(method==='drift'?(last.water_area_ha-first.water_area_ha)/(time(last.date)-time(first.date))*(time(target)-time(last.date)):0);
}
export function buildWaterOutlook(region:RegionEvidence,horizonDays=12,requested:'auto'|OutlookMethod='auto'){
 const rows=[...region.observations].sort((a,b)=>a.date.localeCompare(b.date));
 if(rows.length<4||!rows.every(o=>Number.isFinite(o.water_area_ha)&&Number.isFinite(time(o.date)))||!Number.isFinite(horizonDays)||horizonDays<=0)throw new Error('A positive horizon and at least four valid dated observations are required.');
 if(new Set(rows.map(o=>o.date)).size!==rows.length)throw new Error('Observation dates must be distinct.');
 const limit=region.metrics.common_valid_area_ha,clip=(n:number)=>Math.max(0,Math.min(limit,n));
 const candidates=(['persistence','drift'] as const).map(method=>{
  const checks=rows.slice(3).map((actual,i)=>{
   const train=rows.slice(0,i+3),prediction=clip(estimate(train,actual.date,method));
   return {trainThrough:train.at(-1)!.date,targetDate:actual.date,horizonDays:time(actual.date)-time(train.at(-1)!.date),prediction,actual:actual.water_area_ha,error:Math.abs(prediction-actual.water_area_ha)};
  });
  return {method,checks,mae:checks.reduce((n,c)=>n+c.error,0)/checks.length,maxError:Math.max(...checks.map(c=>c.error))};
 });
 const recommended=candidates[1].mae<candidates[0].mae?candidates[1]:candidates[0];
 const selected=requested==='auto'?recommended:candidates.find(c=>c.method===requested)!;
 const origin=rows.at(-1)!,targetDate=new Date((time(origin.date)+horizonDays)*DAY).toISOString().slice(0,10);
 const typicalGap=[...selected.checks.map(c=>c.horizonDays)].sort((a,b)=>a-b)[Math.floor(selected.checks.length/2)];
 const raw=estimate(rows,targetDate,selected.method),value=clip(raw);
 // A historical stress envelope, explicitly not a probability/confidence interval.
 const spread=selected.maxError*Math.max(1,horizonDays/typicalGap);
 return {regionId:region.region_id,runId:region.run_id,originDate:origin.date,targetDate,horizonDays,value,unboundedValue:raw,lower:clip(value-spread),upper:clip(value+spread),lastObserved:origin.water_area_ha,delta:value-origin.water_area_ha,method:selected.method,recommended:recommended.method,mae:selected.mae,backtestCount:selected.checks.length,typicalGap,candidates,rows,rangeMethod:'Largest absolute rolling-origin miss, scaled by max(1, horizon / median validation gap); bounded to measured support area.',calibratedProbability:false as const};
}
