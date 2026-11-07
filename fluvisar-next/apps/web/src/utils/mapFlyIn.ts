import type { Map, FitBoundsOptions } from 'maplibre-gl';

/** One camera drives all synchronized views; never alter image coordinates. */
export function flyToStudyArea(map:Map,bounds:[number,number,number,number],options:FitBoundsOptions,onStage:(stage:string)=>void){
 let stopped=false;let next:(()=>void)|null=null;
 const center:[number,number]=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2];
 const remove=()=>{if(next)map.off('moveend',next);next=null;for(const event of ['mousedown','touchstart','wheel','keydown'] as const)map.getContainer().removeEventListener(event,interrupt);};
 const finish=(fit:boolean)=>{if(stopped)return;stopped=true;remove();map.stop();if(fit)map.fitBounds(bounds,{...options,duration:0});onStage('');};
 const interrupt=()=>finish(false);
 const stages=[
  ()=>{onStage('Locating Bangladesh');map.flyTo({center,zoom:1.8,pitch:0,bearing:0,duration:700});},
  ()=>{onStage('Approaching the study region');map.flyTo({center,zoom:6.5,pitch:0,bearing:0,duration:1100});},
  ()=>{onStage('Focusing on recorded observations');map.fitBounds(bounds,{...options,duration:1600});},
 ];
 let index=0;
 const advance=()=>{if(stopped)return;if(index===stages.length){finish(false);return;}next=advance;map.once('moveend',advance);stages[index++]();};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish(true);return()=>finish(true);}
 for(const event of ['mousedown','touchstart','wheel','keydown'] as const)map.getContainer().addEventListener(event,interrupt,{passive:true});
 advance();
 return (fit=true)=>finish(fit);
}
