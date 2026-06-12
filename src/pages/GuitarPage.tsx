import { useState, useCallback, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Eye,
  EyeOff,
  RotateCcw,
  Music,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "../utils";

// ─── Music theory ────────────────────────────────────────────────────────────

const NOTE_VI = [
  "Đô",
  "Đô♯",
  "Rê",
  "Rê♯",
  "Mi",
  "Fa",
  "Fa♯",
  "Sol",
  "Sol♯",
  "La",
  "La♯",
  "Si",
];
const NOTE_EN = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/** MIDI note for each open string (low E → high e, index 0 → 5) */
const OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const OPEN_LABELS_VI = ["Mi", "La", "Rê", "Sol", "Si", "Mi"];
const OPEN_LABELS_EN = ["E2", "A2", "D3", "G3", "B3", "E4"];

/** Visual string thickness (index 0 = low E, thickest) */
const STRING_THICKNESS = [3.0, 2.4, 1.8, 1.3, 0.9, 0.6];

const NUM_FRETS = 14; // display frets 1 – 14
const FRET_DOTS = new Set([3, 5, 7, 9, 12]);
const DOUBLE_DOT_FRET = 12;

function noteClass(midi: number) {
  return ((midi % 12) + 12) % 12;
}
function getNoteName(midi: number, vi: boolean) {
  return vi ? NOTE_VI[noteClass(midi)] : NOTE_EN[noteClass(midi)];
}
function isSharpNote(midi: number) {
  return NOTE_EN[noteClass(midi)].includes("#");
}
function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ─── Karplus-Strong plucked string synthesis ─────────────────────────────────

function pluck(freq: number, ctx: AudioContext) {
  const sr = ctx.sampleRate;
  const p = Math.round(sr / freq);
  const n = Math.ceil(2.5 * sr);

  const buf = ctx.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);

  // Seed with white noise
  for (let i = 0; i < p; i++) d[i] = Math.random() * 2 - 1;

  // Karplus-Strong averaging filter
  for (let i = p; i < n; i++) {
    d[i] = 0.4975 * (d[i - p] + (i > p ? d[i - p - 1] : 0));
  }

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const gain = ctx.createGain();
  gain.gain.value = 0.75;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// ─── Pitch detection (Normalised Square Difference – McLeod Pitch Method) ─────

function autoCorrelate(
  buf: Float32Array<ArrayBuffer>,
  sampleRate: number,
): number {
  const n = buf.length;

  // Silence gate
  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += buf[i] * buf[i];
  if (Math.sqrt(sumSq / n) < 0.012) return -1;

  // Guitar range: ~60 Hz → ~700 Hz
  const minLag = Math.floor(sampleRate / 700);
  const maxLag = Math.floor(sampleRate / 60);

  // NSDF: r'[τ] = 2·Σx[i]x[i+τ] / Σ(x[i]²+x[i+τ]²)
  const nsdf = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let ac = 0,
      m = 0;
    const len = n - lag;
    for (let i = 0; i < len; i++) {
      ac += buf[i] * buf[i + lag];
      m += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
    }
    nsdf[lag] = m > 1e-8 ? (2 * ac) / m : 0;
  }

  // Skip initial positive zone, then find highest peak after first negative crossing
  let d = minLag;
  while (d < maxLag && nsdf[d] > 0) d++;
  while (d < maxLag && nsdf[d] < 0) d++;

  let bestVal = 0,
    bestLag = -1;
  for (let lag = d; lag <= maxLag; lag++) {
    if (nsdf[lag] > bestVal) {
      bestVal = nsdf[lag];
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestVal < 0.4) return -1; // low confidence

  // Parabolic sub-sample interpolation
  if (bestLag > minLag && bestLag < maxLag) {
    const c0 = nsdf[bestLag - 1],
      c1 = nsdf[bestLag],
      c2 = nsdf[bestLag + 1];
    const denom = 2 * c1 - c2 - c0;
    if (denom !== 0) return sampleRate / (bestLag + (c2 - c0) / (2 * denom));
  }
  return sampleRate / bestLag;
}

// ─── Chord presets ────────────────────────────────────────────────────────────
// Array index = string (0 = low E, 5 = high e); value = fret (-1 = muted)

const CHORDS: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  Cm: [-1, 3, 5, 5, 4, 3],
  C7: [-1, 3, 2, 3, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  Dm: [-1, -1, 0, 2, 3, 1],
  D7: [-1, -1, 0, 2, 1, 2],
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  E7: [0, 2, 0, 1, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  Fm: [1, 3, 3, 1, 1, 1],
  G: [3, 2, 0, 0, 0, 3],
  Gm: [3, 5, 5, 3, 3, 3],
  G7: [3, 2, 0, 0, 0, 1],
  A: [-1, 0, 2, 2, 2, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  A7: [-1, 0, 2, 0, 2, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  B: [-1, 2, 4, 4, 4, 2],
  Bm: [-1, 2, 4, 4, 3, 2],
  B7: [-1, 2, 1, 2, 0, 2],
  Dm7: [-1, -1, 0, 2, 1, 1],
  "F#m": [2, 4, 4, 2, 2, 2],
  Bb: [-1, 1, 3, 3, 3, 1],
  "B°": [-1, 2, 3, 4, 3, -1],
  "E°": [0, 1, 2, 0, -1, -1],
  "F#°": [-1, -1, 4, 5, 4, 5],
};

const CANON_PROGRESSIONS = [
  { key: "Am", chords: ["Am", "Dm", "G", "C", "F", "B°", "E7", "Am"] },
  { key: "C",  chords: ["C", "F", "B°", "Em", "Am", "Dm", "G7", "C"] },
  { key: "G",  chords: ["G", "C", "F#°", "Bm", "Em", "Am", "D7", "G"] },
  { key: "Em", chords: ["Em", "Am", "D", "G", "C", "F#°", "B7", "Em"] },
  { key: "F",  chords: ["F", "Bb", "E°", "Am", "Dm", "Gm", "C7", "F"] },
  { key: "Dm", chords: ["Dm", "Gm", "C", "F", "Bb", "E°", "A7", "Dm"] },
];

const CHORD_GROUPS = [
  { label: "Trưởng", names: ["C", "D", "E", "F", "G", "A", "B"] },
  { label: "Thứ", names: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"] },
  { label: "7", names: ["C7", "D7", "E7", "G7", "A7", "B7", "Am7", "Dm7"] },
  { label: "Canon", names: [] },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type MarkedKey = string; // `${stringIdx}-${fret}`
const mk = (s: number, f: number): MarkedKey => `${s}-${f}`;

// ─── Sub-component: single fret cell ─────────────────────────────────────────

interface CellProps {
  midi: number;
  isMarked: boolean;
  showNames: boolean;
  vi: boolean;
  thickness: number;
  isOpen: boolean;
  isWound: boolean;
  onClick: () => void;
}

function FretCell({
  midi,
  isMarked,
  showNames,
  vi,
  thickness,
  isOpen,
  isWound,
  onClick,
}: CellProps) {
  const name = getNoteName(midi, vi);
  const nameEn = NOTE_EN[noteClass(midi)]; // always-English short name for marked dots
  const sharp = isSharpNote(midi);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        isOpen ? "w-10 flex-shrink-0 h-10" : "flex-1 h-10",
      )}
    >
      {/* String line */}
      <div
        className={cn(
          "absolute left-0 right-0 pointer-events-none",
          isWound ? "bg-amber-600/55" : "bg-gray-400/45",
        )}
        style={{
          height: `${thickness}px`,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      {/* Fret wire (not on open-string column) */}
      {!isOpen && (
        <div className="absolute left-0 inset-y-0 w-px bg-gray-500/50 pointer-events-none" />
      )}

      {isMarked ? (
        <button
          onClick={onClick}
          className="relative z-10 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all shadow-lg shadow-purple-900/60 border border-purple-400/60 focus:outline-none"
          aria-label={`Bỏ đánh dấu ${name}`}
        >
          <span className="text-[10px] font-extrabold text-white leading-none select-none">
            {nameEn}
          </span>
        </button>
      ) : (
        <button
          onClick={onClick}
          className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-purple-700/30 group focus:outline-none"
          aria-label={`Đánh dấu ${name}`}
        >
          {showNames && (
            <span
              className={cn(
                "text-[8px] font-medium pointer-events-none select-none transition-colors",
                sharp
                  ? "text-pink-400/70 group-hover:text-pink-300"
                  : "text-gray-500 group-hover:text-gray-300",
              )}
            >
              {name}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuitarPage() {
  const [marked, setMarked] = useState<Set<MarkedKey>>(new Set());
  const [showNames, setShowNames] = useState(false);
  const [useVi, setUseVi] = useState(true);
  const [muted, setMuted] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [activeChordGroup, setActiveChordGroup] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastNote, setLastNote] = useState<{
    vi: string;
    en: string;
    midi: number;
    si: number;
    fret: number;
  } | null>(null);

  // ── Tuner state ──────────────────────────────────────────────────────────────
  const [tunerOpen, setTunerOpen] = useState(false);
  const [tunerActive, setTunerActive] = useState(false);
  const [tunerFreq, setTunerFreq] = useState(0);
  const [tunerMidi, setTunerMidi] = useState(-1);
  const [tunerVolume, setTunerVolume] = useState(0);

  const tunerCtxRef = useRef<AudioContext | null>(null);
  const tunerAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const tunerRafRef = useRef<number>(0);
  const tunerBufRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const tunerLastTsRef = useRef<number>(0);

  const audioRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playNote = useCallback(
    (si: number, fret: number) => {
      if (muted) return;
      pluck(midiToFreq(OPEN_MIDI[si] + fret), getCtx());
    },
    [muted, getCtx],
  );

  function toggleMark(si: number, fret: number) {
    const k = mk(si, fret);
    const midi = OPEN_MIDI[si] + fret;
    setMarked((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
    setLastNote({
      vi: getNoteName(midi, true),
      en: getNoteName(midi, false),
      midi,
      si,
      fret,
    });
    playNote(si, fret);
    setActiveChord(null);
  }

  function clearAll() {
    setMarked(new Set());
    setActiveChord(null);
  }

  function playAll() {
    if (muted || marked.size === 0) return;
    const ctx = getCtx();
    [...marked]
      .map((k) => {
        const [s, f] = k.split("-").map(Number);
        return { s, f, midi: OPEN_MIDI[s] + f };
      })
      .sort((a, b) => a.midi - b.midi)
      .forEach(({ s, f }, i) =>
        setTimeout(() => pluck(midiToFreq(OPEN_MIDI[s] + f), ctx), i * 60),
      );
  }

  function selectChord(name: string) {
    const frets = CHORDS[name];
    if (!frets) return;
    const next = new Set<MarkedKey>();
    frets.forEach((f, si) => {
      if (f >= 0) next.add(mk(si, f));
    });
    setMarked(next);
    setActiveChord(name);
    if (!muted) {
      const ctx = getCtx();
      frets.forEach((f, si) => {
        if (f >= 0)
          setTimeout(() => pluck(midiToFreq(OPEN_MIDI[si] + f), ctx), si * 55);
      });
    }
  }

  // ── Tuner functions ──────────────────────────────────────────────────────────
  function runTunerLoop(ts: DOMHighResTimeStamp) {
    const analyser = tunerAnalyserRef.current;
    const buf = tunerBufRef.current;
    const ctx = tunerCtxRef.current;
    if (!analyser || !buf || !ctx) return;

    // Throttle to ~20 fps
    if (ts - tunerLastTsRef.current >= 50) {
      tunerLastTsRef.current = ts;
      analyser.getFloatTimeDomainData(buf);

      // Volume level
      let sq = 0;
      for (let i = 0; i < buf.length; i++) sq += buf[i] * buf[i];
      const rms = Math.sqrt(sq / buf.length);
      setTunerVolume(Math.min(1, rms * 6));

      // Pitch
      const freq = autoCorrelate(buf, ctx.sampleRate);
      if (freq > 0) {
        setTunerFreq(freq);
        setTunerMidi(12 * Math.log2(freq / 440) + 69);
      } else if (rms < 0.01) {
        setTunerFreq(0);
        setTunerMidi(-1);
      }
    }
    tunerRafRef.current = requestAnimationFrame(runTunerLoop);
  }

  async function startTuner() {
    try {
      // iOS Safari requires getUserMedia before creating AudioContext
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      micStreamRef.current = stream;

      // webkitAudioContext fallback for older iOS Safari
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      // iOS suspends AudioContext until resumed inside a user gesture
      if (ctx.state === "suspended") await ctx.resume();
      tunerCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      tunerAnalyserRef.current = analyser;
      tunerBufRef.current = new Float32Array(analyser.fftSize);

      ctx.createMediaStreamSource(stream).connect(analyser);
      setTunerActive(true);
      tunerRafRef.current = requestAnimationFrame(runTunerLoop);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Quyền truy cập microphone bị từ chối. Vui lòng cho phép micro trong cài đặt trình duyệt."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "Không tìm thấy microphone trên thiết bị này."
            : "Không thể truy cập microphone. Vui lòng cho phép quyền truy cập micro trong trình duyệt.";
      alert(msg);
    }
  }

  function stopTuner() {
    cancelAnimationFrame(tunerRafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    tunerCtxRef.current?.close();
    tunerCtxRef.current = null;
    tunerAnalyserRef.current = null;
    setTunerActive(false);
    setTunerFreq(0);
    setTunerMidi(-1);
    setTunerVolume(0);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(tunerRafRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      tunerCtxRef.current?.close();
    };
  }, []);

  // Keyboard: 1-6 → open strum string 1-6
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const si = parseInt(e.key) - 1;
      if (si >= 0 && si < 6) playNote(si, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playNote]);

  // Display order: high e (idx 5) at top → low E (idx 0) at bottom
  const displayOrder = [5, 4, 3, 2, 1, 0];

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-36 sm:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/50 flex-shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-none">
                Guitar Online
              </h1>
              <p className="text-gray-500 text-[11px] mt-0.5 hidden sm:block">
                {"Nhấn vào cần đàn để phát âm · Phím 1–6 để gảy dây mở"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMuted((v) => !v)}
            className={cn(
              "sm:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
              muted
                ? "bg-red-900/50 text-red-400"
                : "bg-gray-800 text-gray-400 hover:text-white",
            )}
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Desktop controls bar */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => setShowNames((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              showNames
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700",
            )}
          >
            {showNames ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {"Hiển thị nốt"}
          </button>
          <button
            onClick={() => setUseVi((v) => !v)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
          >
            {useVi ? "Tiếng Việt" : "English"}
          </button>
          <button
            onClick={playAll}
            disabled={marked.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-4 h-4" />
            {"Chơi"}
            {marked.size > 0 ? " (" + String(marked.size) + ")" : ""}
          </button>
          <button
            onClick={clearAll}
            disabled={marked.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-red-900/40 hover:text-red-400 hover:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {"Xóa"}
          </button>
          <button
            onClick={() => setTunerOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              tunerOpen
                ? "bg-cyan-800/50 border-cyan-600/60 text-cyan-300"
                : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700",
            )}
          >
            <Mic className="w-4 h-4" />
            {"Chỉnh dây"}
          </button>
          <button
            onClick={() => setMuted((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ml-auto border",
              muted
                ? "bg-red-900/40 border-red-800/60 text-red-400"
                : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700",
            )}
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Note display panel */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 overflow-hidden">
          {lastNote ? (
            <div className="px-4 sm:px-5 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-center min-w-[40px]">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white leading-none tracking-tight">
                      {lastNote.en}
                    </span>
                    <span className="text-purple-400 text-sm font-semibold mt-0.5">
                      {lastNote.vi}
                    </span>
                  </div>
                  <div className="h-10 w-px bg-gray-700 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-xs">
                      {"Dây"}{" "}
                      <span className="font-bold text-white">
                        {useVi
                          ? OPEN_LABELS_VI[lastNote.si]
                          : OPEN_LABELS_EN[lastNote.si]}
                      </span>
                    </span>
                    <span className="text-gray-400 text-xs">
                      {"Phím"}{" "}
                      <span className="font-bold text-white">
                        {lastNote.fret}
                      </span>
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      MIDI {lastNote.midi}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-wrap gap-1 ml-auto">
                  {NOTE_EN.map((n, i) => (
                    <div
                      key={n}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-semibold select-none transition-colors",
                        i === noteClass(lastNote.midi)
                          ? "bg-purple-600 text-white shadow shadow-purple-900/60 ring-2 ring-purple-400/50"
                          : n.includes("#")
                            ? "bg-gray-800 text-gray-600"
                            : "bg-gray-800/60 text-gray-500",
                      )}
                    >
                      {useVi ? NOTE_VI[i] : n}
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile chromatic keyboard */}
              <div className="flex sm:hidden gap-1 mt-2.5">
                {NOTE_EN.map((n, i) => (
                  <div
                    key={n}
                    className={cn(
                      "flex-1 h-7 rounded-md flex items-center justify-center text-[8px] font-semibold select-none transition-colors",
                      i === noteClass(lastNote.midi)
                        ? "bg-purple-600 text-white ring-1 ring-purple-400/60"
                        : n.includes("#")
                          ? "bg-gray-800 text-gray-600"
                          : "bg-gray-800/60 text-gray-500",
                    )}
                  >
                    {useVi ? NOTE_VI[i] : n}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-gray-600 text-sm select-none">
              {"Nhấn vào cần đàn để xem thông tin nốt nhạc"}
            </div>
          )}
        </div>

        {/* Tuner panel */}
        {tunerOpen && (
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2 text-sm">
                {tunerActive ? (
                  <span className="flex items-center gap-2 text-green-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {"Đang nghe..."}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    {"Microphone chưa kích hoạt"}
                  </span>
                )}
              </div>
              <button
                onClick={tunerActive ? stopTuner : startTuner}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
                  tunerActive
                    ? "bg-red-900/40 border border-red-800/60 text-red-400 hover:bg-red-900/60"
                    : "bg-purple-700 text-white hover:bg-purple-600",
                )}
              >
                {tunerActive ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    {"Dừng"}
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    {"Bắt đầu"}
                  </>
                )}
              </button>
            </div>
            <div className="px-4 sm:px-5 py-5">
              {tunerFreq > 0 ? (
                (() => {
                  const roundedMidi = Math.round(tunerMidi);
                  const cents = (tunerMidi - roundedMidi) * 100;
                  const inTune = Math.abs(cents) <= 5;
                  const close = Math.abs(cents) <= 20;
                  const nc = ((roundedMidi % 12) + 12) % 12;
                  const noteEn = NOTE_EN[nc];
                  const noteVi = NOTE_VI[nc];
                  let targetSi = 0;
                  let bestDist = Infinity;
                  OPEN_MIDI.forEach((m, si) => {
                    const d = Math.abs(tunerMidi - m);
                    if (d < bestDist) {
                      bestDist = d;
                      targetSi = si;
                    }
                  });
                  const needlePos = Math.min(
                    Math.max((cents + 50) / 100, 0),
                    1,
                  );
                  const centsRounded = Math.round(cents);
                  const centsLabel =
                    centsRounded >= 0
                      ? "+" + centsRounded + " cents — Hơi cao"
                      : String(centsRounded) + " cents — Hơi thấp";
                  return (
                    <div className="flex flex-col items-center gap-5">
                      <div className="flex items-center gap-6 flex-wrap justify-center">
                        <div
                          className={cn(
                            "w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all",
                            inTune
                              ? "border-green-500 bg-green-900/20 shadow-lg shadow-green-900/30"
                              : close
                                ? "border-yellow-500 bg-yellow-900/15"
                                : "border-red-500/60 bg-red-900/10",
                          )}
                        >
                          <span className="text-3xl font-extrabold text-white leading-none">
                            {noteEn}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            {noteVi}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="text-gray-400">
                            {"Tần số: "}
                            <span className="text-white font-mono font-semibold">
                              {tunerFreq.toFixed(1)} Hz
                            </span>
                          </div>
                          <div className="text-gray-400">
                            {"Dây gần nhất: "}
                            <span className="text-purple-300 font-semibold">
                              {OPEN_LABELS_EN[targetSi]} {"—"}{" "}
                              {OPEN_LABELS_VI[targetSi]}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "font-semibold",
                              inTune
                                ? "text-green-400"
                                : close
                                  ? "text-yellow-400"
                                  : "text-red-400",
                            )}
                          >
                            {inTune ? "✓ Đúng chuẩn" : centsLabel}
                          </div>
                        </div>
                      </div>
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between text-[10px] text-gray-600 mb-1 px-1">
                          <span>{"♭ Thấp"}</span>
                          <span>{"Chuẩn"}</span>
                          <span>{"Cao ♯"}</span>
                        </div>
                        <div className="relative h-5 rounded-full overflow-hidden bg-gray-800">
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to right, #dc2626 0%, #fbbf24 28%, #16a34a 42%, #16a34a 58%, #fbbf24 72%, #dc2626 100%)",
                            }}
                          />
                          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/50" />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md border-2 border-gray-500 transition-[left] duration-75"
                            style={{
                              left:
                                "calc(" + String(needlePos * 100) + "% - 10px)",
                            }}
                          />
                        </div>
                        <div className="text-center text-[10px] text-gray-500 mt-1.5">
                          {centsRounded >= 0
                            ? "+" + String(centsRounded)
                            : String(centsRounded)}{" "}
                          cents
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        {[5, 4, 3, 2, 1, 0].map((si) => (
                          <div
                            key={si}
                            className={cn(
                              "flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all",
                              si === targetSi
                                ? "bg-purple-600/80 text-white shadow shadow-purple-900/40"
                                : "bg-gray-800/50 text-gray-600",
                            )}
                          >
                            <span className="font-bold text-[11px]">
                              {OPEN_LABELS_EN[si]}
                            </span>
                            <span className="text-[9px] opacity-70">
                              {OPEN_LABELS_VI[si]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center gap-3 py-3">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {tunerActive
                      ? "Đang chờ tín hiệu âm thanh từ micro..."
                      : "Nhấn Bắt đầu và cho phép truy cập microphone để chỉnh dây đàn"}
                  </p>
                </div>
              )}
            </div>
            {tunerActive && (
              <div className="px-4 sm:px-5 pb-4 flex items-center gap-2 text-xs text-gray-600">
                <Mic className="w-3 h-3 flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-75"
                    style={{ width: String(tunerVolume * 100) + "%" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active chord badge */}
        {activeChord && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-500 text-xs">{"Đang xem:"}</span>
            <span className="px-3 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-sm font-bold">
              {activeChord}
            </span>
          </div>
        )}

        {/* Fretboard */}
        <div className="relative rounded-2xl overflow-hidden mb-5 border border-amber-900/30 shadow-2xl shadow-black/50">
          <div className="bg-[#1a1005] px-2 sm:px-5 py-3 sm:py-5 overflow-x-auto scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="min-w-[600px]">
              <div className="flex items-center mb-1 select-none">
                <div className="w-11 sm:w-14 flex-shrink-0" />
                <div className="w-10 flex-shrink-0 text-center text-[10px] text-amber-400/90 font-mono">
                  0
                </div>
                <div className="w-3 flex-shrink-0" />
                {Array.from({ length: NUM_FRETS }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-[10px] text-amber-400/90 font-mono"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {displayOrder.map((si) => {
                const openMidi = OPEN_MIDI[si];
                const isWound = si <= 2;
                return (
                  <div key={si} className="flex items-center">
                    <div className="w-11 sm:w-14 flex-shrink-0 flex items-center justify-end pr-2 sm:pr-3 select-none">
                      <span
                        className={cn(
                          "text-xs font-mono font-semibold",
                          isWound ? "text-amber-400/80" : "text-amber-200/70",
                        )}
                      >
                        {useVi ? OPEN_LABELS_VI[si] : OPEN_LABELS_EN[si]}
                      </span>
                    </div>
                    <FretCell
                      midi={openMidi}
                      isMarked={marked.has(mk(si, 0))}
                      showNames={showNames}
                      vi={useVi}
                      thickness={STRING_THICKNESS[si]}
                      isOpen
                      isWound={isWound}
                      onClick={() => toggleMark(si, 0)}
                    />
                    <div className="w-3 flex-shrink-0 self-stretch bg-[#e8dcc0]/80 rounded-sm" />
                    {Array.from({ length: NUM_FRETS }, (_, fi) => {
                      const fret = fi + 1;
                      return (
                        <FretCell
                          key={fret}
                          midi={openMidi + fret}
                          isMarked={marked.has(mk(si, fret))}
                          showNames={showNames}
                          vi={useVi}
                          thickness={STRING_THICKNESS[si]}
                          isOpen={false}
                          isWound={isWound}
                          onClick={() => toggleMark(si, fret)}
                        />
                      );
                    })}
                  </div>
                );
              })}
              <div className="flex items-center mt-1 select-none">
                <div className="w-11 sm:w-14 flex-shrink-0" />
                <div className="w-10 flex-shrink-0" />
                <div className="w-3 flex-shrink-0" />
                {Array.from({ length: NUM_FRETS }, (_, i) => {
                  const f = i + 1;
                  return (
                    <div
                      key={f}
                      className="flex-1 flex items-center justify-center py-1.5"
                    >
                      {FRET_DOTS.has(f) && (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                          {f === DOUBLE_DOT_FRET && (
                            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile scroll-right hint */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/60 to-transparent pointer-events-none sm:hidden rounded-r-2xl" />
        </div>

        {/* Chord library (tabbed) */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 overflow-hidden">
          <div className="flex border-b border-gray-800">
            {CHORD_GROUPS.map((group, idx) => (
              <button
                key={group.label}
                onClick={() => setActiveChordGroup(idx)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-semibold transition-all active:bg-gray-800/40",
                  activeChordGroup === idx
                    ? "text-white border-b-2 border-purple-500 bg-purple-600/10"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40",
                )}
              >
                {group.label === "7" ? "Hợp âm 7" : group.label === "Canon" ? "Canon" : "Hợp âm " + group.label}
              </button>
            ))}
          </div>
          <div className="p-3 sm:p-4">
            {CHORD_GROUPS[activeChordGroup].label === "Canon" ? (
              <div className="flex flex-col gap-2.5">
                {CANON_PROGRESSIONS.map(({ key, chords }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-9 flex-shrink-0 text-right pr-1">
                      {key}
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {chords.filter((n) => CHORDS[n]).map((name, i) => (
                        <button
                          key={`${key}-${i}`}
                          onClick={() => selectChord(name)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 whitespace-nowrap flex-shrink-0 min-w-[40px] text-center",
                            activeChord === name
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-gray-500",
                          )}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {CHORD_GROUPS[activeChordGroup].names
                  .filter((n) => CHORDS[n])
                  .map((name) => (
                    <button
                      key={name}
                      onClick={() => selectChord(name)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 min-w-[52px] text-center",
                        activeChord === name
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-gray-500",
                      )}
                    >
                      {name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Open string reference */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 p-3 sm:p-4">
          <h2 className="text-sm font-bold text-gray-300 mb-2.5 flex items-center gap-2">
            {"Dây đàn chuẩn"}
            <span className="text-xs text-gray-600 font-normal">
              {"Nhấn để nghe"}
            </span>
          </h2>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map((si) => (
              <button
                key={si}
                onClick={() => playNote(si, 0)}
                className="flex flex-col items-center gap-1 py-3.5 rounded-xl bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600/60 transition-all active:scale-95 group"
              >
                <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {OPEN_LABELS_EN[si]}
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-purple-400/70 transition-colors">
                  {OPEN_LABELS_VI[si]}
                </span>
                <div
                  className={cn(
                    "w-3/4 rounded-full mt-0.5",
                    si <= 2 ? "bg-amber-600/50" : "bg-gray-400/30",
                  )}
                  style={{ height: String(STRING_THICKNESS[si]) + "px" }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Instructions (collapsible) */}
        <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden mb-4">
          <button
            onClick={() => setShowInstructions((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>{"Hướng dẫn sử dụng"}</span>
            <span
              className={cn(
                "text-gray-600 transition-transform duration-200",
                showInstructions ? "rotate-180" : "",
              )}
            >
              {"▾"}
            </span>
          </button>
          {showInstructions && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-8 text-xs text-gray-500 border-t border-gray-800 pt-3">
              <div>
                {"• Nhấn vào ô trên cần đàn để phát âm và đánh dấu nốt"}
              </div>
              <div>{"• Nhấn lại nốt đã đánh dấu để bỏ đánh dấu"}</div>
              <div>{"• Bật Hiển thị nốt để xem tên tất cả các nốt"}</div>
              <div>{"• Chuyển đổi Tiếng Việt / English cho tên nốt nhạc"}</div>
              <div>{"• Chọn hợp âm để hiển thị vị trí ngón tay"}</div>
              <div>{"• Nhấn Chơi để phát tất cả nốt đã chọn"}</div>
              <div>{"• Phím số 1 → 6 để gảy dây mở từ dây trầm đến cao"}</div>
              <div>{"• Nhấn dây đàn chuẩn để nghe cao độ tham chiếu"}</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom toolbar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800/80"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch divide-x divide-gray-800/60">
          <button
            onClick={() => setShowNames((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
              showNames
                ? "text-purple-400 bg-purple-900/20"
                : "text-gray-500 active:bg-gray-800/60",
            )}
          >
            {showNames ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
            <span className="text-[9px] font-medium">{"Nốt"}</span>
          </button>
          <button
            onClick={() => setUseVi((v) => !v)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-gray-500 active:bg-gray-800/60 transition-all"
          >
            <span className="text-sm font-bold leading-none">
              {useVi ? "Vi" : "En"}
            </span>
            <span className="text-[9px] font-medium mt-0.5">{"Ngôn ngữ"}</span>
          </button>
          <button
            onClick={playAll}
            disabled={marked.size === 0}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
              marked.size > 0
                ? "text-green-400 active:bg-green-900/20"
                : "text-gray-700",
            )}
          >
            <Play className="w-5 h-5" />
            <span className="text-[9px] font-medium">
              {marked.size > 0 ? "Chơi (" + String(marked.size) + ")" : "Chơi"}
            </span>
          </button>
          <button
            onClick={clearAll}
            disabled={marked.size === 0}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
              marked.size > 0
                ? "text-red-400 active:bg-red-900/20"
                : "text-gray-700",
            )}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-medium">{"Xóa"}</span>
          </button>
          <button
            onClick={() => setTunerOpen((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
              tunerOpen
                ? "text-cyan-400 bg-cyan-900/20"
                : "text-gray-500 active:bg-gray-800/60",
            )}
          >
            <Mic className="w-5 h-5" />
            <span className="text-[9px] font-medium">Tuner</span>
          </button>
          <button
            onClick={() => setMuted((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
              muted
                ? "text-red-400 bg-red-900/20"
                : "text-gray-500 active:bg-gray-800/60",
            )}
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span className="text-[9px] font-medium">{"Âm thanh"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
