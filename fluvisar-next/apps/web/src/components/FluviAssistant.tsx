import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, Download, Focus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useObservatoryEvidence } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';
import { downloadEvidence } from '../data/fieldEvidence';
import '../styles/assistant.css';
import { DataChatInspection } from './DataChatInspection';

type Reply={answer:string;mode:'ai'|'data';tool:string;run_id:string;region_id:string;pair:string[];finding_id:string|null;sources:{title:string;url:string;id:string}[];action:{finding_id:string}|null;computed_at:string};
type Message={role:'user'|'assistant';text:string;reply?:Reply;subject?:string};
function readHistory(key:string):Message[]{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-40):[];}catch{return [];}}
export function FluviAssistant(){
 const {evidence,comparisonReady}=useObservatoryEvidence();const state=useWorkspaceStore();const route=useLocation(),navigate=useNavigate();
 const open=state.isAgentDrawerOpen;const [subject,setSubject]=useState(''),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[mode,setMode]=useState<'ai'|'data'>('data'),[scopeOverride,setScopeOverride]=useState<'study'|null>(null),[queued,setQueued]=useState('');
 const view=new URLSearchParams(route.search).get('view');const synthetic=route.pathname==='/intelligence'&&Boolean(view&&view!=='real');
 const scope=scopeOverride==='study'?null:state.selectedFindingId&&evidence.findings.features.some(f=>f.properties.id===state.selectedFindingId)?state.selectedFindingId:null;
 const key='fluvisar-assistant-v1:'+evidence.run_id+':'+(synthetic?'models':'measured');
 const [session,setSession]=useState<{key:string;messages:Message[]}>(()=>({key,messages:readHistory(key)}));
 const messages=session.key===key?session.messages:readHistory(key);
 const controller=useRef<AbortController|null>(null),body=useRef<HTMLDivElement>(null),textbox=useRef<HTMLTextAreaElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const setMessages=(next:Message[])=>{setSession({key,messages:next});try{localStorage.setItem(key,JSON.stringify(next.slice(-40)));}catch{/* Storage may be disabled. */}};
 useEffect(()=>{fetch('/api/assistant/status').then(r=>r.ok?r.json():null).then(v=>{if(v?.mode)setMode(v.mode);}).catch(()=>{});},[]);
 useEffect(()=>{const discuss=(event:Event)=>{const value=(event as CustomEvent<{subject:string;findingScope?:'study'|null}>).detail;if(!value?.subject)return;setScopeOverride(value.findingScope??null);setSubject(value.subject.slice(0,200));setQueued('Explain this evidence: '+value.subject.slice(0,200));useWorkspaceStore.getState().setAgentDrawerOpen(true);};window.addEventListener('fluvisar-chat-data',discuss);return()=>window.removeEventListener('fluvisar-chat-data',discuss);},[]);
 useEffect(()=>{controller.current?.abort();setBusy(false);setError('');setSubject('');setScopeOverride(null);setQueued('');},[key,state.selectedFindingId]);
 useEffect(()=>{if(!open)return;const element=dialog.current,opener=document.activeElement;element?.showModal();const timer=setTimeout(()=>textbox.current?.focus(),30);return()=>{clearTimeout(timer);element?.close();if(opener instanceof HTMLElement&&opener.isConnected)opener.focus({preventScroll:true});};},[open]);
 useEffect(()=>{if(body.current)body.current.scrollTop=body.current.scrollHeight;},[session,busy]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const send=async(question=input)=>{
  if(!question.trim()||busy||!comparisonReady)return;controller.current?.abort();const abort=new AbortController();controller.current=abort;
  const next=[...messages,{role:'user' as const,text:question.trim(),subject:subject||undefined}].slice(-39);setMessages(next);setInput('');setBusy(true);setError('');
  try{const response=await fetch('/api/assistant/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({run_id:evidence.run_id,finding_id:scope,question:question.trim(),topic:synthetic?'Synthetic model experiment. '+subject:subject||null,language:state.language,history:messages.slice(-6).map(m=>({role:m.role,text:m.text.slice(0,2000)}))}),signal:abort.signal});
   if(!response.ok)throw new Error(response.status===404?'The selected evidence changed. Reopen the finding and retry.':'The evidence connection was interrupted. Retry your question.');
   const reply=await response.json() as Reply;if(abort.signal.aborted)return;setMessages([...next,{role:'assistant',text:reply.answer,reply}]);
  }catch(cause){if(!abort.signal.aborted){setError(String(cause instanceof Error?cause.message:cause));setInput(question);}}finally{if(!abort.signal.aborted)setBusy(false);}
 };
 useEffect(()=>{if(!queued||!open||!comparisonReady||busy)return;const question=queued;setQueued('');void send(question);},[queued,open,comparisonReady,busy]);
 const onMap=(reply:Reply)=>{if(!reply.action)return;const params=new URLSearchParams({t0:reply.pair[0],t1:reply.pair[1],finding:reply.action.finding_id});state.setAgentDrawerOpen(false);navigate('/observatory/'+reply.region_id+'?'+params);state.setSelectedFinding(reply.action.finding_id);};
 const chips=synthetic?['How do these models work?','Are model scores real-world accuracy?','How do I use this website?']:scope?['Explain this finding','Show water area history','Is this reliable?']:['What changed?','Where is the largest candidate?','Show water area history','Which satellite sources are used?'];
 return <>
  <DataChatInspection/>
  {open&&<dialog ref={dialog} className="fl-assistant" aria-modal="true" aria-label="FluviSAR Assistant" onCancel={event=>{event.preventDefault();state.setAgentDrawerOpen(false);}} onClick={event=>{if(event.target!==event.currentTarget)return;const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)state.setAgentDrawerOpen(false);}}>
   <header><div className="fl-avatar"><Bot size={23}/></div><div><h2>FluviSAR Assistant</h2><span><i/>{mode==='ai'?'AI + registered evidence':'Data-based answers'}</span></div><button aria-label="Close assistant" onClick={()=>state.setAgentDrawerOpen(false)}><X size={21}/></button></header>
   <div className="fl-scope"><b>{evidence.name}</b><span>{evidence.pair.join(' → ')}</span><small>{synthetic?'SYNTHETIC MODEL WORKSPACE':scope?'SELECTED FINDING · '+scope:'MEASURED · STUDY AREA'}</small></div>
   <nav><span>Conversation</span><button aria-label="Export assistant conversation" disabled={!messages.length} onClick={()=>downloadEvidence('FluviSAR-conversation.json',{exported_at:new Date().toISOString(),run_id:evidence.run_id,pair:evidence.pair,messages})}><Download size={15}/></button><button aria-label="Clear assistant conversation" disabled={!messages.length||busy} onClick={()=>setMessages([])}><Trash2 size={15}/></button></nav>
   <div className="fl-chat-body" ref={body} aria-live="polite" aria-relevant="additions">
    {!messages.length&&<div className="fl-welcome"><Sparkles size={27}/><h3>Turn observations into understanding.</h3><p>Ask about this region, compare recorded dates, or use Chat with Data beside a supported evidence card.</p><div className="fl-capabilities"><span>Source-linked answers</span><span>Map-connected findings</span><span>বাংলা / English</span></div></div>}
    {messages.map((message,i)=><article className={'fl-message is-'+message.role} key={i}><div className="fl-message-label">{message.role==='user'?'You':message.reply?.mode==='ai'?'AI · evidence connected':'Registered data answer'}</div>{message.subject&&<small className="fl-subject">Discussing: {message.subject}</small>}<p>{message.text}</p>{message.reply&&<><small className="fl-answer-scope">{message.reply.pair.join(' → ')} · {message.reply.finding_id??'Study area'}</small><details><summary>{message.reply.sources.length} evidence sources</summary>{message.reply.sources.map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={12}/></a>)}</details><div className="fl-answer-actions">{message.reply.action&&<button onClick={()=>onMap(message.reply!)}><Focus size={13}/>Show on map</button>}<Link to={'/observatory/'+message.reply.region_id+'?'+new URLSearchParams({t0:message.reply.pair[0],t1:message.reply.pair[1],...(message.reply.finding_id?{finding:message.reply.finding_id}:{})})} onClick={()=>state.setAgentDrawerOpen(false)}>View evidence <ArrowUpRight size={12}/></Link></div></>}</article>)}
    {busy&&<p className="fl-busy" role="status"><span/>Reading registered evidence…</p>}{error&&<p role="alert" className="fl-error">{error}</p>}
   </div>
   <div className="fl-suggestions">{chips.map(chip=><button key={chip} disabled={busy||!comparisonReady} onClick={()=>send(chip)}>{chip}</button>)}</div>
   {subject&&<div className="fl-subject-chip"><Focus size={13}/>{subject}<button onClick={()=>setSubject('')} aria-label="Clear selected subject"><X size={13}/></button></div>}
   <form onSubmit={event=>{event.preventDefault();void send();}}><label className="sr-only" htmlFor="fl-question">Ask about this evidence</label><textarea ref={textbox} id="fl-question" placeholder="Ask about this evidence…" value={input} maxLength={2000} rows={2} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();void send();}}}/><button aria-label="Send question" disabled={busy||!input.trim()||!comparisonReady}><Send size={18}/></button></form>
   <footer>Screening evidence ≠ confirmed flood, erosion or damage.</footer>
  </dialog>}
 </>;
}
