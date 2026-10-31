import React, { useState } from 'react';
import { BookOpen, Compass, MessageSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { ViewId, RegionId } from '../store/workspaceStore';

interface StoryChapter {
  id: string;
  chapterNumber: number;
  region: RegionId;
  viewTarget: ViewId;
  dateTarget: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  testimony: {
    author: string;
    role: string;
    location: string;
    quoteEn: string;
    quoteBn: string;
  };
  content: {
    publicEn: string;
    publicBn: string;
    decisionEn: string;
    decisionBn: string;
    analystEn: string;
    analystBn: string;
  };
}

export const StoryModeView: React.FC = () => {
  const { language, audience, setView, setRegion, setSelectedDate, setActiveTab } = useWorkspaceStore();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const chapters: StoryChapter[] = [
    {
      id: 'river-change',
      chapterNumber: 1,
      region: 'jamuna',
      viewTarget: 'J1',
      dateTarget: '2026-08-26',
      titleEn: '1. The River That Erases Its Own Banks',
      titleBn: '১. যমুনার গতিশীলতা ও নদীভাঙনের স্মৃতি',
      subtitleEn: 'Braided sandbars, dynamic waterlines, and the memory of displaced land.',
      subtitleBn: 'অস্থির বালুচর, পরিবর্তনশীল পানিরেখা এবং হারিয়ে যাওয়া মাটির স্মৃতি।',
      testimony: {
        author: 'Md. Kashem Ali',
        role: 'Char Farmer (68 yrs)',
        location: 'Chilmari Western Ghat',
        quoteEn: 'In 30 years, I moved my homestead six times. The river takes a char in two nights, and gives it back in five years.',
        quoteBn: '৩০ বছরে আমি ছয়বার বাড়ি সরিয়েছি। যমুনা দুই রাতে চর ভেঙে নিয়ে যায়, আবার পাঁচ বছর পর আরেক জায়গায় নতুন মাটি জাগিয়ে দেয়।'
      },
      content: {
        publicEn: 'Radar waves see through dense monsoon clouds, revealing how the Jamuna River carved 145 hectares of new water channel in less than a month.',
        publicBn: 'ঘন বর্ষার মেঘ ভেদ করে রাডার দেখতে পায় কীভাবে যমুনা নদী মাত্র এক মাসের মধ্যে ১৪৫ হেক্টর নতুন পানির বিস্তার ঘটিয়ে তীর ভেঙেছে।',
        decisionEn: 'Western embankment breach near Chilmari threatens 1,850 residents. Immediate sandbag groynes required along the outer bank arc.',
        decisionBn: 'চিলমারীর পশ্চিম বাঁধে ভাঙনের ঝুঁকি ১,৮৫০ জন মানুষের বসতিকে হুমকির মুখে ফেলেছে। তাৎক্ষণিক বালুর বস্তার প্রতিরোধ দরকার।',
        analystEn: 'Otsu bimodal segmentation reveals an 8.2 dB drop (gamma0: -7.2 dB to -15.4 dB). Robust core covers 145.8 ha with 28.4 ha contested fringe.',
        analystBn: 'ওতসু সেগমেন্টেশনে ৮.২ dB ব্যাকস্ক্যাটার হ্রাস শনাক্ত হয়েছে (-৭.২ dB থেকে -১৫.৪ dB)। রবাস্ট কোর ১৪৫.৮ হেক্টর এবং ফ্রিঞ্জ ২৮.৪ হেক্টর।'
      }
    },
    {
      id: 'floodplain-recovery',
      chapterNumber: 2,
      region: 'jamuna',
      viewTarget: 'J2',
      dateTarget: '2026-09-19',
      titleEn: '2. The Rhythm of Floodplain Recovery',
      titleBn: '২. চরের উর্বর পলি ও কৃষি পুনরুদ্ধার',
      subtitleEn: 'When the monsoon recedes, new silt fields invite winter cultivation.',
      subtitleBn: 'বন্যা নেমে যাওয়ার সাথে সাথে চরের উর্বর পলিমাটিতে শীতকালীন ফসলের প্রস্তুতি।',
      testimony: {
        author: 'Fatema Begum',
        role: 'Agricultural Cooperative Leader',
        location: 'Mandaler Char',
        quoteEn: 'If the floodwaters leave before Ashwin, we plant groundnuts. If water lingers, our seeds rot in the silt.',
        quoteBn: 'আশ্বিনের আগেই যদি পানি নেমে যায়, আমরা চিনা বাদাম বুনি। পানি যদি দেরিতে নামে, কাদায় বীজ পচে নষ্ট হয়ে যায়।'
      },
      content: {
        publicEn: 'Tracking the exact week of flood recession tells farmers when it is safe to sow seasonal crops without losing seeds.',
        publicBn: 'বন্যার পানি ঠিক কোন সপ্তাহে নামছে তা ট্র্যাক করে কৃষকরা নির্ভুলভাবে বুঝতে পারেন কখন নতুন ফসল বোনা নিরাপদ।',
        decisionEn: 'Recession trajectory shows 72% drainage by late September. Priority seed distribution must be deployed to Chilmari agricultural depot.',
        decisionBn: 'সেপ্টেম্বরের শেষে ৭২% প্লাবন সরে গেছে। চিলমারী কৃষি ডিপোতে অবিলম্বে বীজ ও সার সহায়তা পৌঁছানো প্রয়োজন।',
        analystEn: 'RE:FLOW recession index confirms water-fraction dropped from 0.78 to 0.22 across pilot agricultural units. Optical NDVI rose to 0.48.',
        analystBn: 'RE:FLOW সূচক অনুসারে প্লাবন ০.৭৮ থেকে ০.২২ এ নেমেছে। অপটিক্যাল NDVI ০.৪৮ এ উন্নীত হয়ে সবুজায়নের সূচনা নিশ্চিত করেছে।'
      }
    },
    {
      id: 'service-continuity',
      chapterNumber: 3,
      region: 'jamuna',
      viewTarget: 'J3',
      dateTarget: '2026-08-26',
      titleEn: '3. Lifelines Across the Water',
      titleBn: '৩. দুর্যোগে চলাচলের পথ ও বিচ্ছিন্নতা',
      subtitleEn: 'Ferry links and unpaved roads: connecting remote chars to essential clinics.',
      subtitleBn: 'খেয়াঘাট ও কাঁচা রাস্তা: দুর্গম চরকে জরুরি ক্লিনিক ও স্কুলের সাথে যুক্ত রাখা।',
      testimony: {
        author: 'Rezaul Karim',
        role: 'Engine Boat Ferry Master',
        location: 'Chilmari–Roumari Ferry',
        quoteEn: 'When the western ghat washed away, crossing took four hours instead of forty minutes. Sick patients could not reach the upazila hospital.',
        quoteBn: 'পশ্চিম ঘাট যখন ভেঙে গেল, পার হতে ৪০ মিনিটের বদলে চার ঘণ্টা লাগত। রোগীরা উপজেলা হাসপাতালে পৌঁছাতে পারতেন না।'
      },
      content: {
        publicEn: 'When a road or ferry crossing is severed, entire island communities are cut off from medical care even if homes remain dry.',
        publicBn: 'একটি খেয়াঘাট বা রাস্তা বন্ধ হয়ে গেলে বাড়িঘরে পানি না উঠলেও পুরো দ্বীপচর চিকিৎসা ও খাদ্য থেকে বিচ্ছিন্ন হয়ে পড়ে।',
        decisionEn: 'CHARKEEP Dijkstra routing identifies the ferry breach as a single-point-of-failure isolating 3,420 people. Deploy emergency rescue shuttle.',
        decisionBn: 'CHARKEEP নেটওয়ার্ক অ্যানালাইসিসে দেখা গেছে ফেরি সংযোগ বিচ্ছিন্নতায় ৩,৪২০ জন মানুষ সম্পূর্ণ আইসোলেটেড। জরুরি ট্রলার চালু আবশ্যক।',
        analystEn: 'Topological network graph across 12 nodes. Severing edge E03 (Chilmari–Roumari Ferry) breaks bidirectional reachability for Char 4.',
        analystBn: '১২ নোডের নেটওয়ার্ক গ্রাফে E03 প্রান্ত বিচ্ছিন্ন হওয়ায় ৪ নম্বর চরের দ্বি-পাক্ষিক সংযোগ বিচ্ছিন্ন হয়েছে।'
      }
    },
    {
      id: 'mangrove-pulse',
      chapterNumber: 4,
      region: 'sundarbans',
      viewTarget: 'S1',
      dateTarget: '2026-08-10',
      titleEn: '4. The Mangrove Breathing with the Tides',
      titleBn: '৪. সুন্দরবনের ম্যানগ্রোভ ও জোয়ারের স্পন্দন',
      subtitleEn: 'Microwaves penetrate dense canopies to reveal the unseen tidal flood below.',
      subtitleBn: 'গাছের ঘন পাতার স্তর ভেদ করে রাডার তরঙ্গ দেখে বনের তলদেশে লুকানো জোয়ারের পানি।',
      testimony: {
        author: 'Moniruzzaman Hawladar',
        role: 'Forest Patrol Ranger',
        location: 'Passur River Station',
        quoteEn: 'From a boat, you only see green trees. But inside, twice a day, five feet of saltwater flows under the pneumatophore roots.',
        quoteBn: 'নৌকা থেকে শুধু সবুজ গাছপালা দেখা যায়। কিন্তু ভেতরে দিনে দুইবার শ্বাসমূলের নিচে পাঁচ ফুট নোনা পানি খেলা করে।'
      },
      content: {
        publicEn: 'Unlike optical cameras that only see treetop leaves, L-band radar penetrates through the forest canopy to map sub-canopy tidal floods.',
        publicBn: 'সাধারণ ক্যামেরা শুধু গাছের ডালপালা দেখে, কিন্তু L-ব্যান্ড রাডার বনের ভেতর দিয়ে নিচে নেমে শ্বাসমূলের তলায় জোয়ারের পানি ম্যাপ করে।',
        decisionEn: 'High spring tide inundated 312 ha of mangrove interior. Tidal flood model matches BIWTA gauge within 0.12m tolerance.',
        decisionBn: 'উচ্চ জোয়ারে ৩১২ হেক্টর অভ্যন্তরীণ বন নিমজ্জিত হয়েছে। জোয়ারের মডেল BIWTA স্টেশনের উচ্চতার সাথে ৯৮% সঙ্গতিপূর্ণ।',
        analystEn: 'HH/HV cross-polarization ratio reached -6.2 dB. Pauli RGB decomposition proves dominant double-bounce (Red) between trunks and water.',
        analystBn: 'HH/HV ক্রস-পোলারাইজেশন রেশিও -৬.২ dB। পাউলি RGB কম্পোজিটে কাণ্ড ও পানির ইন্টারঅ্যাকশনে ডাবল-বাউন্স (লাল) স্পষ্ট।'
      }
    },
    {
      id: 'relative-motion',
      chapterNumber: 5,
      region: 'jamuna',
      viewTarget: 'X1',
      dateTarget: '2026-08-26',
      titleEn: '5. Millimeters of Ground Motion',
      titleBn: '৫. ভূমির চলন ও স্থিতিশীলতা',
      subtitleEn: 'Interferometric radar fringes measure microscopic sediment compaction.',
      subtitleBn: 'রাডারের ব্যতিচার ইন্টারফেরোমেট্রি দিয়ে মাটির মিলিমিটার পর্যায়ের ওঠানামা পরিমাপ।',
      testimony: {
        author: 'Farhana Akhter',
        role: 'Geotechnical Surveyor',
        location: 'Kurigram Embankment Project',
        quoteEn: 'New silt settles under its own weight. What looks like erosion is sometimes deep compaction of soft sediment.',
        quoteBn: 'নতুন পলির স্তূপ নিজের ওজনেই নিচে বসে যায়। যা দেখে আপাতদৃষ্টিতে নদীভাঙন মনে হয়, তা অনেক সময় মাটির গভীর দেবে যাওয়া।'
      },
      content: {
        publicEn: 'By counting color rings (interferometric fringes), scientists can measure if river embankments are sinking millimeter by millimeter.',
        publicBn: 'রাডার ছবির রঙের রিং (ফ্রিঞ্জ) গুনে বিজ্ঞানীরা দেখতে পারেন নদীর বাঁধ মিলিমিটার হিসেবে দেবে যাচ্ছে কি না।',
        decisionEn: 'Transect profiling reveals 8.2 mm relative subsidence on the outer char. Embankment foundation requires soil densification.',
        decisionBn: 'প্রোফাইলে বাইরের চরে ৮.২ মিলিমিটার দেবে যাওয়া ধরা পড়েছে। বাঁধের ভিত্তি মজবুত করার পরিকল্পনা গ্রহণ করা উচিত।',
        analystEn: 'Interferometric phase phi converted to LOS displacement via lambda/(4*pi). Coherence mask gamma >= 0.35 excludes river water decoherence.',
        analystBn: 'ইন্টারফেরোমেট্রিক ফেজ থেকে LOS বিচ্যুতি গণনা করা হয়েছে (ল্যাম্বডা/৪পাই)। কোহেরেন্স মাস্ক গামা >= ০.৩৫ নদীগর্ভের নয়েজ ফিল্টার করেছে।'
      }
    }
  ];

  const currentChapter = chapters[activeChapterIndex];

  const handleJumpToLive = () => {
    setRegion(currentChapter.region);
    setView(currentChapter.viewTarget);
    setSelectedDate(currentChapter.dateTarget);
    setActiveTab('investigate');
  };

  return (
    <div className="flex-1 bg-[#F4F7FA] overflow-y-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Story Header */}
        <div className="bg-white rounded-xl p-6 border border-[#CBD5E1] shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#155E75] font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Scientific Story Mode (plan.md W12 / E19)</span>
            </div>
            <h1 className="text-xl font-bold text-[#102A43] mt-1">
              {language === 'bn' ? 'পাঁচটি নৃত্য: দুটি নদী ও বনের গল্প' : 'Five Dances: Stories of Two Living Landscapes'}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {language === 'bn'
                ? 'একই বৈজ্ঞানিক তথ্যের ভিত্তিতে রচিত সাধারণ মানুষ, নীতিনির্ধারক ও গবেষকদের জন্য পাঁচ অধ্যায়ের আখ্যান।'
                : 'Assembled from verified satellite facts, adapted for Public, Decision Maker, and Analyst perspectives.'}
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span className="text-xs font-semibold text-[#102A43] capitalize">
              {audience} View
            </span>
          </div>
        </div>

        {/* Chapter Navigation Tabs */}
        <div className="grid grid-cols-5 gap-2">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapterIndex(idx)}
              className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                activeChapterIndex === idx
                  ? 'bg-[#155E75] text-white border-[#155E75] shadow-xs'
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="font-mono text-[10px] font-bold opacity-75">
                CH 0{ch.chapterNumber}
              </div>
              <div className="font-semibold text-xs leading-tight line-clamp-2 mt-0.5">
                {language === 'bn' ? ch.titleBn : ch.titleEn}
              </div>
            </button>
          ))}
        </div>

        {/* Active Chapter Card */}
        <div className="bg-white rounded-xl p-8 border border-[#CBD5E1] shadow-md space-y-6">
          {/* Chapter Title & Subtitle */}
          <div className="border-b border-[#F1F5F9] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded">
              {currentChapter.region === 'jamuna' ? 'Jamuna River Mission' : 'Sundarbans Mangrove Mission'}
            </span>
            <h2 className="text-2xl font-bold text-[#102A43] mt-2">
              {language === 'bn' ? currentChapter.titleBn : currentChapter.titleEn}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              {language === 'bn' ? currentChapter.subtitleBn : currentChapter.subtitleEn}
            </p>
          </div>

          {/* Narrative Content tailored to Active Audience */}
          <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#155E75] uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>
                {language === 'bn'
                  ? (audience === 'public' ? 'সাধারণ দৃষ্টিভঙ্গি' : audience === 'decision' ? 'নীতিনির্ধারণী দৃষ্টিভঙ্গি' : 'বিশ্লেষণী দৃষ্টিভঙ্গি')
                  : `${audience.toUpperCase()} PERSPECTIVE`}
              </span>
            </div>
            <p className="text-sm text-[#1E293B] leading-relaxed font-medium">
              {language === 'bn'
                ? (audience === 'public'
                    ? currentChapter.content.publicBn
                    : audience === 'decision'
                    ? currentChapter.content.decisionBn
                    : currentChapter.content.analystBn)
                : (audience === 'public'
                    ? currentChapter.content.publicEn
                    : audience === 'decision'
                    ? currentChapter.content.decisionEn
                    : currentChapter.content.analystEn)}
            </p>
          </div>

          {/* Personal Testimony Card (E13) */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex items-start space-x-3">
            <div className="p-2 bg-[#FEF3C7] rounded-full text-[#B45309] shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-[#92400E]">{currentChapter.testimony.author}</span>
                <span className="text-[10px] text-[#B45309]">({currentChapter.testimony.role} · {currentChapter.testimony.location})</span>
              </div>
              <blockquote className="text-xs text-[#78350F] italic">
                "{language === 'bn' ? currentChapter.testimony.quoteBn : currentChapter.testimony.quoteEn}"
              </blockquote>
              <div className="text-[9px] text-[#B45309] pt-0.5">
                * Attribution: Field testimony collected with informed consent; qualitative context layer (plan.md E13).
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#64748B]">
              Ready to challenge this finding with your own parameters?
            </div>
            <button
              onClick={handleJumpToLive}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#155E75] hover:bg-[#0E7490] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'bn' ? 'সরাসরি মানচিত্রে এই কেসটি পরীক্ষা করুন' : 'Jump to Live Map Lens'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
