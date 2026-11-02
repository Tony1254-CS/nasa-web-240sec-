import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
import { AtlasView } from './components/AtlasView';
import { MapWorkspace } from './components/MapWorkspace';
import { ObservatoryLensGuide } from './components/ObservatoryLensGuide';
import { FindingInspectorDrawer } from './components/FindingInspectorDrawer';
import { TimelinePlayer } from './components/TimelinePlayer';
import { ContextTracks } from './components/ContextTracks';
import { SwipeCompareMap } from './components/SwipeCompareMap';
import { StoryModeView } from './components/StoryModeView';
import { SarLabView } from './components/SarLabView';
import { ReportsView } from './components/ReportsView';
import { CoverageCurtainOverlay } from './components/CoverageCurtainOverlay';
import { AgenticCopilotDrawer } from './components/AgenticCopilotDrawer';
import { SourceProvenanceModal } from './components/SourceProvenanceModal';
import { radarSonifier } from './utils/sonification';
import './styles/tokens.css';

// 1. Observatory Route Component (Handles /observatory and /observatory/:regionId)
const ObservatoryRoute: React.FC = () => {
  const { regionId: urlRegionId } = useParams<{ regionId?: string }>();
  const { regionId, setRegion, selectedPair } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlRegionId === 'jamuna' || urlRegionId === 'sundarbans') {
      if (regionId !== urlRegionId) {
        setRegion(urlRegionId);
      }
    } else if (!urlRegionId) {
      navigate(`/observatory/${regionId}`, { replace: true });
    }
  }, [urlRegionId, regionId, setRegion, navigate]);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <main className="flex-1 relative flex flex-col overflow-hidden w-full h-full">
        {/* Full Viewport Map Canvas */}
        <MapWorkspace />

        {/* Coverage Curtain Support Overlay (N02) */}
        <CoverageCurtainOverlay />

        {/* Swipe Compare Overlay (When a pair is selected) */}
        {selectedPair && (
          <SwipeCompareMap dateA={selectedPair[0]} dateB={selectedPair[1]} />
        )}

        {/* 1. Sleek Active Lens Guide & Explainer (Replaces clunky LeftPanel) */}
        <ObservatoryLensGuide />

        {/* 2. Focused Finding Inspector Drawer (Replaces clunky RightInspector) */}
        <FindingInspectorDrawer />
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
  const { setView } = useWorkspaceStore();
  useEffect(() => {
    setView('M0');
  }, [setView]);

  return (
    <div className="relative flex-1 flex overflow-hidden w-full h-full">
      <MapWorkspace />
      <AtlasView />
    </div>
  );
};

// 3. Main App Root Component
export const App: React.FC = () => {
  const { isSonificationEnabled, selectedSample } = useWorkspaceStore();

  // Sonification effect on sample update (E22)
  useEffect(() => {
    if (isSonificationEnabled && selectedSample && !selectedSample.masked) {
      radarSonifier.playToneForDb(selectedSample.value);
    }
  }, [isSonificationEnabled, selectedSample]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      {/* 1. Universal Top Header Navigation & Mode Bar */}
      <Header />

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* 3. Global Autonomous Agentic Copilot & Verified Provenance Inspector */}
      <AgenticCopilotDrawer />
      <SourceProvenanceModal />
    </div>
  );
};

export default App;
