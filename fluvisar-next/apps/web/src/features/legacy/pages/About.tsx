import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Fingerprint, CodeXml, MapPin, Radio, ShieldCheck, Waves } from 'lucide-react';
import { useEvidence, readableDate } from '../../../data/evidence';
import '../styles/about.css';

const chapters=[{id:'question',label:'The question'},{id:'landscapes',label:'The landscapes'},{id:'approach',label:'The approach'},{id:'people',label:'The people'}];
const crew=[
 {name:'Sabbir Ahmed',role:'Mission Commander',work:'System Architecture & AI Pipeline',initials:'SA',github:'https://github.com/Tony1254-CS',handle:'@Tony1254-CS'},
 {name:'Sanjid Talukder',role:'Data Scientist',work:'SAR Processing & Remote Sensing',initials:'ST'},
 {name:'Sakibul Hassan Shovon',role:'AI/ML Engineer',work:'Interactive Visualization & UX',initials:'SH'},
 {name:'Yasin Arafat',role:'Hydro Analyst',work:'River Dynamics & Quality Assurance',initials:'YA'},
];

export function AboutPage(){
 const {index}=useEvidence();const [chapter,setChapter]=useState('question');
 const regions=[index.regions.jamuna,index.regions.sundarbans];
 const imageFor=(region:typeof regions[number])=>[...(region.optical_observations??[])].sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
 const hero=imageFor(regions[0]);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])setChapter(visible[0].target.id);},{rootMargin:'-12% 0px -55% 0px',threshold:0});
  chapters.forEach(item=>{const element=document.getElementById(item.id);if(element)observer.observe(element);});return()=>observer.disconnect();
 },[]);
 return <div className="about-story"><main className="about-shell">
  <header className="about-hero">
   <div className="about-hero-copy"><div className="about-kicker"><span/>ABOUT FLUVISAR / OUR STORY</div><h1>A changing landscape.<br/><em>A question worth following.</em></h1><p>We built FluviSAR to make satellite evidence easier to explore, question and understand. The story begins with two landscapes in Bangladesh—and the people trying to read their changes.</p><div className="about-hero-actions"><a className="about-primary" href="#question">Follow our story <ArrowDown size={15}/></a><Link to="/observatory/jamuna">Explore the observatory <ArrowUpRight size={15}/></Link></div><div className="about-signature"><Radio size={15}/><span>Earth observation. Human questions. Traceable evidence.</span></div></div>
   <figure className="about-hero-image">{hero&&<img src={hero.url} alt="Recorded optical satellite view of the Jamuna study area"/>}<div className="about-image-reticle" aria-hidden="true"><i/><i/></div><div className="about-image-heading"><MapPin size={14}/><span>JAMUNA RIVER / BANGLADESH</span></div><figcaption><span>Start with what was observed.</span><small>{hero?`${hero.sensor} · ${readableDate(hero.date)}`:'Registered study area'}</small></figcaption></figure>
  </header>
  <div className="about-reading-layout">
   <aside className="about-margin"><span className="about-kicker">A STORY IN FOUR CHAPTERS</span><nav aria-label="Our story chapters">{chapters.map((item,i)=><a key={item.id} href={'#'+item.id} aria-current={chapter===item.id?'location':undefined} onClick={()=>setChapter(item.id)}><span>0{i+1}</span>{item.label}<i/></a>)}</nav><div className="about-margin-note"><Fingerprint size={22}/><p>Our starting point is a question.<br/>Our responsibility is the evidence.</p></div></aside>
   <div className="about-chapters">
    <section id="question" className="about-chapter"><div className="about-chapter-number">01 / THE QUESTION</div><h2>What changed?<br/><span>And what can we actually know?</span></h2><div className="about-prose"><p>A patch of water appears where land was visible before. The first image tells us something has changed. Understanding that change takes another look.</p><p>On the Jamuna, river stage, seasonal bars and a moving channel all matter. In the Sundarbans, tides and vegetation change the question again. A coloured outline is the beginning of an investigation.</p><p>That is the question behind FluviSAR: how do we bring the image, its source and the reasons for caution into one place that people can use?</p></div><blockquote>Make the change visible.<br/><span>Keep the evidence within reach.</span></blockquote></section>
    <section id="landscapes" className="about-chapter"><div className="about-chapter-number">02 / THE LANDSCAPES</div><h2>One platform.<br/><span>Two ways of reading water.</span></h2><p className="about-section-lead">We follow the same evidence trail while keeping each landscape’s questions in view.</p><div className="about-landscapes">{regions.map((region,i)=>{const image=imageFor(region);return <article key={region.region_id}><figure>{image&&<img src={image.url} loading="lazy" alt={'Recorded satellite observation of '+region.name}/>}<figcaption>{image?`${image.sensor} · ${readableDate(image.date)}`:'Registered study area'}</figcaption></figure><div className="about-landscape-copy"><span className="about-kicker">{i===0?'BRAIDED RIVER':'MANGROVE ESTUARY'}</span><h3>{i===0?'Jamuna':'Sundarbans'}</h3><p>{i===0?'Follow the channel. Compare water transitions. Ask which changes persist across recorded observations.':'Read the tidal landscape. Compare radar responses. Keep canopy and inundation context part of the interpretation.'}</p><Link to={'/observatory/'+region.region_id}>Explore {region.name}<ArrowUpRight size={14}/></Link></div></article>;})}</div><div className="about-archive-note"><Fingerprint size={15}/><span>{regions.reduce((sum,r)=>sum+r.observations.length,0)} registered radar acquisitions across {regions.length} study areas. Images, dates and source records stay connected.</span></div></section>
    <section id="approach" className="about-chapter"><div className="about-chapter-number">03 / THE APPROACH</div><h2>From a signal in orbit<br/><span>to a question on the ground.</span></h2><div className="about-approach">{[
     {icon:Radio,title:'Observe',text:'Start with recorded satellite acquisitions. Keep dates, channels and source records beside the image.'},
     {icon:Waves,title:'Compare',text:'Inspect aligned observations and measured water-transition candidates within their valid footprint.'},
     {icon:ShieldCheck,title:'Question',text:'Review quality checks, threshold sensitivity and supporting context before drawing conclusions.'},
     {icon:Fingerprint,title:'Carry the evidence forward',text:'Export a finding, review potential exposure or add a field observation to continue the investigation.'},
    ].map((step,i)=><article key={step.title}><div className="about-step-mark"><step.icon size={20}/><span>0{i+1}</span></div><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}</div><div className="about-principle"><ShieldCheck size={21}/><div><h3>Clear about what the evidence supports.</h3><p>Radar transitions guide screening and investigation. Permanent erosion, flooding and damage need supporting evidence. Educational models in ML Intelligence and SAR Lab carry their own simulation context.</p><Link to="/reports">Read the methods & source records <ArrowUpRight size={14}/></Link></div></div></section>
    <section id="people" className="about-chapter"><div className="about-chapter-number">04 / THE PEOPLE</div><h2>Four perspectives.<br/><span>One shared mission.</span></h2><p className="about-section-lead">Meet the original FluviSAR crew—the people connecting system architecture, remote sensing, visualization and river science.</p><div className="about-team">{crew.map((member,i)=><article key={member.name}><header><div className={'about-monogram is-'+i}>{member.initials}</div><span>FLUVISAR / 0{i+1}</span></header><span className="about-team-role">{member.role}</span><h3>{member.name}</h3><p>{member.work}</p>{member.github&&<a href={member.github} target="_blank" rel="noreferrer"><CodeXml size={15}/>{member.handle}<ArrowUpRight size={13}/></a>}</article>)}</div><p className="about-team-footnote">Built for NASA Space Apps Challenge 2026. FluviSAR is an independent project; the team roles above describe our project responsibilities.</p></section>
   </div>
  </div>
  <section className="about-next"><div><div className="about-kicker">THE STORY CONTINUES WITH A QUESTION</div><h2>Take a closer look.</h2><p>Open a landscape. Follow a change. See where the evidence leads.</p></div><div><Link className="about-primary" to="/atlas">Choose a landscape <ArrowUpRight size={16}/></Link><Link to="/sar-lab">Understand the radar <ArrowUpRight size={15}/></Link></div></section>
  <footer className="about-footer"><span>FLUVISAR / EVIDENCE FIRST</span><Link to="/reports">Methods & sources <ArrowUpRight size={13}/></Link></footer>
 </main></div>;
}
