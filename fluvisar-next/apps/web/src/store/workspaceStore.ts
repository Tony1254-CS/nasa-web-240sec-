import { create } from 'zustand';

export type RegionId = 'jamuna' | 'sundarbans';
export type ViewId = 'M0' | 'J1' | 'J2' | 'J3' | 'S1' | 'S2' | 'X1' | 'C1';
export type WorkspaceMode = 'explore' | 'investigate' | 'act';
export type Language = 'en' | 'bn';
export type Audience = 'public' | 'decision' | 'analyst';

export interface MapCamera {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export interface WorkspaceState {
  // Navigation & Region
  regionId: RegionId;
  caseId: string;
  runId: string;
  viewId: ViewId;
  mode: WorkspaceMode;
  
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
  
  // Map State
  camera: MapCamera;
  
  // Actions
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
  regionId: 'jamuna',
  caseId: 'river-memory',
  runId: 'run-2026-prod-01',
  viewId: 'M0', // Atlas by default
  mode: 'explore',
  language: 'bn', // Default Bangla with toggle to EN
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
  camera: {
    center: [89.75, 25.575],
    zoom: 6.8, // View of full Bangladesh for M0 Atlas
  },

  setRegion: (regionId) =>
    set((state) => {
      if (state.regionId === regionId) return state;
      const def = REGION_DEFAULTS[regionId];
      // Reset incompatible state per Section 18.1
      return {
        regionId,
        caseId: def.defaultCase,
        viewId: def.defaultView,
        selectedFindingId: null,
        selectedPatch: null,
        camera: {
          center: def.center,
          zoom: def.zoom,
        },
      };
    }),

  setCase: (caseId) => set({ caseId, selectedFindingId: null, selectedPatch: null }),
  setView: (viewId) => set({ viewId }),
  setMode: (mode) => set({ mode }),
  setLanguage: (language) => set({ language }),
  setAudience: (audience) => set({ audience }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedPair: (selectedPair) => set({ selectedPair }),
  toggleLayer: (layerId) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: !state.layerVisibility[layerId],
      },
    })),
  setSelectedFinding: (selectedFindingId) => set({ selectedFindingId }),
  setCamera: (camera) => set({ camera }),
}));
