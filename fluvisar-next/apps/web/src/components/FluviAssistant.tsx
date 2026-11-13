import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, Download, Focus, Send, Sparkles, Trash2, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useObservatoryEvidence } from '../data/evidence';
import { useWorkspaceStore } from '../store/workspaceStore';
import { downloadEvidence } from '../data/fieldEvidence';
import '../styles/assistant.css';
import { DataChatInspection } from './DataChatInspection';

type Reply={answer:string;mode:'ai'|'data';tool:string;run_id:string;region_id:string;pair:string[];finding_id:string|null;sources:{title:string;url:string;id:string}[];action:{finding_id:string}|null;computed_at:string};
type Message={role:'user'|'assistant';text:string;reply?:Reply;subject?:string};

function readHistory(key:string):Message[]{
  try{
    const value=JSON.parse(localStorage.getItem(key)||'[]');
    return Array.isArray(value)?value.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-40):[];
  }catch{return [];}
}

/** Highlight numbers in plain-text answers */
function highlightNumbers(text:string):string {
  return text.replace(/(\b\d[\d,]*\.?\d*\s*(ha|km|m|%|dB|kg|°C|°F)?\b)/g,'<span class="fl-num">$1</span>');
}

/** Render assistant answer: try markdown, fallback to plain text with number highlights */
function AssistantAnswer({text}:{text:string}) {
  // If the text looks like it has markdown (**, *, -, #, |, `)
  const hasMarkdown=/[*#`|]|-\s|\d\.\s/.test(text);
  if(hasMarkdown){
    return (
      <div className="fl-md">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    );
  }
  // Plain text with number highlights
  return (
    <p dangerouslySetInnerHTML={{__html:highlightNumbers(text)}}/>
  );
}

export function FluviAssistant(){
  const {evidence,comparisonReady,comparisonError}=useObservatoryEvidence();
  const state=useWorkspaceStore();
  const route=useLocation(),navigate=useNavigate();
  const open=state.isAgentDrawerOpen;
  const [subject,setSubject]=useState('');
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [mode,setMode]=useState<'ai'|'data'>('data');
  const [scopeOverride,setScopeOverride]=useState<'study'|null>(null);
  const [showChips,setShowChips]=useState(false);
  const [queued,setQueued]=useState('');

  const view=new URLSearchParams(route.search).get('view');
  const synthetic=route.pathname==='/intelligence'&&Boolean(view&&view!=='real');
  const scope=scopeOverride==='study'?null:state.selectedFindingId&&evidence.findings.features.some(f=>f.properties.id===state.selectedFindingId)?state.selectedFindingId:null;
  const key='fluvisar-assistant-v1:'+evidence.run_id+':'+(synthetic?'models':'measured');

  const [session,setSession]=useState<{key:string;messages:Message[]}>(()=>({key,messages:readHistory(key)}));
  const messages=session.key===key?session.messages:readHistory(key);
  const controller=useRef<AbortController|null>(null);
  const body=useRef<HTMLDivElement>(null);
  const textbox=useRef<HTMLTextAreaElement>(null);
  const dialog=useRef<HTMLElement>(null);

  const setMessages=(next:Message[])=>{
    setSession({key,messages:next});
    try{localStorage.setItem(key,JSON.stringify(next.slice(-40)));}catch{/* Storage may be disabled. */}
  };

  useEffect(()=>{
    fetch('/api/assistant/status').then(r=>r.ok?r.json():null).then(v=>{if(v?.mode)setMode(v.mode);}).catch(()=>{});
  },[]);

  useEffect(()=>{
    const discuss=(event:Event)=>{
      const value=(event as CustomEvent<{subject:string;findingScope?:'study'|null}>).detail;
      if(!value?.subject)return;
      setScopeOverride(value.findingScope??null);
      setSubject(value.subject.slice(0,200));
      setQueued('Explain this evidence: '+value.subject.slice(0,200));
      useWorkspaceStore.getState().setAgentDrawerOpen(true);
    };
    window.addEventListener('fluvisar-chat-data',discuss);
    return()=>window.removeEventListener('fluvisar-chat-data',discuss);
  },[]);

  useEffect(()=>{
    controller.current?.abort();setBusy(false);setError('');setSubject('');setScopeOverride(null);setQueued('');
  },[key,state.selectedFindingId]);

  useEffect(()=>{
    if(!open)return;
    const opener=document.activeElement;
    const timer=setTimeout(()=>textbox.current?.focus(),30);
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'&&dialog.current?.contains(event.target as Node)){
        event.preventDefault();state.setAgentDrawerOpen(false);
      }
    };
    window.addEventListener('keydown',escape);
    return()=>{
      clearTimeout(timer);window.removeEventListener('keydown',escape);
      if(opener instanceof HTMLElement&&opener.isConnected)opener.focus({preventScroll:true});
    };
  },[open]);

  useEffect(()=>{
    const inspect=()=>useWorkspaceStore.getState().setAgentDrawerOpen(false);
    window.addEventListener('fluvisar-chat-inspect',inspect);
    return()=>window.removeEventListener('fluvisar-chat-inspect',inspect);
  },[]);

  useEffect(()=>{
    if(body.current){
      const articles=body.current.querySelectorAll('.fl-message');
      const latest=articles[articles.length-1];
      if(latest){
        latest.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        body.current.scrollTop=body.current.scrollHeight;
      }
    }
  },[session,busy]);
  useEffect(()=>()=>controller.current?.abort(),[]);

  const send=async(question=input)=>{
    if(!question.trim()||busy)return;
    controller.current?.abort();
    const abort=new AbortController();
    controller.current=abort;
    const next=[...messages,{role:'user' as const,text:question.trim(),subject:subject||undefined}].slice(-39);
    setMessages(next);setInput('');setBusy(true);setError('');
    try{
      const response=await fetch('/api/assistant/ask',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          run_id:evidence.run_id,
          finding_id:scope,
          question:question.trim(),
          topic:synthetic?'Synthetic model experiment. '+subject:subject||null,
          language:state.language,
          history:messages.slice(-6).map(m=>({role:m.role,text:m.text.slice(0,2000)}))
        }),
        signal:abort.signal
      });
      if(!response.ok)throw new Error(
        response.status===404
          ?'The selected evidence changed. Reopen the finding and retry.'
          :'The evidence connection was interrupted. Retry your question.'
      );
      const reply=await response.json() as Reply;
      if(abort.signal.aborted)return;
      setMessages([...next,{role:'assistant',text:reply.answer,reply}]);
    }catch(cause){
      if(!abort.signal.aborted){setError(String(cause instanceof Error?cause.message:cause));setInput(question);}
    }finally{
      if(!abort.signal.aborted)setBusy(false);
    }
  };

  useEffect(()=>{
    if(!queued||!open||busy)return;
    const question=queued;setQueued('');void send(question);
  },[queued,open,busy]);

  const onMap=(reply:Reply)=>{
    if(!reply.action)return;
    const params=new URLSearchParams({t0:reply.pair[0],t1:reply.pair[1],finding:reply.action.finding_id});
    state.setAgentDrawerOpen(false);
    navigate('/observatory/'+reply.region_id+'?'+params);
    state.setSelectedFinding(reply.action.finding_id);
  };

  const chips=synthetic
    ?['How do these models work?','Are model scores real-world accuracy?','How do I use this website?']
    :scope
      ?['Explain this finding','Show water area history','Is this reliable?']
      :['What changed?','Where is the largest candidate?','Show water area history','Which satellite sources are used?'];

  const inputPlaceholder=!comparisonReady&&!comparisonError
    ?'Loading evidence data…'
    :comparisonError
      ?'Using default data — ask anything'
      :'Ask about this evidence…';

  return <>
    <DataChatInspection/>
    <button
      className="fl-floating-launcher"
      aria-label={open?'Minimize FluviSAR chat':'Open FluviSAR chat'}
      aria-controls="fluvisar-chat-panel"
      aria-expanded={open}
      title={open?'Minimize chat':'Ask FluviSAR'}
      onClick={()=>state.setAgentDrawerOpen(!open)}
    >
      {open?<X size={25}/>:<Bot size={25}/>}
      <span>{open?'Minimize chat':'Ask FluviSAR'}</span>
    </button>

    {open&&<section id="fluvisar-chat-panel" ref={dialog} className={`fl-assistant${messages.length>0?' has-messages':''}`} role="dialog" aria-modal="false" aria-label="FluviSAR Assistant">

      {/* Unified Compact Header: 1 row only */}
      <header className="fl-header-unified">
        <div className="fl-header-left">
          <div className="fl-avatar-sm"><Bot size={18}/></div>
          <div className="fl-header-title-group">
            <h2>FluviSAR Assistant</h2>
            <span className="fl-header-status-pill"><i/>{mode==='ai'?'AI Connected':'Data Mode'}</span>
          </div>
        </div>

        <div className="fl-header-actions">
          {messages.length>0&&(
            <>
              <button
                className="fl-header-btn"
                title="Export conversation"
                aria-label="Export conversation"
                onClick={()=>downloadEvidence('FluviSAR-conversation.json',{exported_at:new Date().toISOString(),run_id:evidence.run_id,pair:evidence.pair,messages})}
              >
                <Download size={15}/>
              </button>
              <button
                className="fl-header-btn"
                title="Clear conversation"
                aria-label="Clear conversation"
                disabled={busy}
                onClick={()=>setMessages([])}
              >
                <Trash2 size={15}/>
              </button>
            </>
          )}
          <button
            className="fl-header-btn fl-close-btn"
            aria-label="Close assistant"
            onClick={()=>state.setAgentDrawerOpen(false)}
          >
            <X size={18}/>
          </button>
        </div>
      </header>

      {/* Context Scope: only show on initial empty state */}
      {!messages.length&&<div className="fl-scope">
        <b>{evidence.name}</b>
        <span>{evidence.pair.join(' → ')}</span>
        <small>{synthetic?'SYNTHETIC MODEL WORKSPACE':scope?'SELECTED FINDING · '+scope:'MEASURED · STUDY AREA'}</small>
      </div>}

      <div className="fl-chat-body" ref={body} aria-live="polite" aria-relevant="additions">

        {!messages.length&&<div className="fl-welcome">
          <Sparkles size={27}/>
          <h3>Turn observations into understanding.</h3>
          <p>Ask about this region, compare recorded dates, or use Chat with Data beside a supported evidence card.</p>
          <div className="fl-capabilities">
            <span>Source-linked answers</span>
            <span>Map-connected findings</span>
            <span>বাংলা / English</span>
          </div>
        </div>}

        {messages.map((message,i)=>(
          <article className={'fl-message is-'+message.role} key={i}>
            <div className="fl-message-label">
              {message.role==='user'?'You':message.reply?.mode==='ai'?'AI · evidence connected':'Registered data answer'}
            </div>
            {message.subject&&<small className="fl-subject">Discussing: {message.subject}</small>}

            {/* Render: user messages as plain text, assistant answers as Markdown */}
            {message.role==='user'
              ?<p>{message.text}</p>
              :<AssistantAnswer text={message.text}/>
            }

            {message.reply&&<>
              <small className="fl-answer-scope">
                {message.reply.pair.join(' → ')} · {message.reply.finding_id??'Study area'}
              </small>
              <details>
                <summary>{message.reply.sources.length} evidence sources</summary>
                {message.reply.sources.map(source=>(
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                    {source.title}<ArrowUpRight size={12}/>
                  </a>
                ))}
              </details>
              <div className="fl-answer-actions">
                {message.reply.action&&(
                  <button onClick={()=>onMap(message.reply!)}>
                    <Focus size={13}/>Show on map
                  </button>
                )}
                <Link
                  to={'/observatory/'+message.reply.region_id+'?'+new URLSearchParams({t0:message.reply.pair[0],t1:message.reply.pair[1],...(message.reply.finding_id?{finding:message.reply.finding_id}:{})})}
                  onClick={()=>state.setAgentDrawerOpen(false)}
                >
                  View evidence <ArrowUpRight size={12}/>
                </Link>
              </div>
            </>}
          </article>
        ))}

        {/* Animated loading dots instead of plain text */}
        {busy&&(
          <p className="fl-busy" role="status">
            <span className="fl-busy-dots">
              <span/><span/><span/>
            </span>
            Reading registered evidence…
          </p>
        )}

        {error&&<p role="alert" className="fl-error">{error}</p>}
      </div>

      <div className="fl-suggestions-wrap">
        <button
          className="fl-suggestions-toggle"
          onClick={()=>setShowChips(v=>!v)}
          aria-expanded={showChips}
          title={showChips?'Hide suggestions':'Show suggestions'}
        >
          <Sparkles size={13}/>
          {showChips?'Hide suggestions':'Suggestions'}
        </button>
        {showChips&&<div className="fl-suggestions">
          {chips.map(chip=>(
            <button key={chip} disabled={busy} onClick={()=>{send(chip);setShowChips(false);}}>{chip}</button>
          ))}
        </div>}
      </div>

      {subject&&<div className="fl-subject-chip">
        <Focus size={13}/>{subject}
        <button onClick={()=>setSubject('')} aria-label="Clear selected subject"><X size={13}/></button>
      </div>}

      <form onSubmit={event=>{event.preventDefault();void send();}}>
        <label className="sr-only" htmlFor="fl-question">Ask about this evidence</label>
        <textarea
          ref={textbox}
          id="fl-question"
          placeholder={inputPlaceholder}
          value={input}
          maxLength={2000}
          rows={2}
          onChange={event=>setInput(event.target.value)}
          onKeyDown={event=>{
            if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){
              event.preventDefault();void send();
            }
          }}
        />
        <button aria-label="Send question" disabled={busy||!input.trim()}>
          <Send size={18}/>
        </button>
      </form>

      <footer>Screening evidence ≠ confirmed flood, erosion or damage.</footer>
    </section>}
  </>;
}
