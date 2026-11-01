import { create } from 'zustand';

export type RegionId = 'jamuna' | 'sundarbans';
export type ViewId = 'M0' | 'J1' | 'J2' | 'J3' | 'S1' | 'S2' | 'X1' | 'C1';
export type WorkspaceMode = 'explore' | 'investigate' | 'act';
export type Language = 'en' | 'bn';
export type Audience = 'public' | 'decision' | 'analyst';
export type ActiveTab = 'atlas' | 'investigate' | 'stories' | 'learn' | 'reports';
export type BasemapType = 'satellite' | 'sar' | 'carto';
export type OverlayStyle = 'outlines' | 'tinted';

export interface MapCamera {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface PixelSample {
  lon: number;
  lat: number;
  value: number | null;
  unit: string;
  masked: boolean;
  reason?: string | null;
}

export interface WorkspaceState {
  // Navigation & Region
  activeTab: ActiveTab;
  regionId: RegionId;
  caseId: string;
  runId: string;
  viewId: ViewId;
  mode: WorkspaceMode;

  // Basemap & Visualization
  basemapType: BasemapType;
  overlayStyle: OverlayStyle;
  swipePosition: number; // 0 - 100 percentage
  comparisonMode: 'dates' | 'sensors';

  // Localization & Audience
  language: Language;
  audience: Audience;

  // Temporal & Observation State
  selectedDate: string;
  availableDates: string[];
  selectedPair: [string, string] | null;
  isPlaying: boolean;

  // Layers & Lenses
  activeLens: string;
  layerVisibility: Record<string, boolean>;

  // Finding & Selection
  selectedFindingId: string | null;
  selectedPatch: any | null;
  selectedSample: PixelSample | null;

  // Sonification & Audio
  isSonificationEnabled: boolean;

  // Responsive Workspace Panel Visibility
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isTracksOpen: boolean;
  activeFeatureId: string | null;

  // Map State
  camera: MapCamera;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setBasemapType: (basemap: BasemapType) => void;
  setOverlayStyle: (style: OverlayStyle) => void;
  setSwipePosition: (pos: number) => void;
  setComparisonMode: (mode: 'dates' | 'sensors') => void;
  setRegion: (regionId: RegionId) => void;
  setCase: (caseId: string) => void;
  setView: (viewId: ViewId) => void;
  setMode: (mode: WorkspaceMode) => void;
  setLanguage: (lang: Language) => void;
  setAudience: (aud: Audience) => void;
  setSelectedDate: (date: string) => void;
  setSelectedPair: (pair: [string, string] | null) => void;
  toggleLayer: (layerId: string) => void;
  setSelectedFinding: (findingId: string | null) => void;
  setSelectedSample: (sample: PixelSample | null) => void;
  toggleSonification: () => void;
  togglePlayback: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleTracks: () => void;
  setPanels: (panels: { left?: boolean; right?: boolean; tracks?: boolean }) => void;
  setActiveFeature: (featureId: string | null) => void;
  setCamera: (camera: MapCamera) => void;
}

const REGION_DEFAULTS: Record<RegionId, { center: [number, number]; zoom: number; defaultView: ViewId; defaultCase: string }> = {
  jamuna: {
    center: [89.75, 25.575],
    zoom: 11,
    defaultView: 'J1',
    defaultCase: 'river-memory',
  },
  sundarbans: {
    center: [89.70, 21.875],
    zoom: 11.5,
    defaultView: 'S1',
    defaultCase: 'wetland-pulse',
  },
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTab: 'investigate',
  regionId: 'jamuna',
  caseId: 'river-memory',
  runId: 'run-2026-prod-01',
  viewId: 'J1', // Direct to Jamuna investigation by default
  mode: 'explore',
  basemapType: 'satellite', // Default to REAL satellite imagery!
  overlayStyle: 'outlines', // Default to crisp OUTLINES ONLY so satellite photo is 100% visible!
  swipePosition: 50,
  comparisonMode: 'dates',
  language: 'en', // Default English with toggle to BN
  audience: 'public',
  selectedDate: '2026-08-26',
  availableDates: ['2026-06-23', '2026-07-17', '2026-08-10', '2026-08-26', '2026-09-19', '2026-10-21'],
  selectedPair: ['2026-08-26', '2026-09-19'],
  isPlaying: false,
  activeLens: 'amplitude',
  layerVisibility: {
    radar: true,
    water: true,
    transitions: true,
    boundaries: true,
    assets: true,
    context: true,
  },
  selectedFindingId: null,
  selectedPatch: null,
  selectedSample: {
    lon: 89.75,
    lat: 25.575,
    value: -14.2,
    unit: 'dB',
    masked: false,
  },
  isSonificationEnabled: false,
  isLeftPanelOpen: false, // Default to clean fullscreen map!
  isRightPanelOpen: false,
  isTracksOpen: false,
  activeFeatureId: null,
  camera: {
    center: [89.75, 25.575],
    zoom: 6.8, // View of full Bangladesh for M0 Atlas
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setBasemapType: (basemapType) => set({ basemapType }),
  setOverlayStyle: (overlayStyle) => set({ overlayStyle }),
  setSwipePosition: (swipePosition: number) => set({ swipePosition }),
  setComparisonMode: (comparisonMode: 'dates' | 'sensors') => set({ comparisonMode }),
  setRegion: (regionId) =>
    set((state) => {
      if (state.regionId === regionId) return state;
      const def = REGION_DEFAULTS[regionId];
      // Reset incompatible state per Section 18.1
      return {
        regionId,
        activeTab: 'investigate',
        caseId: def.defaultCase,
        viewId: def.defaultView,
        selectedFindingId: null,
        selectedPatch: null,
        selectedSample: null,
        camera: {
          center: def.center,
          zoom: def.zoom,
        },
      };
    }),

  setCase: (caseId) => set({ caseId, selectedFindingId: null, selectedPatch: null }),
  setView: (viewId) => set({ viewId, activeTab: viewId === 'M0' ? 'atlas' : 'investigate' }),
  setMode: (mode) => set({ mode }),
  setLanguage: (language) => set({ language }),
  setAudience: (audience) => set({ audience }),
  setSelectedDate: (selectedDate) =>
    set((state) => {
      let newPair: [string, string] | null = state.selectedPair;
      if (newPair) {
        const currIdx = state.availableDates.indexOf(selectedDate);
        if (currIdx > 0) {
          // Compare with preceding date in timeline (e.g. Aug 26 -> Sep 19)
          newPair = [state.availableDates[currIdx - 1], selectedDate];
        } else if (state.availableDates.length > 1) {
          // If earliest date picked, compare against peak flood crest or next date
          const peakIdx = state.availableDates.indexOf('2026-08-26');
          newPair = [selectedDate, peakIdx !== -1 ? '2026-08-26' : state.availableDates[1]];
        }
      }
      return { selectedDate, selectedPair: newPair };
    }),
  setSelectedPair: (selectedPair) =>
    set({
      selectedPair,
      ...(selectedPair ? { selectedDate: selectedPair[1] } : {}),
    }),
  toggleLayer: (layerId) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: !state.layerVisibility[layerId],
      },
    })),
  setSelectedFinding: (selectedFindingId) => set({ selectedFindingId }),
  setSelectedSample: (selectedSample) => set({ selectedSample }),
  toggleSonification: () => set((state) => ({ isSonificationEnabled: !state.isSonificationEnabled })),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  toggleTracks: () => set((state) => ({ isTracksOpen: !state.isTracksOpen })),
  setPanels: (panels) =>
    set((state) => ({
      isLeftPanelOpen: panels.left !== undefined ? panels.left : state.isLeftPanelOpen,
      isRightPanelOpen: panels.right !== undefined ? panels.right : state.isRightPanelOpen,
      isTracksOpen: panels.tracks !== undefined ? panels.tracks : state.isTracksOpen,
    })),
  setActiveFeature: (activeFeatureId) =>
    set(() => {
      if (!activeFeatureId) {
        return { activeFeatureId: null };
      }
      switch (activeFeatureId) {
        case 'time-machine':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            comparisonMode: 'dates',
            isLeftPanelOpen: false,
            isRightPanelOpen: false,
            isTracksOpen: false,
          };
        case 'sat-vs-radar':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            comparisonMode: 'sensors',
            isLeftPanelOpen: false,
            isRightPanelOpen: false,
            isTracksOpen: false,
          };
        case 'chilmari-erosion':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'jamuna',
            viewId: 'J1',
            selectedFindingId: 'FINDING-JAMUNA-2026-CHILMARI-01',
            isLeftPanelOpen: false,
            isRightPanelOpen: true,
            isTracksOpen: false,
          };
        case 'mandaler-char':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'jamuna',
            viewId: 'J2',
            selectedFindingId: 'FINDING-JAMUNA-2026-MANDALER-01',
            isLeftPanelOpen: false,
            isRightPanelOpen: true,
            isTracksOpen: false,
          };
        case 'mangrove-pulse':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'sundarbans',
            viewId: 'S1',
            selectedFindingId: 'FINDING-SUNDARBANS-2026-DUBLAR-01',
            isLeftPanelOpen: true,
            isRightPanelOpen: false,
            isTracksOpen: false,
          };
        case 'river-memory':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'jamuna',
            viewId: 'J1',
            isLeftPanelOpen: true,
            isRightPanelOpen: false,
            isTracksOpen: false,
          };
        case 'radar-pol':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'sundarbans',
            viewId: 'S1',
            isLeftPanelOpen: true,
            isRightPanelOpen: false,
          };
        case 'context-tracks':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            isTracksOpen: true,
          };
        case 'scenario-lab':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'jamuna',
            viewId: 'C1',
            isLeftPanelOpen: true,
            isRightPanelOpen: false,
          };
        case 'insar-motion':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            regionId: 'jamuna',
            viewId: 'X1',
            isLeftPanelOpen: true,
            isRightPanelOpen: false,
          };
        case 'qc-audit':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            isRightPanelOpen: true,
          };
        case 'impact-ledger':
          return {
            activeFeatureId,
            activeTab: 'investigate',
            isRightPanelOpen: true,
          };
        case 'stories':
          return {
            activeFeatureId,
            activeTab: 'stories',
          };
        case 'sar-lab':
          return {
            activeFeatureId,
            activeTab: 'learn',
          };
        case 'atlas':
          return {
            activeFeatureId,
            activeTab: 'atlas',
            viewId: 'M0',
          };
        default:
          return { activeFeatureId };
      }
    }),
  setCamera: (camera) => set({ camera }),
}));
