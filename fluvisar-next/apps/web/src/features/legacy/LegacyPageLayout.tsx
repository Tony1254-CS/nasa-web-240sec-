import { Component, useState, type ReactNode, type ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { LegacyThemeContext } from './theme';
import './styles/tokens.css';
import './styles/base.css';
import './styles/agentic.css';
import './styles/globe.css';
import './styles/navbar.css';
import './styles/decision-desk.css';
import './styles/intelligence.css';
import './styles/integration.css';
import '../../styles/science-system.css';
import '../../styles/observatory-restored.css';

class PageErrorBoundary extends Component<{children:ReactNode}, {error:string|null}> {
  state = { error: null as string|null };
  static getDerivedStateFromError(error: Error) { return {error:error.message}; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Investigation page failed',error,info.componentStack); }
  render() { return this.state.error ? <div className="desk-standby"><h1>Investigation unavailable</h1><p>{this.state.error}</p><Link to="/observatory">Return to Observatory</Link></div> : this.props.children; }
}

export function LegacyPageLayout({children}:{children:ReactNode}) {
  const {regionId,runId} = useWorkspaceStore();
  const [theme,setTheme] = useState<'dark'|'light'>(()=>localStorage.getItem('fluvisar-page-theme')==='light'?'light':'dark');
  const toggleTheme = () => setTheme(previous=>{ const next = previous==='dark'?'light':'dark'; localStorage.setItem('fluvisar-page-theme',next); return next; });
  return <LegacyThemeContext.Provider value={{theme,toggleTheme}}><div className="legacy-pages" data-theme={theme}>
    <div className="elegant-bg"/><div className="grid-mesh"/><div className="radar-light"/>
    <div className="legacy-content"><PageErrorBoundary key={`${regionId}:${runId}`}>{children}</PageErrorBoundary></div>
  </div></LegacyThemeContext.Provider>;
}
