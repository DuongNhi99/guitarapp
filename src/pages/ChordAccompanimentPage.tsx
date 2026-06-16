import { useState, useRef, useEffect } from "react";
import { Play, Square, RotateCcw, Volume2, Music2 } from "lucide-react";
import { pluck } from "../utils/guitarAudio";
import { CHORDS, OPEN_MIDI, midiToFreq } from "../utils/guitarConstants";
import { cn } from "../utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Dir = "down" | "up";
type StrumEv = { offset: number; dir: Dir; vol: number };
type Slot = { id: string; chord: string; beats: number };

// ── Strum Patterns ─────────────────────────────────────────────────────────────
// offset = beat position within 1 chord cycle (0 = beat 1)
// Only events with offset < slot.beats are played

const PATTERNS: Record<string, { label: string; events: StrumEv[] }> = {
  ballad: {
    label: "Ballad",
    events: [
      { offset: 0, dir: "down", vol: 0.85 },
      { offset: 1, dir: "down", vol: 0.55 },
      { offset: 2, dir: "down", vol: 0.70 },
      { offset: 3, dir: "down", vol: 0.55 },
    ],
  },
  slow_rock: {
    label: "Slow Rock",
    events: [
      { offset: 0,   dir: "down", vol: 0.85 },
      { offset: 1,   dir: "down", vol: 0.55 },
      { offset: 1.5, dir: "up",   vol: 0.40 },
      { offset: 2,   dir: "down", vol: 0.65 },
      { offset: 2.5, dir: "up",   vol: 0.40 },
      { offset: 3,   dir: "down", vol: 0.55 },
      { offset: 3.5, dir: "up",   vol: 0.40 },
    ],
  },
  rock: {
    label: "Rock",
    events: [
      { offset: 0,   dir: "down", vol: 0.90 },
      { offset: 1,   dir: "down", vol: 0.70 },
      { offset: 1.5, dir: "up",   vol: 0.50 },
      { offset: 2,   dir: "down", vol: 0.80 },
      { offset: 3,   dir: "down", vol: 0.65 },
      { offset: 3.5, dir: "up",   vol: 0.45 },
    ],
  },
  cha_cha: {
    label: "Cha Cha",
    events: [
      { offset: 0,   dir: "down", vol: 0.80 },
      { offset: 0.5, dir: "up",   vol: 0.40 },
      { offset: 1,   dir: "down", vol: 0.70 },
      { offset: 2,   dir: "down", vol: 0.80 },
      { offset: 2.5, dir: "up",   vol: 0.40 },
      { offset: 3,   dir: "down", vol: 0.70 },
      { offset: 3.5, dir: "up",   vol: 0.40 },
    ],
  },
  waltz: {
    label: "Valse (3/4)",
    events: [
      { offset: 0, dir: "down", vol: 0.85 },
      { offset: 1, dir: "up",   vol: 0.40 },
      { offset: 2, dir: "down", vol: 0.55 },
    ],
  },
};

// ── Chord groups for picker ────────────────────────────────────────────────────

const CHORD_GROUPS = [
  { label: "Trưởng", names: ["C", "D", "E", "F", "G", "A", "B", "Bb"] },
  { label: "Thứ",    names: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm", "F#m"] },
  { label: "7",      names: ["C7", "D7", "E7", "G7", "A7", "B7", "Am7", "Dm7"] },
];

// ── Preset progressions ────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Am Canon",   chords: ["Am", "F",  "C",   "G"]  },
  { label: "C (Pop)",    chords: ["C",  "G",  "Am",  "F"]  },
  { label: "G (Pop)",    chords: ["G",  "D",  "Em",  "C"]  },
  { label: "D (Pop)",    chords: ["D",  "A",  "Bm",  "G"]  },
  { label: "E (Rock)",   chords: ["E",  "A",  "B7",  "E"]  },
  { label: "Am Ballad",  chords: ["Am", "E7", "F",   "G"]  },
  { label: "Dm Ballad",  chords: ["Dm", "Am", "Bb",  "C"]  },
  { label: "Jazz",       chords: ["Am7","Dm7","G7",  "C"]  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

let _id = 0;
const uid = () => String(++_id);
const makeSlots = (cs: string[], beats = 4): Slot[] =>
  cs.map(c => ({ id: uid(), chord: c, beats }));

// ── Component ──────────────────────────────────────────────────────────────────

export default function ChordAccompanimentPage() {
  const [sequence, setSequence] = useState<Slot[]>(makeSlots(["Am", "F", "C", "G"]));
  const [bpm, setBpm] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [pattern, setPattern] = useState("slow_rock");
  const [volume, setVolume] = useState(0.75);
  const [loop, setLoop] = useState(true);

  // Audio engine state (never triggers re-renders)
  const ctxRef      = useRef<AudioContext | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef      = useRef<number | null>(null);
  const nextTimeRef = useRef(0);
  const nextSlotRef = useRef(0);
  const beatTL      = useRef<{ t: number; i: number }[]>([]);
  const isPlayRef   = useRef(false);

  // Mirror latest React state into refs so scheduler always reads fresh values
  const seqRef = useRef(sequence);
  const bpmRef = useRef(bpm);
  const patRef = useRef(pattern);
  const volRef = useRef(volume);
  const loopRef = useRef(loop);
  useEffect(() => { seqRef.current = sequence; }, [sequence]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { patRef.current = pattern; }, [pattern]);
  useEffect(() => { volRef.current = volume; }, [volume]);
  useEffect(() => { loopRef.current = loop; }, [loop]);

  // Mutable function refs — reassigned each render so callbacks never go stale
  const tickRef  = useRef<() => void>(() => {});
  const rafCbRef = useRef<() => void>(() => {});
  const stopRef  = useRef<() => void>(() => {});
  const startRef = useRef<() => void>(() => {});

  // ── stop ────────────────────────────────────────────────────────────────────
  function stop() {
    isPlayRef.current = false;
    setIsPlaying(false);
    setCurrentIdx(-1);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (rafRef.current)   { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (ctxRef.current)   { ctxRef.current.close(); ctxRef.current = null; }
  }
  stopRef.current = stop;

  // ── scheduler tick (runs every 50 ms via setInterval) ───────────────────────
  tickRef.current = () => {
    const ctx = ctxRef.current;
    if (!ctx || !isPlayRef.current) return;

    const AHEAD = 0.3; // schedule up to 300 ms ahead of current time
    const now   = ctx.currentTime;

    while (nextTimeRef.current < now + AHEAD) {
      const idx = nextSlotRef.current;
      const seq = seqRef.current;

      // Non-loop mode: stop after one full pass
      if (!loopRef.current && idx >= seq.length) {
        const endT = nextTimeRef.current;
        setTimeout(() => stopRef.current(), Math.max(0, (endT - ctx.currentTime) * 1000 + 200));
        return;
      }

      const slot = seq[idx % seq.length];
      const bd   = 60 / bpmRef.current; // seconds per beat
      const t0   = nextTimeRef.current;

      // Record for visual sync
      beatTL.current.push({ t: t0, i: idx % seq.length });
      if (beatTL.current.length > 120) beatTL.current = beatTL.current.slice(-60);

      // Schedule each strum event in this chord's window
      for (const ev of PATTERNS[patRef.current].events) {
        if (ev.offset >= slot.beats) continue;
        const when  = t0 + ev.offset * bd;
        const frets = CHORDS[slot.chord];
        if (!frets) continue;
        const order = ev.dir === "down" ? [0,1,2,3,4,5] : [5,4,3,2,1,0];
        order.forEach((s, i) => {
          if (frets[s] < 0) return;
          pluck(midiToFreq(OPEN_MIDI[s] + frets[s]), ctx, ev.vol * volRef.current, when + i * 0.012);
        });
      }

      nextTimeRef.current = t0 + slot.beats * bd;
      nextSlotRef.current++;
    }
  };

  // ── RAF visual sync ──────────────────────────────────────────────────────────
  rafCbRef.current = () => {
    const ctx = ctxRef.current;
    if (!ctx || !isPlayRef.current) { rafRef.current = null; return; }
    const now = ctx.currentTime;
    let found = -1;
    for (let i = beatTL.current.length - 1; i >= 0; i--) {
      if (beatTL.current[i].t <= now) { found = beatTL.current[i].i; break; }
    }
    setCurrentIdx(found);
    rafRef.current = requestAnimationFrame(() => rafCbRef.current());
  };

  // ── start ────────────────────────────────────────────────────────────────────
  function start() {
    if (seqRef.current.length === 0) return;
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    nextTimeRef.current = ctx.currentTime + 0.1;
    nextSlotRef.current = 0;
    beatTL.current = [];
    isPlayRef.current = true;
    setIsPlaying(true);
    tickRef.current();
    timerRef.current = setInterval(() => tickRef.current(), 50);
    rafRef.current = requestAnimationFrame(() => rafCbRef.current());
  }
  startRef.current = start;

  // Cleanup on unmount
  useEffect(() => () => stopRef.current(), []);

  // Spacebar shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as Element)?.tagName;
      if (e.code === "Space" && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
        e.preventDefault();
        if (isPlayRef.current) stopRef.current(); else startRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Sequence helpers ─────────────────────────────────────────────────────────
  const addChord   = (chord: string) => setSequence(p => [...p, { id: uid(), chord, beats: 4 }]);
  const removeSlot = (id: string)    => setSequence(p => {
    const n = p.filter(s => s.id !== id);
    if (n.length === 0) stopRef.current();
    return n;
  });
  const cycleBeats = (id: string) => setSequence(p =>
    p.map(s => s.id === id ? { ...s, beats: (s.beats % 4) + 1 } : s)
  );
  const loadPreset = (chords: string[]) => { stopRef.current(); setSequence(makeSlots(chords)); };
  const clear      = () => { stopRef.current(); setSequence([]); };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music2 className="w-6 h-6 text-purple-400" />
          Đệm hợp âm trực tuyến
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Tạo chuỗi hợp âm và nghe đệm guitar tự động
        </p>
      </div>

      {/* ── Transport ── */}
      <div className="bg-gray-900 rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-3">

        {/* Play / Stop */}
        <button
          onClick={() => isPlaying ? stop() : start()}
          disabled={sequence.length === 0}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40",
            isPlaying ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white",
          )}
        >
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Dừng" : "Phát"}
        </button>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 w-8 shrink-0">BPM</span>
          <input
            type="range" min={40} max={200} value={bpm}
            onChange={e => setBpm(+e.target.value)}
            className="w-28 accent-purple-500"
          />
          <span className="font-mono text-sm text-white w-8">{bpm}</span>
        </div>

        {/* Pattern */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 shrink-0">Điệu</span>
          <select
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {Object.entries(PATTERNS).map(([k, p]) => (
              <option key={k} value={k}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="range" min={0} max={1} step={0.05} value={volume}
            onChange={e => setVolume(+e.target.value)}
            className="w-20 accent-purple-500"
          />
        </div>

        {/* Loop toggle */}
        <button
          onClick={() => setLoop(!loop)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
            loop
              ? "border-purple-500 bg-purple-900/30 text-purple-300"
              : "border-gray-700 text-gray-400 hover:border-gray-600",
          )}
        >
          Lặp lại
        </button>

        {/* Clear */}
        <button
          onClick={clear}
          title="Xóa tất cả"
          className="ml-auto p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Chord Sequence ── */}
      <div className="bg-gray-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Chuỗi hợp âm</h2>
          {sequence.length > 0 && (
            <span className="text-xs text-gray-500">
              {sequence.length} hợp âm · click số phách để thay đổi
            </span>
          )}
        </div>

        {sequence.length === 0 ? (
          <p className="py-10 text-center text-gray-500 text-sm">
            Chọn hợp âm từ bảng bên dưới để bắt đầu
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sequence.map((slot, idx) => (
              <div
                key={slot.id}
                className={cn(
                  "relative group flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl border-2 transition-all duration-150 select-none",
                  idx === currentIdx
                    ? "border-purple-500 bg-purple-900/40 shadow-lg shadow-purple-900/30 scale-105"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600",
                )}
              >
                <span className={cn(
                  "text-base font-bold leading-tight",
                  idx === currentIdx ? "text-purple-200" : "text-white",
                )}>
                  {slot.chord}
                </span>
                <button
                  onClick={() => cycleBeats(slot.id)}
                  title="Click để thay đổi số phách"
                  className={cn(
                    "text-[11px] px-1.5 rounded mt-0.5 transition-colors",
                    idx === currentIdx
                      ? "text-purple-400 hover:bg-purple-800/40"
                      : "text-gray-500 hover:text-gray-300 hover:bg-gray-700",
                  )}
                >
                  {slot.beats}♩
                </button>
                <button
                  onClick={() => removeSlot(slot.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <span className="text-[10px] text-white leading-none font-bold">×</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Chord Picker ── */}
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Thêm hợp âm</h2>
        <div className="space-y-2.5">
          {CHORD_GROUPS.map(g => (
            <div key={g.label} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 w-12 shrink-0">{g.label}</span>
              {g.names.map(name => (
                <button
                  key={name}
                  onClick={() => addChord(name)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-gray-800 hover:bg-purple-700/70 text-gray-200 hover:text-white border-gray-700 hover:border-purple-600 transition-all"
                >
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Preset Progressions ── */}
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Tiến trình phổ biến</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(pr => (
            <button
              key={pr.label}
              onClick={() => loadPreset(pr.chords)}
              className="flex flex-col items-start px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-600/50 transition-all text-left"
            >
              <span className="text-xs font-semibold text-purple-400">{pr.label}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">{pr.chords.join(" – ")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-600 pb-4">
        Nhấn{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-[11px]">Space</kbd>
        {" "}để phát / dừng
      </p>
    </div>
  );
}
