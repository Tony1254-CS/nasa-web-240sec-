import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react';
export const DiagnosticControls=createContext<{values:Record<string,number>;onChange:(key:string,value:number)=>void}|null>(null);
export const DIAGNOSTIC_DEFAULTS={speckleLooks:3,speckleSeed:17,onsetLooks:3,onset:10,duration:3,onsetSeed:23,noveltyPercentile:95,segmentationCutoff:.45,minimumComponent:3,selectiveCutoff:.55};
export function useDiagnosticControl(key:string,initial:number):[number,Dispatch<SetStateAction<number>>]{
 const context=useContext(DiagnosticControls),[local,setLocal]=useState(initial);
 const value=context?.values[key]??local;
 const update:Dispatch<SetStateAction<number>>=next=>{if(context)context.onChange(key,typeof next==='function'?next(value):next);else setLocal(next);};
 return [value,update];
}
