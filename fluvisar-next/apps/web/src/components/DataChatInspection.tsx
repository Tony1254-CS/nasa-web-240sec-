import { useEffect, useState } from 'react';
import { Focus, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TARGETS='[data-chat-subject],.id-metrics>article,.iw-real-stats>article,.obs-stats>div,.iw-quality-card,.iw-readiness-card,.iw-finding-explanation,.iw-model-card,.iw-model-comparison,.iw-tab-content .ml-panel,.ew-metric,.ew-histogram,.ew-impact-grid>article';
type Inspection={subject:string;root?:string};

export function DataChatInspection(){
 const [selection,setSelection]=useState<Inspection|null>(null),[count,setCount]=useState(0);const route=useLocation();
 useEffect(()=>{const start=(event:Event)=>{const detail=(event as CustomEvent<Inspection>).detail;setSelection({...detail});};window.addEventListener('fluvisar-chat-inspect',start);return()=>window.removeEventListener('fluvisar-chat-inspect',start);},[]);
 useEffect(()=>setSelection(null),[route.key]);
 useEffect(()=>{
  if(!selection)return;
  const root=selection.root?document.querySelector(selection.root):document;
  let candidates=[...(root?.querySelectorAll<HTMLElement>(TARGETS)??[])].filter(el=>el.getClientRects().length&&!el.closest('.fl-assistant'));
  candidates=candidates.filter(el=>!candidates.some(other=>other!==el&&el.contains(other)));
  if(!candidates.length&&selection.root){const fallback=root?.querySelector<HTMLElement>('.ew-body');if(fallback)candidates=[fallback];}
  const previous=candidates.map(el=>({tab:el.getAttribute('tabindex'),role:el.getAttribute('role'),label:el.getAttribute('aria-label')}));
  const subjects=new Map<HTMLElement,string>();
  for(const el of candidates){
   const label=el.dataset.chatSubject||el.querySelector('h2,h3,h4,dt')?.textContent||el.querySelector('span')?.textContent||selection.subject;
   const synthetic=el.closest('.iw-tab-content')?.id!=='iw-panel-real'&&Boolean(el.closest('.iw-experiments'));
   const subject=(synthetic?'Synthetic model experiments: ':'')+label.trim().slice(0,180);
   subjects.set(el,subject);el.dataset.chatTarget='true';el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label','Discuss '+subject);
  }
  setCount(candidates.length);
  const choose=(target:HTMLElement)=>{const el=target.closest<HTMLElement>('[data-chat-target]');if(!el||!subjects.has(el))return false;const subject=subjects.get(el)!,findingScope=el.closest('.id-metrics,.iw-real-stats,.obs-stats')?'study':null;setSelection(null);window.dispatchEvent(new CustomEvent('fluvisar-chat-data',{detail:{subject,findingScope}}));return true;};
  const click=(event:MouseEvent)=>{if((event.target as HTMLElement).closest('.fl-data-chat'))return;if(choose(event.target as HTMLElement)){event.preventDefault();event.stopPropagation();}};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setSelection(null);return;}if((event.key==='Enter'||event.key===' ')&&(event.target as HTMLElement).matches('[data-chat-target]')&&choose(event.target as HTMLElement)){event.preventDefault();event.stopPropagation();}};
  document.addEventListener('click',click,true);document.addEventListener('keydown',key,true);
  return()=>{document.removeEventListener('click',click,true);document.removeEventListener('keydown',key,true);candidates.forEach((el,i)=>{delete el.dataset.chatTarget;for(const [attribute,value] of [['tabindex',previous[i].tab],['role',previous[i].role],['aria-label',previous[i].label]])value===null?el.removeAttribute(attribute!):el.setAttribute(attribute!,value!);});};
 },[selection]);
 return selection&&<div className="fl-inspection-guide" role="status"><Focus size={19}/><div><b>Choose a highlighted data box</b><span>{count} available · click a box to start its chat · Esc to cancel</span></div><button aria-label="Cancel Chat with Data" onClick={()=>setSelection(null)}><X size={18}/></button></div>;
}
