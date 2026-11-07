import type { Map, FitBoundsOptions } from 'maplibre-gl';

/** One camera drives all synchronized views; never alter image coordinates. */
export function flyToStudyArea(map:Map,bounds:[number,number,number,number],options:FitBoundsOptions,onStage:(stage:string)=>void,destination?:{center:[number,number];zoom:number;pitch:number;bearing:number}){
 let stopped=false;const flight={};
 const center:[number,number]=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2];
 const remove=()=>{map.off('moveend',advance);map.off('sourcedata',ready);for(const event of ['mousedown','touchstart','wheel','keydown'] as const)map.getContainer().removeEventListener(event,interrupt);};
 const finish=(fit:boolean)=>{if(stopped)return;stopped=true;remove();map.stop();if(fit){map.resize();if(destination)map.jumpTo(destination);else map.fitBounds(bounds,{...options,duration:0});}onStage('');};
 const interrupt=()=>finish(false);
 const stages=[
  ()=>{onStage('Locating Bangladesh');map.jumpTo({center,zoom:1.8,pitch:0,bearing:0});map.flyTo({center,zoom:2.4,pitch:0,bearing:0,duration:650},{fluvisarFlight:flight});},
  ()=>{onStage('Approaching the study region');map.flyTo({center,zoom:6.5,pitch:0,bearing:0,duration:1100},{fluvisarFlight:flight});},
  ()=>{onStage('Focusing on recorded observations');if(destination)map.flyTo({...destination,duration:1600},{fluvisarFlight:flight});else map.fitBounds(bounds,{...options,duration:1600},{fluvisarFlight:flight});},
 ];
 let index=0;
 // resize() also emits moveend. Only this flight's own events advance its stages.
 const advance=(event?:unknown)=>{if(stopped||event&&(event as {fluvisarFlight?:object}).fluvisarFlight!==flight)return;if(index===stages.length){finish(true);return;}stages[index++]();};
 const start=()=>{if(stopped)return;map.off('sourcedata',ready);map.on('moveend',advance);advance();};
 const ready=()=>{if(map.isSourceLoaded('satellite'))start();};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish(true);return()=>finish(true);}
 for(const event of ['mousedown','touchstart','wheel','keydown'] as const)map.getContainer().addEventListener(event,interrupt,{passive:true});
 // Let the initial geographic image appear before flying through it.
 if(map.getSource('satellite')&&!map.isSourceLoaded('satellite')){onStage('Loading satellite context');map.on('sourcedata',ready);}else start();
 return (fit=true)=>finish(fit);
}
