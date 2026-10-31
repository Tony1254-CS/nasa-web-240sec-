import React from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/Header';
import { AtlasView } from './components/AtlasView';
import { LeftPanel } from './components/LeftPanel';
import { MapWorkspace } from './components/MapWorkspace';
import { RightInspector } from './components/RightInspector';
import { TimelinePlayer } from './components/TimelinePlayer';
import './styles/tokens.css';

export const App: React.FC = () => {
  const { viewId } = useWorkspaceStore();

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

            {/* Central Geographic Map */}
            <main className="flex-1 relative flex flex-col overflow-hidden">
              <MapWorkspace />
            </main>

            {/* Right Evidence & Challenge Inspector */}
            <RightInspector />
          </>
        )}
      </div>

      {/* 3. Rhythm Player Timeline (Shown across all views) */}
      <TimelinePlayer />
    </div>
  );
};

export default App;
