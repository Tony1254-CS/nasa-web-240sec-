import React, { useEffect } from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/Header';
import { AtlasView } from './components/AtlasView';
import { LeftPanel } from './components/LeftPanel';
import { MapWorkspace } from './components/MapWorkspace';
import { RightInspector } from './components/RightInspector';
import { TimelinePlayer } from './components/TimelinePlayer';
import { ContextTracks } from './components/ContextTracks';
import { SwipeCompareMap } from './components/SwipeCompareMap';
import { StoryModeView } from './components/StoryModeView';
import { SarLabView } from './components/SarLabView';
import { CoverageCurtainOverlay } from './components/CoverageCurtainOverlay';
import { radarSonifier } from './utils/sonification';
import './styles/tokens.css';

export const App: React.FC = () => {
  const { activeTab, viewId, selectedPair, isSonificationEnabled, selectedSample } = useWorkspaceStore();

  // Sonification effect on sample update (E22)
  useEffect(() => {
    if (isSonificationEnabled && selectedSample && !selectedSample.masked) {
      radarSonifier.playToneForDb(selectedSample.value);
    }
  }, [isSonificationEnabled, selectedSample]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      {/* 1. Header Navigation & Mode Bar */}
      <Header />

      {/* 2. Main Workspace Layout */}
      <div className="relative flex-1 flex overflow-hidden">
        {activeTab === 'stories' ? (
          <StoryModeView />
        ) : activeTab === 'learn' ? (
          <SarLabView />
        ) : activeTab === 'atlas' || viewId === 'M0' ? (
          <>
            <MapWorkspace />
            <AtlasView />
          </>
        ) : (
          <>
            {/* Left Tools & Views Panel */}
            <LeftPanel />

            {/* Central Geographic Map Workspace */}
            <main className="flex-1 relative flex flex-col overflow-hidden">
              <MapWorkspace />

              {/* Coverage Curtain Support Overlay (N02) */}
              <CoverageCurtainOverlay />

              {/* Swipe Compare Overlay (When a pair is selected) */}
              {selectedPair && (
                <SwipeCompareMap dateA={selectedPair[0]} dateB={selectedPair[1]} />
              )}
            </main>

            {/* Right Evidence & Challenge Inspector */}
            <RightInspector />
          </>
        )}
      </div>

      {/* 3. Linked Context Tracks (Shown when investigating) */}
      {activeTab === 'investigate' && viewId !== 'M0' && <ContextTracks />}

      {/* 4. Rhythm Player Timeline */}
      {activeTab === 'investigate' && viewId !== 'M0' && <TimelinePlayer />}
    </div>
  );
};

export default App;
