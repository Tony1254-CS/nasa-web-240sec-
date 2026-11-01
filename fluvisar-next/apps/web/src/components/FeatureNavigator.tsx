import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  RotateCcw,
  Sparkles,
  Waves,
  Trees,
  Activity,
  History,
  Layers,
  BarChart2,
  FlaskConical,
  ShieldCheck,
  Zap,
  FileText,
  X,
  ArrowRight,
} from 'lucide-react';

interface FeatureDef {
  id: string;
  nameEn: string;
  nameBn: string;
  tag: string;
  icon: React.ReactNode;
  descEn: string;
  descBn: string;
  metrics: { labelEn: string; labelBn: string; value: string }[];
  actionLabelEn?: string;
  actionLabelBn?: string;
  onAction?: (store: ReturnType<typeof useWorkspaceStore.getState>) => void;
}

export const FEATURE_CATALOG: FeatureDef[] = [
  {
    id: 'time-machine',
    nameEn: 'SAR Time Machine (W2)',
    nameBn: 'টাইম মেশিন সোয়াইপ',
    tag: 'Remote Sensing',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    descEn: 'Interactive dual-date swipe comparing peak flood crest vs recession on real Sentinel-2 and calibrated SAR imagery.',
    descBn: 'মাঝখানের স্লাইডার টেনে ২৬ আগস্টের বন্যা ও ১৯ সেপ্টেম্বরের পানি নেমে যাওয়ার বাস্তব স্যাটেলাইট ছবি তুলনা করুন।',
    metrics: [
      { labelEn: 'Flood Crest Stage', labelBn: 'বন্যার পানির উচ্চতা', value: '18.90 m' },
      { labelEn: 'Receded Stage', labelBn: 'নেমে যাওয়া স্তর', value: '16.40 m (-2.5m)' },
    ],
    actionLabelEn: 'Play Timeline Animation',
    actionLabelBn: 'টাইমলাইন প্লে করুন',
    onAction: (s) => s.togglePlayback(),
  },
  {
    id: 'chilmari-erosion',
    nameEn: 'Chilmari Riverbank Retreat (W4)',
    nameBn: 'চিলমারী নদীভাঙন',
    tag: 'Morphology',
    icon: <Activity className="w-3.5 h-3.5 text-rose-500" />,
    descEn: '145.8 ha critical bank collapse detected along Chilmari West Embankment with -8.2 dB radar power drop.',
    descBn: 'চিলমারী শহর রক্ষা বাঁধে ১৪৫.৮ হেক্টর স্থায়ী নদীভাঙন—যা -৮.২ dB রাডার ড্রপ দ্বারা বৈজ্ঞানিকভাবে নিশ্চিত।',
    metrics: [
      { labelEn: 'Land Lost to Water', labelBn: 'বিলীন হওয়া জমি', value: '145.8 ha' },
      { labelEn: 'Schools at Risk', labelBn: 'ঝুঁকিপূর্ণ প্রাথমিক বিদ্যালয়', value: '1 School' },
      { labelEn: 'Affected Population', labelBn: 'ঝুঁকিতে থাকা মানুষ', value: '8,200 People' },
    ],
    actionLabelEn: 'Open 7-Check Audit',
    actionLabelBn: '৭-স্তরের প্রমাণ অডিট খুলুন',
    onAction: (s) => s.setPanels({ right: true }),
  },
  {
    id: 'mandaler-char',
    nameEn: 'Mandaler Char Silt Accretion (W4)',
    nameBn: 'মন্দালের চর পলি জমা',
    tag: 'Accretion',
    icon: <Waves className="w-3.5 h-3.5 text-amber-500" />,
    descEn: '88.4 ha newly emergent fertile char sandbar formed in the mid-channel braiding network.',
    descBn: 'যমুনা নদীর মাঝে ৮৮.৪ হেক্টর নতুন পলিমাটি জেগে উঠেছে যা কৃষিকাজ ও পলির পুনর্বন্টন নির্দেশ করে।',
    metrics: [
      { labelEn: 'Emergent Sandbar', labelBn: 'জেগে ওঠা নতুন জমি', value: '88.4 ha' },
      { labelEn: 'Surface Signal', labelBn: 'রাডার সিগন্যাল বৃদ্ধি', value: '+4.1 dB' },
    ],
    actionLabelEn: 'Inspect Evidence Card',
    actionLabelBn: 'প্রমাণ কার্ড দেখুন',
    onAction: (s) => s.setPanels({ right: true }),
  },
  {
    id: 'mangrove-pulse',
    nameEn: 'Mangrove Sub-Canopy Tidal Pulse (W3)',
    nameBn: 'সুন্দরবন ক্যানোপি ভেদ',
    tag: 'Coastal Ecology',
    icon: <Trees className="w-3.5 h-3.5 text-emerald-500" />,
    descEn: 'L-band microwave penetration revealing 312 ha ocean tide submergence hidden beneath dense tree canopies.',
    descBn: 'ঘন গাছের পাতার নিচ ভেদ করে জোয়ারের পানি প্রবেশ শনাক্ত—কান্ড ও পানির ডাবল-বাউন্সে +৩.৫ dB বৃদ্ধি।',
    metrics: [
      { labelEn: 'Sub-Canopy Water Area', labelBn: 'গাছের তলার প্লাবিত জমি', value: '312 ha' },
      { labelEn: 'HH Double Bounce', labelBn: 'এইচএইচ সিগন্যাল বৃদ্ধি', value: '+3.5 dB' },
    ],
    actionLabelEn: 'Toggle Radar Switchboard',
    actionLabelBn: 'রাডার সুইচবোর্ড দেখুন',
    onAction: (s) => s.setPanels({ left: true }),
  },
  {
    id: 'river-memory',
    nameEn: 'River Memory (W7)',
    nameBn: 'নদীর ঐতিহাসিক স্মৃতি',
    tag: 'Evolution',
    icon: <History className="w-3.5 h-3.5 text-cyan-600" />,
    descEn: 'Historical braided migration footprints tracing 6-year morphological bank shifts and danger level thresholds.',
    descBn: 'বিগত বছরগুলোতে যমুনার গতিপথ কীভাবে ডানে ও বামে সরেছে তার ঐতিহাসিক মেমরি ও বিপৎসীমা ট্র্যাকিং।',
    metrics: [
      { labelEn: 'Historical Period', labelBn: 'পর্যবেক্ষণ সময়কাল', value: '2020 – 2026' },
      { labelEn: 'Danger Water Level', labelBn: 'বিপৎসীমা পানির স্তর', value: '19.50 m' },
    ],
    actionLabelEn: 'Play Evolution Player',
    actionLabelBn: 'অ্যানিমেশন চালু করুন',
    onAction: (s) => s.togglePlayback(),
  },
  {
    id: 'sat-vs-radar',
    nameEn: 'Radar-to-Reality Dual Swipe (W11)',
    nameBn: 'স্যাটেলাইট বনাম রাডার সোয়াইপ',
    tag: 'Optics vs Radar',
    icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
    descEn: 'True-color optical photography on the left side swiped against microwave X-ray penetration on the right side.',
    descBn: 'বাঁয়ে রিয়েল রঙিন স্যাটেলাইট আলোকচিত্র এবং ডানে ক্যানোপি ও আর্দ্রতা ভেদকারী রাডার এক্স-রে তুলনা।',
    metrics: [
      { labelEn: 'Optical Baseline', labelBn: 'অপটিক্যাল আলোকচিত্র', value: 'Sentinel-2 L2A' },
      { labelEn: 'Radar Sensor', labelBn: 'রাডার সেন্সর', value: 'NISAR L-band GCOV' },
    ],
  },
  {
    id: 'context-tracks',
    nameEn: 'Environmental Context Fusion (W8)',
    nameBn: 'মাল্টি-সেন্সর পরিবেশগত গ্রাফ',
    tag: 'Multisensor',
    icon: <BarChart2 className="w-3.5 h-3.5 text-blue-500" />,
    descEn: 'Synchronized hydro-meteorological tracks: River gauge height, NASA GPM rainfall, Sentinel-2 NDVI and radar dB.',
    descBn: 'একই টাইমলাইনে নদীর পানির স্তর, নাসার বৃষ্টিপাত, গাছপালার সবুজত্ব এবং রাডার সিগন্যালের লাইভ গ্রাফ।',
    metrics: [
      { labelEn: 'Discharge Correlation', labelBn: 'পানির স্তরের সাথে মিল', value: 'r = 0.94' },
      { labelEn: 'Precipitation Window', labelBn: 'উজানের বৃষ্টিপাত', value: '7-Day GPM IMERG' },
    ],
    actionLabelEn: 'Toggle Graphs Drawer',
    actionLabelBn: 'গ্রাফ ড্রয়ার খুলুন/বন্ধ করুন',
    onAction: (s) => s.toggleTracks(),
  },
  {
    id: 'scenario-lab',
    nameEn: 'What-If Scenario Laboratory (W13)',
    nameBn: 'দৃশ্যপট সিমুলেশন ল্যাব',
    tag: 'Simulation',
    icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    descEn: 'Simulate high flood discharge (+50,000 m³/s) and embankment breach scenarios to assess future inundation.',
    descBn: 'পানি +১ মিটার বাড়লে অথবা বাঁধ ভেঙে গেলে কোন এলাকা কতটুকু প্লাবিত হবে তা পরীক্ষা করার লাইভ ল্যাব।',
    metrics: [
      { labelEn: 'Discharge Stress Test', labelBn: 'উজানের অতিরিক্ত পানি', value: '+50,000 m³/s' },
      { labelEn: 'Breach Locations', labelBn: 'বাঁধ ভাঙন পয়েন্ট', value: 'North / South' },
    ],
    actionLabelEn: 'Open Scenario Lab',
    actionLabelBn: 'সিমুলেশন ল্যাব খুলুন',
    onAction: (s) => s.setPanels({ left: true }),
  },
  {
    id: 'qc-audit',
    nameEn: '7-Check Automated QC Audit (W5)',
    nameBn: '৭-স্তরের বৈজ্ঞানিক প্রমাণ অডিট',
    tag: 'Confidence',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    descEn: 'Seven automated validation tests verifying orbit quality, coherence, stage correlation, and speckle noise.',
    descBn: 'স্যাটেলাইটের মান, কোহেরেন্স ও পানির স্তরসহ ৭টি কঠোর পরীক্ষায় উত্তীর্ণ নিশ্চিত ফলাফল।',
    metrics: [
      { labelEn: 'Automated Status', labelBn: 'অডিট ফলাফল', value: '7/7 Tests Passed' },
      { labelEn: 'Confidence Score', labelBn: 'বৈজ্ঞানিক আস্থা স্কোর', value: '94% High' },
    ],
    actionLabelEn: 'View Evidence Checks',
    actionLabelBn: 'প্রমাণ অডিট দেখুন',
    onAction: (s) => s.setPanels({ right: true }),
  },
  {
    id: 'break-finding',
    nameEn: 'Break My Finding Stress-Test (W6)',
    nameBn: 'ব্রেক মাই ফাইন্ডিং ল্যাব',
    tag: 'Stress Test',
    icon: <FlaskConical className="w-3.5 h-3.5 text-purple-600" />,
    descEn: 'Counterfactual interactive lab allowing user to perturb Otsu dB thresholds to separate Robust Core from noise.',
    descBn: 'অ্যালগরিদমের বিরুদ্ধে গিয়ে নিজেই থ্রেশহোল্ড ঘুরিয়ে ফলাফল পরীক্ষা করার জন্য ওটসু হিস্টোগ্রাম ল্যাব।',
    metrics: [
      { labelEn: 'Threshold Perturbation', labelBn: 'প্যারামিটার পরিবর্তন সীমা', value: '±2.0 dB' },
      { labelEn: 'Robust Area Stability', labelBn: 'অটুট কোর এলাকা', value: '88% Preserved' },
    ],
    actionLabelEn: 'Launch Break My Finding',
    actionLabelBn: 'ব্রেক মাই ফাইন্ডিং শুরু করুন',
    onAction: () => {
      // Handled via modal trigger
    },
  },
  {
    id: 'impact-ledger',
    nameEn: 'Sendai Disaster Impact Ledger (W9)',
    nameBn: 'সেন্ডাই ফ্রেমওয়ার্ক ক্ষতির খতিয়ান',
    tag: 'Humanitarian',
    icon: <Activity className="w-3.5 h-3.5 text-red-600" />,
    descEn: 'Comprehensive socio-economic exposure: Primary schools, health clinics, roads and displaced populations.',
    descBn: 'নদীভাঙনের ফলে কতগুলো স্কুল, ক্লিনিক, সড়ক ও গ্রামীণ জনসংখ্যা ক্ষতির ঝুঁকিতে পড়েছে তার সঠিক হিসাব।',
    metrics: [
      { labelEn: 'Primary Schools', labelBn: 'প্রাথমিক বিদ্যালয়', value: '1 School' },
      { labelEn: 'Embankment Road', labelBn: 'বাঁধ সড়ক বিচ্ছিন্ন', value: '120 meters' },
      { labelEn: 'Exposed Population', labelBn: 'ঝুঁকিতে থাকা মানুষ', value: '8,200' },
    ],
    actionLabelEn: 'Open Impact Inspector',
    actionLabelBn: 'ক্ষতির খতিয়ান খুলুন',
    onAction: (s) => s.setPanels({ right: true }),
  },
  {
    id: 'decision-brief',
    nameEn: 'Decision Brief & Mobile QR (W14)',
    nameBn: 'ডিসিশন ব্রিফ ও ফিল্ড QR',
    tag: 'Official Report',
    icon: <FileText className="w-3.5 h-3.5 text-blue-600" />,
    descEn: 'One-page official printable administrative brief with live QR code for on-device mobile field inspection.',
    descBn: 'জেলা প্রশাসক ও ফিল্ড কর্মকর্তাদের জন্য ১ পাতার প্রিন্টযোগ্য অফিশিয়াল ব্রিফ এবং মোবাইল ভেরিফিকেশন QR কোড।',
    metrics: [
      { labelEn: 'Format', labelBn: 'ডকুমেন্ট ফরম্যাট', value: 'A4 Printable PDF' },
      { labelEn: 'Field Verification', labelBn: 'ফিল্ড ভেরিফিকেশন', value: 'Dynamic QR Code' },
    ],
  },
];

export const FeatureNavigator: React.FC<{ onOpenBrief: () => void; onOpenBreakFinding: () => void }> = ({
  onOpenBrief,
  onOpenBreakFinding,
}) => {
  const {
    language,
    activeFeatureId,
    setActiveFeature,
    isLeftPanelOpen,
    isRightPanelOpen,
    isTracksOpen,
    toggleLeftPanel,
    toggleRightPanel,
    toggleTracks,
  } = useWorkspaceStore();

  const isBn = language === 'bn';
  const activeDef = FEATURE_CATALOG.find((f) => f.id === activeFeatureId);

  const handleFeatureClick = (id: string) => {
    if (id === 'decision-brief') {
      onOpenBrief();
      return;
    }
    if (id === 'break-finding') {
      onOpenBreakFinding();
      return;
    }
    if (activeFeatureId === id) {
      setActiveFeature(null);
    } else {
      setActiveFeature(id);
    }
  };

  return (
    <>
      {/* 1. Sleek Floating Top Feature Strip (Positioned neatly under map controls) */}
      <div className="absolute top-14 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        {/* Scrollable Pills Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 px-1.5 max-w-full bg-white/92 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm pointer-events-auto scrollbar-none">
          <div className="flex items-center space-x-1 pl-1.5 pr-2 border-r border-slate-200 text-[#155E75] font-bold text-[11px] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">{isBn ? 'ফিচার নেভিগেটর:' : 'Features:'}</span>
          </div>

          {FEATURE_CATALOG.map((f) => {
            const isActive = activeFeatureId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFeatureClick(f.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#155E75] text-white shadow-xs scale-102 ring-1 ring-[#155E75]'
                    : 'text-slate-700 bg-slate-50/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
                title={isBn ? f.nameBn : f.nameEn}
              >
                <span>{f.icon}</span>
                <span>{isBn ? f.nameBn : f.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Floating Focused Feature Spotlight Card (Smooth Glassmorphism HUD) */}
      {activeDef && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 select-none pointer-events-auto">
          {/* Card Header */}
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#E0F2FE] text-[#0369A1] rounded-lg">
                {activeDef.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {activeDef.tag}
                </span>
                <h3 className="font-bold text-sm text-[#102A43] leading-snug mt-0.5">
                  {isBn ? activeDef.nameBn : activeDef.nameEn}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setActiveFeature(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Close Spotlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Body Explanation */}
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
            {isBn ? activeDef.descBn : activeDef.descEn}
          </p>

          {/* Key Metrics Grid */}
          {activeDef.metrics && activeDef.metrics.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
              {activeDef.metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isBn ? m.labelBn : m.labelEn}
                  </span>
                  <span className="text-xs font-bold text-[#102A43] font-mono mt-0.5">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          {activeDef.actionLabelEn && (
            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (activeDef.onAction) {
                    activeDef.onAction(useWorkspaceStore.getState());
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl bg-[#155E75] hover:bg-[#0E7490] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>{isBn ? activeDef.actionLabelBn : activeDef.actionLabelEn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Floating Drawer Toggle Buttons for Clean Screen Customization */}
      {/* Left Drawer Toggle Pill */}
      <button
        onClick={toggleLeftPanel}
        className={`absolute left-2 top-28 z-20 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border shadow-md text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
          isLeftPanelOpen
            ? 'bg-[#155E75] text-white border-[#155E75]'
            : 'bg-white/90 text-slate-700 border-slate-200/90 hover:bg-white'
        }`}
        title={isLeftPanelOpen ? 'Hide Tools & Lenses' : 'Show Tools & Lenses'}
      >
        <span>{isLeftPanelOpen ? '◀' : '▶'}</span>
        <span className="hidden sm:inline">{isBn ? 'টুলস ও লেন্স' : 'Lenses & Tools'}</span>
      </button>

      {/* Right Drawer Toggle Pill */}
      <button
        onClick={toggleRightPanel}
        className={`absolute right-2 top-28 z-20 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border shadow-md text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
          isRightPanelOpen
            ? 'bg-[#155E75] text-white border-[#155E75]'
            : 'bg-white/90 text-slate-700 border-slate-200/90 hover:bg-white'
        }`}
        title={isRightPanelOpen ? 'Hide Evidence & Audit' : 'Show Evidence & Audit'}
      >
        <span className="hidden sm:inline">{isBn ? 'প্রমাণ ও অডিট' : 'Evidence & Audit'}</span>
        <span>{isRightPanelOpen ? '▶' : '◀'}</span>
      </button>

      {/* Bottom Environmental Tracks Toggle Pill */}
      <button
        onClick={toggleTracks}
        className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-3 py-1 rounded-full border shadow-md text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
          isTracksOpen
            ? 'bg-[#155E75] text-white border-[#155E75]'
            : 'bg-white/90 text-slate-700 border-slate-200/90 hover:bg-white'
        }`}
        title={isTracksOpen ? 'Collapse Environmental Tracks' : 'Expand Environmental Tracks'}
      >
        <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
        <span>{isTracksOpen ? (isBn ? 'গ্রাফ লুকান ▼' : 'Hide Tracks ▼') : (isBn ? 'পরিবেশগত গ্রাফ দেখুন ▲' : 'Environmental Tracks ▲')}</span>
      </button>
    </>
  );
};
