import { useContext, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, FileText, Menu, Microscope, Moon, Sun, MessageSquare } from 'lucide-react';
import { LegacyThemeContext } from '../theme';
import { useWorkspaceStore } from '../../../store/workspaceStore';

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open,setOpen] = useState(false);
  const { theme, toggleTheme } = useContext(LegacyThemeContext);
  const {regionId,setRegion} = useWorkspaceStore();
  const location=useLocation(),navigate=useNavigate();
  return <nav className={`navbar${transparent ? ' navbar--transparent' : ''}`} aria-label="Primary">
    <div className="navbar__left">
      <Link to="/" className="navbar__brand" aria-label="FluviSAR — Home"><span className="navbar__brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" stroke="var(--water)"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/><circle cx="12" cy="12" r="3" fill="var(--water)" fillOpacity=".2"/></svg></span><span className="navbar__brand-text">FLUVISAR</span></Link>
      <div className={`navbar__nav${open?' navbar__nav--open':''}`}>
        <NavLink to="/observatory" className="navbar__link" onClick={()=>setOpen(false)}>Observatory</NavLink>
        <NavLink to="/atlas" className="navbar__link" onClick={()=>setOpen(false)}>Atlas</NavLink>
        <NavLink to="/impact" className={({isActive})=>`navbar__link${isActive?' navbar__link--active':''}`} onClick={()=>setOpen(false)}><ClipboardList size={17}/> Decision Desk</NavLink>
        <NavLink to="/insights" className={({isActive})=>`navbar__link${isActive?' navbar__link--active':''}`} onClick={()=>setOpen(false)}>Insights</NavLink>
        <NavLink to="/intelligence" className={({isActive})=>`navbar__link${isActive?' navbar__link--active':''}`} onClick={()=>setOpen(false)}><Brain size={18}/> ML Intelligence</NavLink>
        <NavLink to="/sar-lab" className={({isActive})=>`navbar__link${isActive?' navbar__link--active':''}`} onClick={()=>setOpen(false)}><Microscope size={18}/> SAR Lab</NavLink>
        <NavLink to="/stories" className="navbar__link" onClick={()=>setOpen(false)}>Stories</NavLink>
        <NavLink to="/about" className={({isActive})=>`navbar__link${isActive?' navbar__link--active':''}`} onClick={()=>setOpen(false)}>About us</NavLink>
        <Link to="/reports" className="navbar__btn"><FileText size={16}/> Report</Link>
      </div>
    </div>
    <div className="navbar__right"><button className="navbar__btn navbar__assistant" aria-label="Ask FluviSAR" onClick={()=>useWorkspaceStore.getState().setAgentDrawerOpen(true)}><MessageSquare size={16}/><span>Ask FluviSAR</span></button>
      <select className="navbar__reach-select" aria-label="Investigation region" value={regionId} onChange={e=>{const region=e.target.value as 'jamuna'|'sundarbans';setRegion(region);if(location.pathname.startsWith('/observatory'))navigate('/observatory/'+region);}}><option value="jamuna">Jamuna</option><option value="sundarbans">Sundarbans</option></select>
      <button className="navbar__btn" onClick={toggleTheme} aria-label="Toggle Light/Dark Theme">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
      <button className="navbar__mobile-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}><Menu size={20}/></button>
    </div>
  </nav>;
}
