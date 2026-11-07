import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
import { AtlasView } from './components/AtlasView';
import { MapWorkspace } from './components/MapWorkspace';
import { ObservatoryFeaturePanel } from './components/ObservatoryFeaturePanel';
import { FindingInspectorDrawer } from './components/FindingInspectorDrawer';
import { TimelinePlayer } from './components/TimelinePlayer';
import { ContextTracks } from './components/ContextTracks';
import { SwipeCompareMap } from './components/SwipeCompareMap';
import { StoryModeView } from './components/StoryModeView';
import { SarLabView } from './components/SarLabView';
import { ReportsView } from './components/ReportsView';
import { CoverageCurtainOverlay } from './components/CoverageCurtainOverlay';
import { FluviAssistant } from './components/FluviAssistant';
import { SourceProvenanceModal } from './components/SourceProvenanceModal';
import { radarSonifier } from './utils/sonification';
import './styles/tokens.css';
import { LegacyPageLayout } from './features/legacy/LegacyPageLayout';
import { EvidenceProvider, currentEvidence } from './data/evidence';
import { Navbar } from './features/legacy/components/Navbar';
import { ObservatoryHeader } from './components/ObservatoryHeader';
import { EvidenceWorkbench } from './components/EvidenceWorkbench';
import './styles/observatory-redesign.css';

const DecisionDesk = lazy(() => import('./features/legacy/pages/ImpactDesk').then(m=>({default:m.DecisionDesk})));
const IntelligencePage = lazy(() => import('./features/legacy/pages/IntelligenceWorkspace').then(m=>({default:m.IntelligencePage})));
const AboutPage = lazy(() => import('./features/legacy/pages/About').then(m=>({default:m.AboutPage})));
const SARLabPage = lazy(() => import('./features/legacy/pages/SARLab').then(m=>({default:m.SARLabPage})));
const TraceFieldApp = lazy(() => import('./features/trace/TraceFieldApp').then(m=>({default:m.TraceFieldApp})));

// 1. Observatory Route Component (Handles /observatory and /observatory/:regionId)
const ObservatoryRoute: React.FC = () => {
  const { regionId: urlRegionId } = useParams<{ regionId?: string }>();
  const { regionId, setRegion, selectedPair } = useWorkspaceStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(()=>{
    useWorkspaceStore.setState({comparisonEnabled:false,basemapType:'satellite',isRightInspectorOpen:false,selectedFindingId:null});
  },[]);

  useEffect(() => {
    const state=useWorkspaceStore.getState();
    if(state.viewId==='M0')state.setView((urlRegionId??regionId)==='sundarbans'?'S1':'J1');
    if (urlRegionId === 'jamuna' || urlRegionId === 'sundarbans') {
      if (regionId !== urlRegionId) {
        setRegion(urlRegionId);
      }
    } else if (!urlRegionId) {
      navigate(`/observatory/${regionId}`, { replace: true });
    }
  }, [urlRegionId, regionId, setRegion, navigate]);

  useEffect(() => {
    const state = useWorkspaceStore.getState();
    const t0 = searchParams.get('t0'), t1 = searchParams.get('t1');
    const dates=currentEvidence(state.regionId).observations.map(o=>o.date);
    if (t0 && t1 && t0 < t1 && dates.includes(t0) && dates.includes(t1)) state.setSelectedPair([t0,t1]);
    const finding = searchParams.get('finding');
    if (finding && (!searchParams.get('run') || searchParams.get('run') === state.runId)) state.setSelectedFinding(finding);
  }, [searchParams, urlRegionId]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <main className="observatory-stage flex-1 relative flex flex-col overflow-hidden w-full h-full">
        {/* Full Viewport Map Canvas */}
        <MapWorkspace observatory />

        {/* Coverage Curtain Support Overlay (N02) */}
        <CoverageCurtainOverlay />

        {/* Swipe Compare Overlay (When a pair is selected) */}
        {selectedPair && (
          <SwipeCompareMap dateA={selectedPair[0]} dateB={selectedPair[1]} />
        )}

        {/* 1. Sleek Active Lens Guide & Explainer (Replaces clunky LeftPanel) */}
        <ObservatoryFeaturePanel />

        {/* 2. Focused Finding Inspector Drawer (Replaces clunky RightInspector) */}
        <FindingInspectorDrawer />
        <EvidenceWorkbench />
      </main>

      {/* Linked Context Tracks */}
      <ContextTracks />

      {/* Rhythm Player Timeline */}
      <TimelinePlayer />
    </div>
  );
};

// 2. Atlas Route Component (Handles /atlas)
const AtlasRoute: React.FC = () => {
  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-[#080d14]">
      <AtlasView />
    </div>
  );
};

// 3. Main App Root Component
const WorkspaceApp: React.FC = () => {
  const {pathname}=useLocation();
  const mapRoute=pathname.startsWith('/observatory');
  const { isSonificationEnabled, selectedSample } = useWorkspaceStore();

  // Sonification effect on sample update (E22)
  useEffect(() => {
    if (isSonificationEnabled && selectedSample && !selectedSample.masked) {
      radarSonifier.playToneForDb(selectedSample.value);
    }
  }, [isSonificationEnabled, selectedSample]);

  return (
    <div className={'workspace-shell'+(pathname==='/atlas'?' atlas-shell':'')+(mapRoute?' observatory-shell':'')+(pathname.startsWith('/observatory')?' observatory-redesign':'')}>
      {/* 1. Universal Top Header Navigation & Mode Bar */}
      {mapRoute&&(pathname.startsWith('/observatory')?<ObservatoryHeader/>:<Header />)}

      {/* 2. Real URL Route Tree */}
      <div className="relative flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPageView />} />
          <Route path="/observatory" element={<ObservatoryRoute />} />
          <Route path="/observatory/:regionId" element={<ObservatoryRoute />} />
          <Route path="/atlas" element={<AtlasRoute />} />
          <Route path="/stories" element={<StoryModeView />} />
          <Route path="/stories/:chapterId" element={<StoryModeView />} />
          <Route path="/learn" element={<SarLabView />} />
          <Route path="/learn/:experimentId" element={<SarLabView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/trace" element={<Suspense fallback={<div className="desk-standby">Loading TRACE Field…</div>}><TraceFieldApp /></Suspense>} />
          <Route path="/field" element={<Navigate to="/trace" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* 3. Global Autonomous Agentic Copilot & Verified Provenance Inspector */}
      <SourceProvenanceModal />
    </div>
  );
};

export const App: React.FC = () => <EvidenceProvider><LegacyPageLayout><Navbar/><Routes>
  <Route path="/" element={<LandingPageView/>}/>
  <Route path="/impact" element={<Suspense fallback={<div className="desk-standby">Loading Decision Desk…</div>}><DecisionDesk /></Suspense>} />
  <Route path="/about" element={<Suspense fallback={<div className="desk-standby">Opening our story...</div>}><AboutPage/></Suspense>}/><Route path="/about-us" element={<Navigate to="/about" replace/>}/>
  <Route path="/imact" element={<Navigate to="/impact" replace />} />
  <Route path="/trace" element={<Suspense fallback={<div className="desk-standby">Loading TRACE Field…</div>}><TraceFieldApp /></Suspense>} />
  <Route path="/field" element={<Navigate to="/trace" replace />} />
  <Route path="/intelligence" element={<Suspense fallback={<div className="desk-standby">Loading ML Intelligence…</div>}><IntelligencePage /></Suspense>} />
  <Route path="/sar-lab" element={<Suspense fallback={<div className="desk-standby">Loading SAR Lab…</div>}><SARLabPage /></Suspense>} />
  <Route path="/learn" element={<Navigate to="/sar-lab" replace/>}/>
  <Route path="/learn/:experimentId" element={<Navigate to="/sar-lab#simulations" replace/>}/>
  <Route path="*" element={<WorkspaceApp />} />
</Routes><FluviAssistant/></LegacyPageLayout></EvidenceProvider>;

export default App;
