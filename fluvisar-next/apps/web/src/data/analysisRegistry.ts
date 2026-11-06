import type { RegionId } from '../store/workspaceStore';
import { currentEvidence } from './evidence';
export type ImageCorners = [[number,number],[number,number],[number,number],[number,number]];
export const isoDate=(date:string)=>/^\d{8}$/.test(date)?date.slice(0,4)+'-'+date.slice(4,6)+'-'+date.slice(6,8):date;
export const compactDate=(date:string)=>isoDate(date).replaceAll('-','');
export const regionForReach=(id:string):RegionId=>id.startsWith('sundarbans')?'sundarbans':'jamuna';
export const reachForRegion=(id:RegionId)=>id==='jamuna'?'jamuna-chilmari':'sundarbans-mangrove';
export function analysisImage(reach:string,kind:'radar'|'water'|'change',date:string,_pair?:[string,string],channel:'vv'|'vh'='vv'){
 const evidence=currentEvidence(regionForReach(reach));
 if(kind==='change')return String(evidence.change_url);
 const observation=evidence.observations.find(o=>o.date===isoDate(date));
 if(!observation)throw new Error('No source observation acquired on '+date);
 return kind==='water'?observation.water_url:channel==='vh'?observation.vh_url:observation.vv_url;
}
