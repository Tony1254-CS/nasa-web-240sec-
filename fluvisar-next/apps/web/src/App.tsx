import React, { useState, useEffect } from 'react';
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
import { FeatureNavigator } from './components/FeatureNavigator';
import { DecisionBriefModal } from './components/DecisionBriefModal';
import { BreakMyFindingModal } from './components/BreakMyFindingModal';
import { radarSonifier } from './utils/sonification';
import './styles/tokens.css';

export const App: React.FC = () => {
  const {
    activeTab,
    viewId,
    selectedPair,
    isSonificationEnabled,
    selectedSample,
    isLeftPanelOpen,
    isRightPanelOpen,
    isTracksOpen,
  } = useWorkspaceStore();

  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isBreakFindingOpen, setIsBreakFindingOpen] = useState(false);

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
          <div className="relative flex-1 flex overflow-hidden w-full h-full">
            {/* Central Geographic Map Workspace (Clean Full-Screen Viewport) */}
            <main className="flex-1 relative flex flex-col overflow-hidden w-full h-full">
              <MapWorkspace />

              {/* Coverage Curtain Support Overlay (N02) */}
              <CoverageCurtainOverlay />

              {/* Swipe Compare Overlay (When a pair is selected) */}
              {selectedPair && (
                <SwipeCompareMap dateA={selectedPair[0]} dateB={selectedPair[1]} />
              )}

              {/* Top Feature Spotlight Navigator & HUD */}
              <FeatureNavigator
                onOpenBrief={() => setIsReportsOpen(true)}
                onOpenBreakFinding={() => setIsBreakFindingOpen(true)}
              />
            </main>

            {/* Left Tools & Views Panel (Sliding Responsive Drawer) */}
            <div
              className={`absolute top-0 bottom-0 left-0 z-20 w-80 max-w-[85vw] bg-white border-r border-[#CBD5E1] shadow-2xl transition-transform duration-300 ease-in-out ${
                isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <LeftPanel />
            </div>

            {/* Right Evidence & Challenge Inspector (Sliding Responsive Drawer) */}
            <div
              className={`absolute top-0 bottom-0 right-0 z-20 w-96 max-w-[90vw] bg-white border-l border-[#CBD5E1] shadow-2xl transition-transform duration-300 ease-in-out ${
                isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <RightInspector />
            </div>
          </div>
        )}
      </div>

      {/* 3. Linked Context Tracks (Sliding Responsive Drawer) */}
      {activeTab === 'investigate' && viewId !== 'M0' && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
            isTracksOpen ? 'max-h-36 opacity-100 border-t border-[#CBD5E1]' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <ContextTracks />
        </div>
      )}

      {/* 4. Rhythm Player Timeline */}
      {activeTab === 'investigate' && viewId !== 'M0' && <TimelinePlayer />}

      {/* Global Modals */}
      <DecisionBriefModal isOpen={isReportsOpen} onClose={() => setIsReportsOpen(false)} />
      <BreakMyFindingModal isOpen={isBreakFindingOpen} onClose={() => setIsBreakFindingOpen(false)} />
    </div>
  );
};

export default App;
