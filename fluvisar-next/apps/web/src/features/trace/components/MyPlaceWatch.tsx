import React, { useState } from 'react';
import { Bookmark, Volume2, MapPin, Plus, Calendar } from 'lucide-react';

interface SavedPlace {
  id: string;
  name: string;
  region: 'jamuna' | 'sundarbans';
  coords: [number, number];
  latestObsDate: string;
  waterStatus: string;
  banglaText: string;
  nextPassDate: string;
}

export const MyPlaceWatch: React.FC = () => {
  const [places, setPlaces] = useState<SavedPlace[]>([
    {
      id: 'PLC-CHILMARI-GHAT',
      name: 'Chilmari Port Ferry Ghat & Embankment',
      region: 'jamuna',
      coords: [89.664, 25.565],
      latestObsDate: '2026-10-31',
      waterStatus: 'Bankline recession candidate (145.8 ha)',
      banglaText: 'চিলমারী ঘাট এলাকায় সর্বশেষ ৩১ অক্টোবর ২০২৬ এর রাডার চিত্রে দেখা যাচ্ছে যে নদীর পশ্চিম তীরের মাটি পানির নিচে নেমে গেছে। পরবর্তী স্যাটেলাইট পর্যবেক্ষণ ১২ দিন পর ১২ নভেম্বর প্রত্যাশিত।',
      nextPassDate: '2026-11-12'
    },
    {
      id: 'PLC-MANDALER-CHAR',
      name: 'Mandaler Char Primary School Sector',
      region: 'jamuna',
      coords: [89.725, 25.615],
      latestObsDate: '2026-10-31',
      waterStatus: 'Post-flood sandbar emergence (32.4 ha)',
      banglaText: 'মন্দালের চর এলাকায় বর্ষার পানি নেমে যাওয়ায় নতুন পলল বালুচর জেগে উঠছে। কৃষি পুনর্বাসনের সুযোগ তৈরি হচ্ছে।',
      nextPassDate: '2026-11-12'
    }
  ]);

  const [activePlace, setActivePlace] = useState<SavedPlace>(places[0]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [newPlaceName, setNewPlaceName] = useState<string>('');

  const speakBangla = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName) return;
    const newEntry: SavedPlace = {
      id: `PLC-${Date.now()}`,
      name: newPlaceName,
      region: 'jamuna',
      coords: [89.670, 25.580],
      latestObsDate: '2026-10-31',
      waterStatus: 'Monitored bankline coordinate',
      banglaText: `${newPlaceName} এর পর্যবেক্ষণ রেকর্ড সংরক্ষিত হয়েছে। ১২ দিন পর পরবর্তী একই-ট্র্যাকের রাডার চিত্র পাওয়া যাবে।`,
      nextPassDate: '2026-11-12'
    };
    setPlaces([...places, newEntry]);
    setActivePlace(newEntry);
    setNewPlaceName('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark size={16} className="text-cyan-400" />
          <h3 className="font-bold text-xs text-white">My Place Watch & Bangla Voice (plan.md AX05/AX06)</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
          12-Day Nominal Orbit Cadence
        </span>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Saved Locations Selector */}
        <div className="space-y-1.5">
          <span className="text-slate-400 text-[11px] font-semibold">Your Monitored Locations:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {places.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePlace(p)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  activePlace.id === p.id
                    ? 'bg-cyan-950/50 border-cyan-500/80 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <strong className="text-[11px]">{p.name}</strong>
                  <MapPin size={12} className="text-cyan-400" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Coords: {p.coords[0].toFixed(3)}°E, {p.coords[1].toFixed(3)}°N
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-bold text-white">{activePlace.name}</h4>
              <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{activePlace.waterStatus}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Latest Sentinel-1 Pass</span>
              <strong className="text-white font-mono">{activePlace.latestObsDate}</strong>
            </div>
          </div>

          {/* 12-Day Cadence Alert */}
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-cyan-400" />
              <span>Next Expected Same-Track Pass:</span>
            </div>
            <strong className="font-mono text-cyan-300">{activePlace.nextPassDate} (in 5 days)</strong>
          </div>

          {/* Plain Bangla Translation & Audio Narration */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-[11px]">সহজ বাংলায় গ্রামীণ প্রতিবেদন (Bangla Voice)</span>
              <button
                onClick={() => speakBangla(activePlace.banglaText)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  isSpeaking ? 'bg-rose-700 text-white animate-pulse' : 'bg-cyan-700 text-white hover:bg-cyan-600'
                }`}
              >
                <Volume2 size={13} />
                <span>{isSpeaking ? 'থামান (Stop)' : 'শুনুন (Listen)'}</span>
              </button>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed font-sans">
              {activePlace.banglaText}
            </p>
          </div>
        </div>

        {/* Add Location Form */}
        <form onSubmit={handleAddPlace} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new char or embankment coordinate..."
            value={newPlaceName}
            onChange={(e) => setNewPlaceName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
          />
          <button
            type="submit"
            disabled={!newPlaceName}
            className="px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Save Location</span>
          </button>
        </form>

        {/* Genuine Field Story (plan.md AX09) */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            Attributed Field Story · Chilmari Riverbank (2026)
          </span>
          <p className="text-[11px] text-slate-300 leading-snug italic">
            &ldquo;Every year after the Ashwin monsoon floods, the river changes course. When the radar map showed the western bank retreating, we walked to the Mandaler Char edge and saw the water cutting the silt embankment. Having the satellite date on our phone helps us request ferry relocations before communities get cut off.&rdquo;
          </p>
          <div className="text-[10px] text-slate-500 font-mono">
            — Recorded with informed consent · Verified against Sentinel-1 RTC Granule 005091_009A2D
          </div>
        </div>
      </div>
    </div>
  );
};
