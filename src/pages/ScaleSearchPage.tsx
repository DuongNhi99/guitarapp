import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Play, Square } from "lucide-react";
import {
  NOTE_VI, NOTE_EN, SCALES, OPEN_MIDI, STRING_THICKNESS,
  OPEN_LABELS_VI, OPEN_LABELS_EN, noteClass, midiToFreq, getNoteName,
} from "../utils/guitarConstants";
import type { MarkedKey } from "../utils/guitarConstants";
import { pluck } from "../utils/guitarAudio";
import Fretboard from "../components/guitar/Fretboard";
import { cn } from "../utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEGREE_NAMES = ["I", "II", "III", "IV", "V", "VI", "VII"];

const DIATONIC_QUALITIES: Record<string, string[]> = {
  major:         ["", "m", "m", "", "", "m", "°"],
  natural_minor: ["m", "°", "", "m", "m", "", ""],
};

const WHITE_NOTE_CLASSES = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_OFFSETS = [
  { afterWhite: 0, nc: 1 },
  { afterWhite: 1, nc: 3 },
  { afterWhite: 3, nc: 6 },
  { afterWhite: 4, nc: 8 },
  { afterWhite: 5, nc: 10 },
];

const EMPTY_MARKED = new Set<MarkedKey>();

// Guitar position sections
const SECTIONS = [
  { label: "Thế tay 1", start: 0, end: 4 },
  { label: "Thế tay 2", start: 5, end: 9 },
  { label: "Thế tay 3", start: 10, end: 13 },
];

const DISPLAY_ORDER = [5, 4, 3, 2, 1, 0]; // high E → low E (top → bottom)
const INLAY_FRETS = new Set([3, 5, 7, 9, 12]);
const DOUBLE_DOT = 12;
const MID_STRING_IDX = 2; // display index for G string (where single inlay dots appear)
const DOUBLE_TOP_IDX = 1;
const DOUBLE_BOT_IDX = 3;

// ─── Piano Keyboard ──────────────────────────────────────────────────────────

function PianoKeyboard({
  rootNote,
  scaleNoteClasses,
  useVi,
}: {
  rootNote: number;
  scaleNoteClasses: Set<number>;
  useVi: boolean;
}) {
  const octaves = 2;
  const wkw = 44;
  const wkh = 130;
  const bkw = 26;
  const bkh = 80;
  const totalWK = 7 * octaves;
  const totalWidth = wkw * totalWK;
  const noteNames = useVi ? NOTE_VI : NOTE_EN;

  const whiteKeys = Array.from({ length: totalWK }, (_, i) => ({
    i,
    nc: WHITE_NOTE_CLASSES[i % 7],
  }));

  const blackKeys: { x: number; nc: number }[] = [];
  for (let oct = 0; oct < octaves; oct++) {
    BLACK_KEY_OFFSETS.forEach(({ afterWhite, nc }) => {
      blackKeys.push({ x: (oct * 7 + afterWhite) * wkw + wkw - bkw / 2, nc });
    });
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ width: totalWidth, margin: "0 auto", minWidth: totalWidth }}>
        <svg width={totalWidth} height={wkh + 28} style={{ display: "block" }}>
          {whiteKeys.map(({ i, nc }) => {
            const isRoot = nc === rootNote;
            const isScale = scaleNoteClasses.has(nc);
            const fill = isRoot ? "#10b981" : isScale ? "#a7f3d0" : "#f9fafb";
            const textColor = isRoot ? "#fff" : "#065f46";
            return (
              <g key={`w${i}`}>
                <rect
                  x={i * wkw}
                  y={0}
                  width={wkw - 2}
                  height={wkh}
                  rx={4}
                  fill={fill}
                  stroke={isRoot ? "#059669" : "#d1d5db"}
                  strokeWidth={1.5}
                />
                {(isRoot || isScale) && (
                  <text
                    x={i * wkw + (wkw - 2) / 2}
                    y={wkh - 10}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {noteNames[nc]}
                  </text>
                )}
              </g>
            );
          })}
          {blackKeys.map(({ x, nc }, i) => {
            const isRoot = nc === rootNote;
            const isScale = scaleNoteClasses.has(nc);
            const fill = isRoot ? "#059669" : isScale ? "#065f46" : "#111827";
            return (
              <g key={`b${i}`}>
                <rect
                  x={x}
                  y={0}
                  width={bkw}
                  height={bkh}
                  rx={3}
                  fill={fill}
                  stroke="#030712"
                  strokeWidth={1}
                />
                {(isRoot || isScale) && (
                  <text
                    x={x + bkw / 2}
                    y={bkh - 7}
                    textAnchor="middle"
                    fill={isRoot ? "#fff" : "#6ee7b7"}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {noteNames[nc]}
                  </text>
                )}
              </g>
            );
          })}
          {Array.from({ length: octaves }, (_, oct) => (
            <text
              key={`oct${oct}`}
              x={oct * 7 * wkw + 2}
              y={wkh + 18}
              fill="#6b7280"
              fontSize="10"
              fontFamily="sans-serif"
            >
              C{oct + 4}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Guitar Section (mini fretboard for one position) ────────────────────────

function GuitarSection({
  label,
  start,
  end,
  rootNote,
  scaleNoteClasses,
  useVi,
}: {
  label: string;
  start: number;
  end: number;
  rootNote: number;
  scaleNoteClasses: Set<number>;
  useVi: boolean;
}) {
  const frets = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const isOpenSection = start === 0;

  return (
    <div
      className="rounded-xl overflow-hidden border border-amber-800/40 shadow-lg shadow-black/60 flex-1"
      style={{ minWidth: 0 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-amber-950/60 border-b border-amber-800/40">
        <span className="text-xs font-bold text-amber-300">{label}</span>
        <span className="text-[10px] text-amber-600 font-mono">
          {isOpenSection ? `Nut – ${end}` : `${start} – ${end}`}
        </span>
      </div>

      {/* Fretboard body */}
      <div
        style={{
          background: "linear-gradient(180deg,#2e1a08 0%,#1e0f04 35%,#271508 65%,#1e0f04 100%)",
        }}
      >
        {/* Fret number labels */}
        <div className="flex select-none px-1 pt-1">
          <div className="w-8 flex-shrink-0" />
          {isOpenSection && (
            <div className="w-8 flex-shrink-0 text-center text-[9px] text-amber-300 font-mono font-bold">
              0
            </div>
          )}
          {frets.filter((f) => f > 0).map((f) => (
            <div
              key={f}
              className={cn(
                "flex-1 text-center text-[9px] font-mono font-bold",
                INLAY_FRETS.has(f) ? "text-amber-300" : "text-amber-600/60",
              )}
            >
              {f}
            </div>
          ))}
        </div>

        {/* String rows */}
        {DISPLAY_ORDER.map((si, rowIdx) => {
          const openMidi = OPEN_MIDI[si];
          const isWound = si <= 2;
          const isSingleDot = rowIdx === MID_STRING_IDX;
          const isDoubleTop = rowIdx === DOUBLE_TOP_IDX;
          const isDoubleBot = rowIdx === DOUBLE_BOT_IDX;

          return (
            <div
              key={si}
              className={cn(
                "flex items-center",
                rowIdx % 2 === 0 ? "bg-white/[0.03]" : "bg-black/[0.06]",
              )}
            >
              {/* String label */}
              <div className="w-8 flex-shrink-0 flex items-center justify-end pr-1 select-none">
                <span className={cn(
                  "text-[9px] font-mono font-bold",
                  isWound ? "text-amber-400" : "text-amber-200/70",
                )}>
                  {useVi ? OPEN_LABELS_VI[si] : OPEN_LABELS_EN[si]}
                </span>
              </div>

              {/* Open string cell (section 1 only) */}
              {isOpenSection && (() => {
                const midi = openMidi;
                const nc = noteClass(midi);
                const status = nc === rootNote ? "root" : scaleNoteClasses.has(nc) ? "note" : null;
                return (
                  <div className="w-8 flex-shrink-0 h-10 flex items-center justify-center relative">
                    {/* String line */}
                    <div
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{
                        height: `${Math.max(STRING_THICKNESS[si], 1)}px`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: isWound
                          ? "linear-gradient(to bottom,rgba(70,48,8,.8),rgba(188,138,42,.96),rgba(215,170,60,1),rgba(188,138,42,.96),rgba(70,48,8,.8))"
                          : "linear-gradient(to bottom,rgba(55,55,75,.72),rgba(178,178,200,.94),rgba(205,205,225,1),rgba(178,178,200,.94),rgba(55,55,75,.72))",
                      }}
                    />
                    {status && (
                      <div className={cn(
                        "relative z-10 rounded-full flex items-center justify-center font-black text-white leading-none",
                        status === "root"
                          ? "w-7 h-7 bg-amber-500 border-2 border-amber-200/80 text-[9px]"
                          : "w-5 h-5 bg-teal-500 border border-teal-200/70 text-[8px]",
                      )}
                        style={status === "root"
                          ? { boxShadow: "0 0 0 2px rgba(251,191,36,.32),0 0 10px rgba(251,191,36,.55)" }
                          : { boxShadow: "0 0 6px rgba(20,184,166,.4)" }}
                      >
                        {getNoteName(midi, useVi)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Nut divider */}
              {isOpenSection && (
                <div
                  className="w-[5px] flex-shrink-0 self-stretch"
                  style={{ background: "#c8b870", boxShadow: "inset -1px 0 2px rgba(0,0,0,.5),inset 1px 0 1px rgba(255,240,160,.3)" }}
                />
              )}

              {/* Fret cells */}
              {frets.filter((f) => f > 0).map((f, fi) => {
                const midi = openMidi + f;
                const nc = noteClass(midi);
                const status = nc === rootNote ? "root" : scaleNoteClasses.has(nc) ? "note" : null;
                const isInlay =
                  (isSingleDot && INLAY_FRETS.has(f) && f !== DOUBLE_DOT) ||
                  ((isDoubleTop || isDoubleBot) && f === DOUBLE_DOT);

                return (
                  <div
                    key={f}
                    className="relative flex-1 h-10 flex items-center justify-center"
                  >
                    {/* Inlay dot */}
                    {isInlay && (
                      <div
                        className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
                        style={{ background: "rgba(255,225,130,0.07)" }}
                      />
                    )}
                    {/* Fret line (left edge) */}
                    <div
                      className="absolute left-0 inset-y-0 pointer-events-none"
                      style={{
                        width: fi === 0 && !isOpenSection ? "3px" : "1px",
                        background: fi === 0 && !isOpenSection
                          ? "linear-gradient(to bottom,transparent 0%,rgba(200,184,112,.7) 20%,rgba(220,200,130,.8) 50%,rgba(200,184,112,.7) 80%,transparent 100%)"
                          : "linear-gradient(to bottom,transparent 0%,rgba(180,185,200,.55) 20%,rgba(210,215,230,.65) 50%,rgba(180,185,200,.55) 80%,transparent 100%)",
                      }}
                    />
                    {/* String line */}
                    <div
                      className="absolute left-0 right-0 pointer-events-none"
                      style={{
                        height: `${Math.max(STRING_THICKNESS[si], 1)}px`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: isWound
                          ? "linear-gradient(to bottom,rgba(70,48,8,.8),rgba(188,138,42,.96),rgba(215,170,60,1),rgba(188,138,42,.96),rgba(70,48,8,.8))"
                          : "linear-gradient(to bottom,rgba(55,55,75,.72),rgba(178,178,200,.94),rgba(205,205,225,1),rgba(178,178,200,.94),rgba(55,55,75,.72))",
                      }}
                    />
                    {/* Note circle */}
                    {status && (
                      <div
                        className={cn(
                          "relative z-10 rounded-full flex items-center justify-center font-black text-white leading-none select-none",
                          status === "root"
                            ? "w-7 h-7 bg-amber-500 border-2 border-amber-200/80 text-[9px]"
                            : "w-5 h-5 bg-teal-500 border border-teal-200/70 text-[8px]",
                        )}
                        style={status === "root"
                          ? { boxShadow: "0 0 0 2px rgba(251,191,36,.32),0 0 10px rgba(251,191,36,.55)" }
                          : { boxShadow: "0 0 6px rgba(20,184,166,.4)" }}
                      >
                        {getNoteName(midi, useVi)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Inlay dots row (bottom) */}
        <div className="flex pb-1 px-1 select-none">
          <div className="w-8 flex-shrink-0" />
          {isOpenSection && <div className="w-8 flex-shrink-0" />}
          {isOpenSection && <div className="w-[5px] flex-shrink-0" />}
          {frets.filter((f) => f > 0).map((f) => (
            <div key={f} className="flex-1 flex items-center justify-center pt-1">
              {INLAY_FRETS.has(f) && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                  {f === DOUBLE_DOT && (
                    <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Instrument = "piano" | "guitar";

export default function ScaleSearchPage() {
  const [rootNote, setRootNote] = useState<number>(0);
  const [scaleType, setScaleType] = useState<string>("major");
  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [isPlaying, setIsPlaying] = useState(false);
  const [useVi, setUseVi] = useState(true);

  const audioRef = useRef<AudioContext | null>(null);
  const playTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const getCtx = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  const scaleIntervals = useMemo(() => SCALES[scaleType]?.intervals ?? [], [scaleType]);

  const scaleNoteClasses = useMemo(
    () => new Set(scaleIntervals.map((i) => (rootNote + i) % 12)),
    [rootNote, scaleIntervals],
  );

  const scaleNotes = useMemo(
    () =>
      scaleIntervals.map((i) => {
        const nc = (rootNote + i) % 12;
        return { nc, vi: NOTE_VI[nc], en: NOTE_EN[nc] };
      }),
    [rootNote, scaleIntervals],
  );

  const getScaleStatus = useCallback(
    (midi: number): "root" | "note" | null => {
      const nc = noteClass(midi);
      if (nc === rootNote) return "root";
      if (scaleNoteClasses.has(nc)) return "note";
      return null;
    },
    [rootNote, scaleNoteClasses],
  );

  function stopScale() {
    playTimeoutsRef.current.forEach(clearTimeout);
    playTimeoutsRef.current = [];
    setIsPlaying(false);
  }

  function playScale() {
    if (isPlaying) { stopScale(); return; }
    setIsPlaying(true);
    const ctx = getCtx();
    const baseMidi = 60 + rootNote;
    const midiNotes = [...scaleIntervals, 12].map((i) => baseMidi + i);
    midiNotes.forEach((midi, idx) => {
      const t = setTimeout(() => {
        pluck(midiToFreq(midi), ctx, 0.65);
        if (idx === midiNotes.length - 1) setIsPlaying(false);
      }, idx * 360);
      playTimeoutsRef.current.push(t);
    });
  }

  const diatonicChords = useMemo(() => {
    const qualities = DIATONIC_QUALITIES[scaleType];
    if (!qualities) return null;
    return scaleIntervals.map((interval, idx) => {
      const nc = (rootNote + interval) % 12;
      return {
        degree: DEGREE_NAMES[idx] ?? "",
        name: NOTE_EN[nc] + qualities[idx],
        quality: qualities[idx],
      };
    });
  }, [rootNote, scaleType, scaleIntervals]);

  useEffect(() => {
    return () => {
      playTimeoutsRef.current.forEach(clearTimeout);
      audioRef.current?.close();
    };
  }, []);

  const noteNames = useVi ? NOTE_VI : NOTE_EN;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* ── Title ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tìm kiếm âm giai</h1>
          <p className="text-gray-400 text-sm mt-1">
            Chọn nốt gốc và loại âm giai để xem trên đàn piano hoặc guitar
          </p>
        </div>

        {/* ── Selectors ── */}
        <div className="flex flex-wrap gap-3 mb-5 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Nốt gốc
            </label>
            <select
              value={rootNote}
              onChange={(e) => setRootNote(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {NOTE_VI[i]} ({NOTE_EN[i]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Loại âm giai
            </label>
            <select
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(SCALES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Tên nốt
            </label>
            <button
              onClick={() => setUseVi((v) => !v)}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
            >
              {useVi ? "VI" : "EN"}
            </button>
          </div>
        </div>

        {/* ── Scale name + note cards ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-emerald-400">
              {noteNames[rootNote]}&nbsp;{SCALES[scaleType]?.label}
            </h2>
            <button
              onClick={playScale}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                isPlaying
                  ? "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                  : "bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30",
              )}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? "Dừng" : "Chơi âm giai"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {scaleNotes.map(({ nc, vi, en }, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-mono font-semibold">
                  {DEGREE_NAMES[idx]}
                </span>
                <div className={cn(
                  "w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-bold",
                  nc === rootNote
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-gray-800 border-gray-700 text-gray-100",
                )}>
                  <span className="text-sm leading-tight">{useVi ? vi : en}</span>
                  {nc !== rootNote && (
                    <span className="text-[9px] text-gray-500 mt-0.5">
                      {useVi ? en : vi}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Instrument tabs ── */}
        <div className="flex gap-2 mb-0">
          {(["piano", "guitar"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setInstrument(key)}
              className={cn(
                "px-5 py-2.5 rounded-t-xl text-sm font-semibold border-x border-t transition-all capitalize",
                instrument === key
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "bg-gray-900/40 border-gray-800 text-gray-500 hover:text-gray-300",
              )}
            >
              {key === "piano" ? "🎹 Piano" : "🎸 Guitar"}
            </button>
          ))}
        </div>

        {/* ── Instrument panel ── */}
        <div className="bg-gray-900 border border-gray-700 rounded-b-xl rounded-tr-xl p-4 mb-4">
          {instrument === "piano" ? (
            <PianoKeyboard
              rootNote={rootNote}
              scaleNoteClasses={scaleNoteClasses}
              useVi={useVi}
            />
          ) : (
            <div className="space-y-3">
              {/* Full fretboard overview (scrollable) */}
              <p className="text-xs text-gray-500 mb-1">
                Tổng quan — tất cả các thế tay:
              </p>
              <Fretboard
                marked={EMPTY_MARKED}
                showNames={true}
                useVi={useVi}
                onToggle={() => {}}
                getScaleStatus={getScaleStatus}
              />

              {/* 3 position sections */}
              <p className="text-xs text-gray-500 mt-4 mb-1">
                3 thế tay chính trên cần đàn:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SECTIONS.map((s) => (
                  <GuitarSection
                    key={s.label}
                    {...s}
                    rootNote={rootNote}
                    scaleNoteClasses={scaleNoteClasses}
                    useVi={useVi}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Diatonic chords ── */}
        {diatonicChords && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Hợp âm trong điệu — {noteNames[rootNote]} {SCALES[scaleType]?.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {diatonicChords.map(({ degree, name, quality }) => (
                <div key={degree} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-mono font-semibold">
                    {degree}
                  </span>
                  <div className={cn(
                    "w-16 h-10 rounded-lg flex items-center justify-center text-sm font-bold border",
                    quality === ""
                      ? "bg-purple-800/40 border-purple-600/50 text-purple-200"
                      : quality === "m"
                      ? "bg-blue-800/40 border-blue-600/50 text-blue-200"
                      : "bg-gray-800/60 border-gray-600/50 text-gray-400",
                  )}>
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
