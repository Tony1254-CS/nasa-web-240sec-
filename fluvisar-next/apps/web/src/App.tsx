import React from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/Header';
import { AtlasView } from './components/AtlasView';
import { LeftPanel } from './components/LeftPanel';
import { MapWorkspace } from './components/MapWorkspace';
import { RightInspector } from './components/RightInspector';
import { TimelinePlayer } from './components/TimelinePlayer';
import { ContextTracks } from './components/ContextTracks';
import { SwipeCompareMap } from './components/SwipeCompareMap';
import './styles/tokens.css';

export const App: React.FC = () => {
  const { viewId, selectedPair } = useWorkspaceStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      {/* 1. Header Navigation & Mode Bar */}
      <Header />

      {/* 2. Main Workspace Layout */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* If M0 Atlas mode, show full Bangladesh map with Atlas Overlay */}
        {viewId === 'M0' ? (
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
      {viewId !== 'M0' && <ContextTracks />}

      {/* 4. Rhythm Player Timeline */}
      <TimelinePlayer />
    </div>
  );
};

export default App;
