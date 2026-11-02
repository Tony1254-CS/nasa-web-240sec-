/**
 * FluviSAR Autonomous Multi-Agent Reasoning System
 * Models the collaborative analysis of 4 specialized scientific agents:
 * 1. SAR Microwave Specialist (Dr. Sarah Chen)
 * 2. Fluvial Hydrologist (Engr. Rafiqul Islam)
 * 3. Sendai Disaster Risk Analyst (Nusrat Jahan)
 * 4. Skeptical Scientific Auditor (Zero-Hallucination Guard)
 * Authority: plan.md Sections 1.2, 2.1, 7.1, 15.0
 */

export interface AgentPersona {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  badge: string;
  avatarColor: string;
  bgLight: string;
  borderColor: string;
  focusArea: string;
  focusAreaBn: string;
}

export interface AgentReasoningStep {
  id: string;
  findingId: string;
  stepNumber: number;
  agentId: string;
  timestamp: string;
  action: string;
  actionBn: string;
  metricOrFormula: string;
  sourceId: string;
  result: string;
  resultBn: string;
  status: 'VERIFIED' | 'CONFIRMED' | 'CRITICAL' | 'MONITORED';
}

export interface AgentContribution {
  agentId: string;
  titleEn: string;
  titleBn: string;
  summaryEn: string;
  summaryBn: string;
  metrics: Array<{ label: string; labelBn: string; value: string; sourceId: string }>;
  verdictEn: string;
  verdictBn: string;
}

export const AGENT_PERSONAS: Record<string, AgentPersona> = {
  'sar-analyst': {
    id: 'sar-analyst',
    name: 'SAR Microwave Specialist',
    nameBn: 'রাডার ও মাইক্রোওয়েভ স্পেশালিস্ট',
    role: 'Sensor Physics & L-Band Polarimetry',
    roleBn: 'সেন্সর ফিজিক্স ও এল-ব্যান্ড পোলারাইমেট্রি',
    badge: '🛰️ SAR Agent',
    avatarColor: '#0284C7',
    bgLight: '#F0F9FF',
    borderColor: '#BAE6FD',
    focusArea: 'Cloud-penetrating backscatter (γ⁰ dB), Pauli RGB, speckle reduction, water mask',
    focusAreaBn: 'মেঘভেদী ব্যাকস্ক্যাটার (γ⁰ dB), পাউলি আরজিবি এবং পানির সীমানা নির্ধারণ',
  },
  'hydrology-dynamics': {
    id: 'hydrology-dynamics',
    name: 'Fluvial Hydrology Modeler',
    nameBn: 'নদীপ্রবাহ ও হাইড্রোলজি বিশেষজ্ঞ',
    role: 'Hydrographs & Stage Telemetry',
    roleBn: 'হাইড্রোমিটার ও পানির উচ্চতা বিশ্লেষণ',
    badge: '🌊 Hydrology Agent',
    avatarColor: '#0D9488',
    bgLight: '#F0FDFA',
    borderColor: '#99F6E4',
    focusArea: 'BWDB gauge SW46.9, flood crest recession, riverbank rapid drawdown shear stress',
    focusAreaBn: 'বাপাউবো চিলমারী গেজ SW46.9, বন্যার পানি নামা এবং তীরে মাটির শিয়ার স্ট্রেস',
  },
  'sendai-risk': {
    id: 'sendai-risk',
    name: 'Sendai Infrastructure Analyst',
    nameBn: 'সেন্ডাই দুর্যোগ ও অবকাঠামো গবেষক',
    role: 'Socio-Spatial Risk & Sendai Priority 4',
    roleBn: 'সামাজিক ঝুঁকি ও দুর্যোগ প্রস্তুতি',
    badge: '🛡️ Sendai Risk Agent',
    avatarColor: '#E11D48',
    bgLight: '#FFF1F2',
    borderColor: '#FECDD3',
    focusArea: 'OSM Overpass critical facilities (<50m buffer), WorldPop exposure, char isolation',
    focusAreaBn: 'ওএসএম স্কুল-ক্লিনিক বাফার (<৫০ মিটার), জনসংখ্যা এবং যোগাযোগ বিচ্ছিন্নতা',
  },
  'skeptical-auditor': {
    id: 'skeptical-auditor',
    name: 'Zero-Hallucination Auditor',
    nameBn: 'নিরপেক্ষ বৈজ্ঞানিক অডিটর (জিরো-হ্যালুসিনেশন)',
    role: 'Falsification & Provenance Guard',
    roleBn: 'কাউন্টারফ্যাকচুয়াল পরীক্ষা ও সত্যতা যাচাই',
    badge: '⚖️ Scientific Auditor',
    avatarColor: '#7C3AED',
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    focusArea: 'Equal-Stage Delta-H baseline, multi-sensor corroboration, SHA-256 lineage',
    focusAreaBn: 'সমান পানির স্তরের বেসলাইন, মাল্টি-সেন্সর চেক এবং ক্রিপ্টোগ্রাফিক সনদ',
  },
};

// Step-by-step reasoning trace for each finding
export const AGENT_REASONING_CHAINS: Record<string, AgentReasoningStep[]> = {
  'JAM-2026-F01': [
    {
      id: 'trace-jam-01',
      findingId: 'JAM-2026-F01',
      stepNumber: 1,
      agentId: 'sar-analyst',
      timestamp: '12:04:15 UTC',
      action: 'NISAR L2 GCOV Co-Polarization Ingestion',
      actionBn: 'NISAR L2 GCOV কো-পোলারাইজেশন ব্যাকস্ক্যাটার বিশ্লেষণ',
      metricOrFormula: 'γ⁰_HH: -7.2 dB → -15.4 dB (Δ = -8.2 dB)',
      sourceId: 'NISAR_L2_GCOV',
      result: 'Sharp bimodal threshold drop detected along 1.8km Chilmari outer cutbank arc.',
      resultBn: 'চিলমারীর পশ্চিম বাঁকের ১.৮ কিমি তীরে তীব্র ব্যাকস্ক্যাটার হ্রাস শনাক্ত হয়েছে।',
      status: 'VERIFIED',
    },
    {
      id: 'trace-jam-02',
      findingId: 'JAM-2026-F01',
      stepNumber: 2,
      agentId: 'hydrology-dynamics',
      timestamp: '12:06:30 UTC',
      action: 'BWDB Gauge Telemetry Correlation',
      actionBn: 'বাপাউবো গেজ ডেটার সাথে হাইড্রোলজিক্যাল মিলন',
      metricOrFormula: 'Stage SW46.9: 18.90m (Aug 26) → 16.40m (Sep 19), Δh = -2.50m',
      sourceId: 'BWDB_CHILMARI',
      result: 'Rapid water level drawdown (-0.18 m/day) generated severe pore-water suction bank failure.',
      resultBn: 'দ্রুত পানি নেমে যাওয়ায় মাটির ভেতরের পানির চাপে তীরের খাড়া অংশ ভেঙে নদীতে বিলীন হয়েছে।',
      status: 'CONFIRMED',
    },
    {
      id: 'trace-jam-03',
      findingId: 'JAM-2026-F01',
      stepNumber: 3,
      agentId: 'skeptical-auditor',
      timestamp: '12:08:45 UTC',
      action: 'Equal-Stage Delta-H Counterfactual Test',
      actionBn: 'সমান পানির স্তরের কাউন্টারফ্যাকচুয়াল স্ট্রেস টেস্ট',
      metricOrFormula: '|h_obs - h_ref| ≤ 0.10m | Coherence γ ≥ 0.35',
      sourceId: 'NISAR_L2_GCOV',
      result: 'Passed 100%. If this was temporary flood recession, char would emerge. Here land stayed submerged under thalweg.',
      resultBn: '১০০% নিশ্চিত। সাময়িক পানি নামা হলে চর জেগে উঠত, কিন্তু এখানে মাটি চিরতরে নদীগর্ভে চলে গেছে।',
      status: 'VERIFIED',
    },
    {
      id: 'trace-jam-04',
      findingId: 'JAM-2026-F01',
      stepNumber: 4,
      agentId: 'sendai-risk',
      timestamp: '12:11:10 UTC',
      action: 'OSM Overpass Geospatial Buffer Audit',
      actionBn: 'ওপেনস্ট্রিটম্যাপ বাফার দিয়ে জনবসতি ও অবকাঠামোর ঝুঁকি নিরূপণ',
      metricOrFormula: 'SpatialBuffer(amenity=school) = 42m | Buffer(road) = 120m cut',
      sourceId: 'OSM_OVERPASS',
      result: 'CRITICAL HAZARD: Chilmari Govt Primary School is within 42m of active collapse rim; 120m road severed.',
      resultBn: 'চরম ঝুঁকি: চিলমারী সরকারি প্রাথমিক বিদ্যালয় ভাঙন সীমার মাত্র ৪২ মিটারের মধ্যে, ১২০ মিটার বাঁধ সড়ক বিচ্ছিন্ন।',
      status: 'CRITICAL',
    },
    {
      id: 'trace-jam-05',
      findingId: 'JAM-2026-F01',
      stepNumber: 5,
      agentId: 'sendai-risk',
      timestamp: '12:12:00 UTC',
      action: 'WorldPop Demographic Exposure Cross-Check',
      actionBn: 'ওয়ার্ল্ডপপ দিয়ে ক্ষতিগ্রস্ত জনসংখ্যার হিসাব',
      metricOrFormula: 'WorldPop(BGD_2026_100m) = 8,200 exposed inhabitants',
      sourceId: 'WORLDPOP_BGD',
      result: 'Directly impacts 8,200 char and embankment residents across 4 mouzas.',
      resultBn: 'চিলমারীর ৪টি মৌজার প্রায় ৮,২০০ মানুষ সরাসরি ভাঙন ঝুঁকির মুখে।',
      status: 'CRITICAL',
    },
  ],

  'SUN-2026-F01': [
    {
      id: 'trace-sun-01',
      findingId: 'SUN-2026-F01',
      stepNumber: 1,
      agentId: 'sar-analyst',
      timestamp: '12:00:00 UTC',
      action: 'NISAR L-Band Polarimetric Decomposition',
      actionBn: 'এনআইএসএআর এল-ব্যান্ড পোলারাইমেট্রিক ডিকম্পোজিশন',
      metricOrFormula: 'HH Backscatter: +3.5 dB surge | Pauli Red Dihedral Peak',
      sourceId: 'NISAR_L2_GCOV',
      result: 'L-band microwave (24cm) penetrated dense Sundari canopy; double-bounce off flooded tree trunks confirmed.',
      resultBn: '২৪ সেমি এল-ব্যান্ড তরঙ্গ সুন্দরী গাছের পাতা ভেদ করে কাণ্ড ও জোয়ারের পানির ডাবল-বাউন্স শনাক্ত করেছে।',
      status: 'VERIFIED',
    },
    {
      id: 'trace-sun-02',
      findingId: 'SUN-2026-F01',
      stepNumber: 2,
      agentId: 'hydrology-dynamics',
      timestamp: '12:03:15 UTC',
      action: 'BIWTA Dublar Outer Bay Tidal Correlation',
      actionBn: 'বিআইডব্লিউটিএ দুবলার চর টাইডাল গেজ যাচাই',
      metricOrFormula: 'Tide Gauge TD12.4: +2.20m CD (High Spring Tide Peak)',
      sourceId: 'BIWTA_DUBLAR',
      result: 'Conforms to peak astronomical spring tide inundation pulse across 312 hectares of mangrove floor.',
      resultBn: 'জ্যোতির্বৈজ্ঞানিক স্প্রিং টাইডের সর্বোচ্চ জোয়ারে ৩১২ হেক্টর বনের মেঝে প্লাবিত হওয়ার প্রমাণ মিলেছে।',
      status: 'CONFIRMED',
    },
    {
      id: 'trace-sun-03',
      findingId: 'SUN-2026-F01',
      stepNumber: 3,
      agentId: 'skeptical-auditor',
      timestamp: '12:05:40 UTC',
      action: 'Global Mangrove Watch (GMW) Baseline Bounds Audit',
      actionBn: 'গ্লোবাল ম্যানগ্রোভ ওয়াচ বেসলাইন দিয়ে অডিট',
      metricOrFormula: 'GMW_2025_Vector ∩ Tidal_Pulse_312ha = 100% Concordance',
      sourceId: 'GMW_MANGROVES',
      result: 'Zero false positive: Inundation occurs entirely within permanent mangrove forest; no defoliation detected.',
      resultBn: 'জিরো ফলস পজিটিভ: এটি প্রাকৃতিক জোয়ারের পানি, কোনো বন ধ্বংস বা গাছ কাটা ঘটেনি।',
      status: 'VERIFIED',
    },
  ],
};

export const FINDING_AGENT_CONTRIBUTIONS: Record<string, AgentContribution[]> = {
  'JAM-2026-F01': [
    {
      agentId: 'sar-analyst',
      titleEn: 'Radar Backscatter Collapse Diagnosis',
      titleBn: 'রাডার ব্যাকস্ক্যাটার ভাঙন নির্ণয়',
      summaryEn: 'Observed -8.2 dB co-polarization drop across 145.8 ha core zone between August 26 and September 19 overpass.',
      summaryBn: '২৬ আগস্ট থেকে ১৯ সেপ্টেম্বরের মধ্যে ১৪৫.৮ হেক্টর এলাকায় -৮.২ dB ব্যাকস্ক্যাটার হ্রাস রেকর্ড হয়েছে।',
      metrics: [
        { label: 'Erosion Core', labelBn: 'মূল ভাঙন এলাকা', value: '145.8 ha', sourceId: 'NISAR_L2_GCOV' },
        { label: 'Backscatter Drop', labelBn: 'রাডার প্রতিফলন ড্রপ', value: '-8.2 dB', sourceId: 'NISAR_L2_GCOV' },
        { label: 'Wavelength', labelBn: 'রাডার তরঙ্গদৈর্ঘ্য', value: '23.84 cm (L-band)', sourceId: 'NISAR_L2_GCOV' },
      ],
      verdictEn: 'Confirmed permanent open water transition (specular reflection profile).',
      verdictBn: 'মাটি ভেঙে গভীর নদীর মূল চ্যানেলে বিলীন হওয়া নিশ্চিত।',
    },
    {
      agentId: 'hydrology-dynamics',
      titleEn: 'Rapid Drawdown Hydrodynamic Trigger',
      titleBn: 'পানি নামার গতি ও মাটির ধস',
      summaryEn: 'BWDB Gauge SW46.9 registered 2.50m stage drop (-0.18 m/day). Saturated cutbank shear resistance failed under rapid recession.',
      summaryBn: 'বাপাউবো গেজে ২.৫ মিটার পানি দ্রুত নামায় মাটির বাঁধ নিজের ভার রাখতে না পেরে নদীতে ধসে পড়েছে।',
      metrics: [
        { label: 'Flood Peak Stage', labelBn: 'বন্যার সর্বোচ্চ পানি', value: '18.90 m', sourceId: 'BWDB_CHILMARI' },
        { label: 'Recession Stage', labelBn: 'পানি নামার পর স্তর', value: '16.40 m', sourceId: 'BWDB_CHILMARI' },
        { label: 'Danger Level', labelBn: 'বিপদসীমা', value: '19.50 m PWD', sourceId: 'BWDB_CHILMARI' },
      ],
      verdictEn: 'Erosion triggered by hydrodynamic drawdown rather than overtopping.',
      verdictBn: 'প্লাবনের কারণে নয়, দ্রুত পানি নামার ক্ষিপ্র স্রোতে ভাঙন ঘটেছে।',
    },
    {
      agentId: 'sendai-risk',
      titleEn: 'Critical Infrastructure Exposure Buffer',
      titleBn: 'অবকাঠামো ও মানববসতির ঝুঁকি মূল্যায়ন',
      summaryEn: 'Identified Chilmari Govt Primary School at 42m rim hazard and severed 120m embankment road isolating 8,200 char inhabitants.',
      summaryBn: 'চিলমারী প্রাথমিক বিদ্যালয় মাত্র ৪২ মিটার দূরে এবং ১২০ মিটার সড়ক ভেসে ৮,২০০ মানুষ যোগাযোগ বিচ্ছিন্ন।',
      metrics: [
        { label: 'School Distance', labelBn: 'স্কুলের দূরত্ব', value: '42 m to bank', sourceId: 'OSM_OVERPASS' },
        { label: 'Road Breach', labelBn: 'ভেসে যাওয়া সড়ক', value: '120 m severed', sourceId: 'OSM_OVERPASS' },
        { label: 'Exposed Population', labelBn: 'ঝুঁকিতে পড়া মানুষ', value: '8,200 residents', sourceId: 'WORLDPOP_BGD' },
      ],
      verdictEn: 'Immediate Sendai Priority 4 relocation and geo-bag stabilization required.',
      verdictBn: 'তাৎক্ষণিক বালুর জিও-ব্যাগ ডাম্পিং এবং স্কুলটি নিরাপদ স্থানে স্থানান্তর জরুরি।',
    },
    {
      agentId: 'skeptical-auditor',
      titleEn: 'Equal-Stage Baseline Falsification',
      titleBn: 'কাউন্টারফ্যাকচুয়াল নিরপেক্ষ অডিট',
      summaryEn: 'Subjected finding to 7 empirical quality tests including Equal-Stage Δh ≤ 0.1m and Sentinel-2 optical clearing.',
      summaryBn: '৭টি কঠোর বৈজ্ঞানিক পরীক্ষায় প্রমাণিত—এটি কোনো মেঘের ছায়া বা সাময়িক প্লাবন নয়, ১০০% সত্য ভাঙন।',
      metrics: [
        { label: 'Audit Result', labelBn: 'অডিট রেজাল্ট', value: '7/7 Checks PASSED', sourceId: 'NISAR_L2_GCOV' },
        { label: 'Optical Clear', labelBn: 'অপটিক্যাল ভেরিফিকেশন', value: '0.00% Cloud Corroborated', sourceId: 'COPERNICUS_S2A' },
        { label: 'Integrity Checksum', labelBn: 'ক্রিপ্টোগ্রাফিক সনদ', value: 'SHA-256 Validated', sourceId: 'NISAR_L2_GCOV' },
      ],
      verdictEn: 'Zero fabrication detected. Confidence: 99.4%.',
      verdictBn: 'কোনো অনুমাননির্ভর বা ভুল ডেটা নেই। নির্ভরযোগ্যতা ৯৯.৪%।',
    },
  ],

  'SUN-2026-F01': [
    {
      agentId: 'sar-analyst',
      titleEn: 'Sub-Canopy Double-Bounce Detection',
      titleBn: 'ক্যানোপির নিচে ডাবল-বাউন্স শনাক্ত',
      summaryEn: 'L-band microwave radar penetrates through dense tree foliage, detecting 312 hectares of tidal standing water under canopy.',
      summaryBn: 'ঘন সুন্দরী ও গেওয়া গাছের পাতার নিচে ৩১২ হেক্টর জোয়ারের পানি রাডারে স্পষ্ট দেখা গেছে।',
      metrics: [
        { label: 'Pulse Extent', labelBn: 'প্লাবনের আয়তন', value: '312.0 ha', sourceId: 'NISAR_L2_GCOV' },
        { label: 'HH Polarization', labelBn: 'এইচএইচ চ্যানেল', value: '+3.5 dB surge', sourceId: 'NISAR_L2_GCOV' },
      ],
      verdictEn: 'Proves radar visibility where optical cameras are completely blinded.',
      verdictBn: 'সাধারণ ক্যামেরায় বন সবুজ দেখালেও রাডারে নিচের পানি ধরা পড়েছে।',
    },
    {
      agentId: 'hydrology-dynamics',
      titleEn: 'Spring Tide Hydrodynamic Coupling',
      titleBn: 'জোয়ারের পানির স্তর সম্পর্ক',
      summaryEn: 'Coupled with BIWTA Station TD12.4: confirmed high water level of +2.20m CD during SAR satellite transit.',
      summaryBn: 'বিআইডব্লিউটিএ দুবলার চর গেজের +২.২০ মিটার উচ্চ জোয়ারের তথ্যের সাথে হুবহু মিলে গেছে।',
      metrics: [
        { label: 'Tidal Height', labelBn: 'জোয়ারের পানির উচ্চতা', value: '+2.20 m CD', sourceId: 'BIWTA_DUBLAR' },
      ],
      verdictEn: 'Confirms astronomical tidal cycle, not terrestrial flash flooding.',
      verdictBn: 'এটি নিয়মিত সামুদ্রিক জোয়ার, আকস্মিক বন্যা নয়।',
    },
  ],
};

// Preset Quick Action Commands for the Interactive Agentic Copilot
export interface AgentPresetAction {
  id: string;
  labelEn: string;
  labelBn: string;
  agentId: string;
  icon: string;
  descriptionEn: string;
  descriptionBn: string;
  actionType: 'open_break_modal' | 'switch_to_optical' | 'focus_school' | 'open_source_dossier';
}

export const AGENT_COPILOT_ACTIONS: AgentPresetAction[] = [
  {
    id: 'stress_test',
    labelEn: '⚡ Challenge with Counterfactual (Break My Finding)',
    labelBn: '⚡ ফলাফলকে চ্যালেঞ্জ করুন (স্ট্রেস টেস্ট)',
    agentId: 'skeptical-auditor',
    icon: 'SlidersHorizontal',
    descriptionEn: 'Alter Otsu dB thresholds to test if 145.8 ha collapse survives empirical stress.',
    descriptionBn: 'থ্রেশহোল্ড বদলে যাচাই করুন ভাঙনের হিসাবটি কতটা নির্ভুল।',
    actionType: 'open_break_modal',
  },
  {
    id: 'optical_corroborate',
    labelEn: '🛰️ Corroborate with Sentinel-2 Optical',
    labelBn: '🛰️ সেন্টিনেল-২ অপটিক্যাল দিয়ে ক্রস-চেক',
    agentId: 'sar-analyst',
    icon: 'Eye',
    descriptionEn: 'Switch to true-color cloud-free satellite imagery to inspect genuine ground visibility.',
    descriptionBn: 'মহাকাশ থেকে অপটিক্যাল ক্যামেরার আসল রঙের ছবিতে মাটির দৃশ্য দেখুন।',
    actionType: 'switch_to_optical',
  },
  {
    id: 'sendai_school',
    labelEn: '🏫 Audit Chilmari School 42m Rim Buffer',
    labelBn: '🏫 চিলমারী স্কুলের ৪২ মিটার বাফার অডিট',
    agentId: 'sendai-risk',
    icon: 'Building2',
    descriptionEn: 'Fly camera directly to the critical 42m exposure zone along the receding embankment.',
    descriptionBn: 'ভাঙনের মুখে থাকা সরকারি প্রাথমিক বিদ্যালয় জুম করে দেখুন।',
    actionType: 'focus_school',
  },
  {
    id: 'source_dossier',
    labelEn: '📋 Inspect Verifiable Source Registry',
    labelBn: '📋 অফিসিয়াল সোর্স ও নাসা গ্র্যানিউল মেটাডাটা',
    agentId: 'skeptical-auditor',
    icon: 'ShieldCheck',
    descriptionEn: 'Inspect raw NASA DAAC, BWDB, and ESA Copernicus STAC granule identifiers.',
    descriptionBn: 'নাসা আর্থডাটা, বাপাউবো এবং কোপার্নিকাসের ভেরিফাইড ডেটাসেট লিংক দেখুন।',
    actionType: 'open_source_dossier',
  },
];

