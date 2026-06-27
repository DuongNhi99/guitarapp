import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { NOTE_VI, NOTE_EN, SCALES, CHORDS, OPEN_MIDI, mk, noteClass, getNoteName, midiToFreq } from "../utils/guitarConstants";
import type { MarkedKey, LastNote } from "../utils/guitarConstants";
import { pluck, autoCorrelate } from "../utils/guitarAudio";
import GuitarHeader from "../components/guitar/GuitarHeader";
import DesktopControls from "../components/guitar/DesktopControls";
import NoteDisplay from "../components/guitar/NoteDisplay";
import TunerPanel from "../components/guitar/TunerPanel";
import Fretboard from "../components/guitar/Fretboard";
import ChordLibrary from "../components/guitar/ChordLibrary";
import OpenStrings from "../components/guitar/OpenStrings";
import Instructions from "../components/guitar/Instructions";
import MobileToolbar from "../components/guitar/MobileToolbar";

export default function GuitarPage() {
  const [marked, setMarked] = useState<Set<MarkedKey>>(new Set());
  const [showNames, setShowNames] = useState(false);
  const [useVi, setUseVi] = useState(true);
  const [muted, setMuted] = useState(false);
  const [, setActiveChord] = useState<string | null>(null);
  const [activeChordGroup, setActiveChordGroup] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [lastNote, setLastNote] = useState<LastNote | null>(null);
  const [activeScaleRoot, setActiveScaleRoot] = useState<number | null>(null);
  const [activeScaleType, setActiveScaleType] = useState<string>("major");

  const [tunerOpen, setTunerOpen] = useState(false);
  const [tunerActive, setTunerActive] = useState(false);
  const [tunerFreq, setTunerFreq] = useState(0);
  const [tunerMidi, setTunerMidi] = useState(-1);
  const [tunerVolume, setTunerVolume] = useState(0);

  const [viewChord, setViewChord] = useState<string | null>(null);
  const [playingCanon, setPlayingCanon] = useState<string | null>(null);
  const [canonIdx, setCanonIdx] = useState(-1);
  const canonTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playingCanonRef = useRef<string | null>(null);
  const canonSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const tunerCtxRef = useRef<AudioContext | null>(null);
  const tunerAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const tunerRafRef = useRef<number>(0);
  const tunerBufRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const tunerLastTsRef = useRef<number>(0);

  const audioRef = useRef<AudioContext | null>(null);

  const scaleClasses = useMemo(() => {
    if (activeScaleRoot === null) return null;
    const intervals = SCALES[activeScaleType]?.intervals ?? [];
    return new Set(intervals.map((i) => (activeScaleRoot + i) % 12));
  }, [activeScaleRoot, activeScaleType]);

  const getScaleStatus = useCallback(
    (midi: number): 'root' | 'note' | null => {
      if (!scaleClasses || activeScaleRoot === null) return null;
      const nc = noteClass(midi);
      if (nc === activeScaleRoot) return 'root';
      if (scaleClasses.has(nc)) return 'note';
      return null;
    },
    [scaleClasses, activeScaleRoot],
  );

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

  const toggleMark = useCallback((si: number, fret: number) => {
    const k = mk(si, fret);
    const midi = OPEN_MIDI[si] + fret;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
    setLastNote({ vi: getNoteName(midi, true), en: getNoteName(midi, false), midi, si, fret });
    playNote(si, fret);
    setActiveChord(null);
    setViewChord(null);
  }, [playNote]);

  function clearAll() {
    setMarked(new Set());
    setActiveChord(null);
    setViewChord(null);
  }

  function playAll() {
    if (muted || marked.size === 0) return;
    const ctx = getCtx();
    [...marked]
      .map((k) => { const [s, f] = k.split("-").map(Number); return { s, f, midi: OPEN_MIDI[s] + f }; })
      .sort((a, b) => a.midi - b.midi)
      .forEach(({ s, f }, i) => setTimeout(() => pluck(midiToFreq(OPEN_MIDI[s] + f), ctx), i * 60));
  }

  function selectChord(name: string) {
    const frets = CHORDS[name];
    if (!frets) return;
    const next = new Set<MarkedKey>();
    frets.forEach((f, si) => { if (f >= 0) next.add(mk(si, f)); });
    setMarked(next);
    setActiveChord(name);
    setViewChord(name);
    if (!muted) {
      const ctx = getCtx();
      frets.forEach((f, si) => {
        if (f >= 0) setTimeout(() => pluck(midiToFreq(OPEN_MIDI[si] + f), ctx), si * 55);
      });
    }
  }

  function stopCanon() {
    canonTimeoutsRef.current.forEach(clearTimeout);
    canonTimeoutsRef.current = [];
    canonSourcesRef.current.forEach((src) => { try { src.stop(); } catch { /* already stopped */ } });
    canonSourcesRef.current = [];
    playingCanonRef.current = null;
    setPlayingCanon(null);
    setCanonIdx(-1);
    setActiveChord(null);
    setMarked(new Set());
    setLastNote(null);
  }

  function playCanonProgression(progressionKey: string, chords: string[]) {
    if (playingCanonRef.current === progressionKey) { stopCanon(); return; }
    stopCanon();
    if (muted) return;
    setViewChord(null);
    playingCanonRef.current = progressionKey;
    setPlayingCanon(progressionKey);
    const ctx = getCtx();
    const now = ctx.currentTime;
    const validChords = chords.filter((n) => CHORDS[n]);
    const beatSec = 60 / 72;
    const chordSec = beatSec * 4;
    const strumSec = 0.014;

    validChords.forEach((name, ci) => {
      const chordStart = ci * chordSec;
      canonTimeoutsRef.current.push(
        setTimeout(() => {
          setActiveChord(name);
          setCanonIdx(ci);
          const frets = CHORDS[name];
          if (frets) {
            const next = new Set<MarkedKey>();
            frets.forEach((f, si) => { if (f >= 0) next.add(mk(si, f)); });
            setMarked(next);
          }
        }, Math.round(chordStart * 1000)),
      );
      const frets = CHORDS[name];
      for (let b = 0; b < 4; b++) {
        const beatStart = chordStart + b * beatSec;
        const isUp = b % 2 === 1;
        if (isUp) {
          [5, 4, 3, 2].forEach((si, idx) => {
            const f = frets[si];
            if (f < 0) return;
            canonSourcesRef.current.push(
              pluck(midiToFreq(OPEN_MIDI[si] + f), ctx, 0.38, now + beatStart + idx * strumSec),
            );
          });
        } else {
          frets.forEach((f, si) => {
            if (f < 0) return;
            canonSourcesRef.current.push(
              pluck(midiToFreq(OPEN_MIDI[si] + f), ctx, 0.7, now + beatStart + si * strumSec),
            );
          });
        }
      }
    });

    const endMs = Math.round(validChords.length * chordSec * 1000) + 400;
    canonTimeoutsRef.current.push(
      setTimeout(() => {
        playingCanonRef.current = null;
        setPlayingCanon(null);
        setCanonIdx(-1);
        setActiveChord(null);
        setMarked(new Set());
        setLastNote(null);
        canonTimeoutsRef.current = [];
        canonSourcesRef.current = [];
      }, endMs),
    );
  }

  function runTunerLoop(ts: DOMHighResTimeStamp) {
    const analyser = tunerAnalyserRef.current;
    const buf = tunerBufRef.current;
    const ctx = tunerCtxRef.current;
    if (!analyser || !buf || !ctx) return;
    if (ts - tunerLastTsRef.current >= 50) {
      tunerLastTsRef.current = ts;
      analyser.getFloatTimeDomainData(buf);
      let sq = 0;
      for (let i = 0; i < buf.length; i++) sq += buf[i] * buf[i];
      const rms = Math.sqrt(sq / buf.length);
      setTunerVolume(Math.min(1, rms * 6));
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
    if (tunerActive || micStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false,
      });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
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

  function toggleMute() {
    if (!muted) stopCanon();
    setMuted((v) => !v);
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(tunerRafRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      tunerCtxRef.current?.close();
      canonTimeoutsRef.current.forEach(clearTimeout);
      canonSourcesRef.current.forEach((src) => { try { src.stop(); } catch { /* already stopped */ } });
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const si = parseInt(e.key) - 1;
      if (si >= 0 && si < 6) playNote(si, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playNote]);

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-36 sm:pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        <GuitarHeader muted={muted} onToggleMute={toggleMute} />
        <DesktopControls
          showNames={showNames}
          useVi={useVi}
          muted={muted}
          markedCount={marked.size}
          tunerOpen={tunerOpen}
          onToggleNames={() => setShowNames((v) => !v)}
          onToggleVi={() => setUseVi((v) => !v)}
          onPlayAll={playAll}
          onClearAll={clearAll}
          onToggleTuner={() => setTunerOpen((v) => !v)}
          onToggleMute={toggleMute}
        />
        <NoteDisplay lastNote={lastNote} useVi={useVi} />
        {tunerOpen && (
          <TunerPanel
            tunerActive={tunerActive}
            tunerFreq={tunerFreq}
            tunerMidi={tunerMidi}
            tunerVolume={tunerVolume}
            useVi={useVi}
            onStart={startTuner}
            onStop={stopTuner}
          />
        )}
        {(viewChord || activeScaleRoot !== null) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {viewChord && (
              <>
                <span className="text-gray-500 text-xs">{"Đang xem:"}</span>
                <span className="px-3 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-sm font-bold">
                  {viewChord}
                </span>
              </>
            )}
            {activeScaleRoot !== null && (
              <>
                {viewChord && <span className="text-gray-700 text-xs">·</span>}
                {!viewChord && <span className="text-gray-500 text-xs">{"Thang âm:"}</span>}
                <span className="px-3 py-0.5 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold">
                  {(useVi ? NOTE_VI[activeScaleRoot] : NOTE_EN[activeScaleRoot])}{" "}
                  {SCALES[activeScaleType]?.label ?? ''}
                </span>
                <button
                  onClick={() => setActiveScaleRoot(null)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-sm leading-none"
                  aria-label="Xóa thang âm"
                >
                  ×
                </button>
              </>
            )}
          </div>
        )}
        <Fretboard
          marked={marked}
          showNames={showNames}
          useVi={useVi}
          onToggle={toggleMark}
          getScaleStatus={getScaleStatus}
        />
        <ChordLibrary
          activeChordGroup={activeChordGroup}
          playingCanon={playingCanon}
          canonIdx={canonIdx}
          viewChord={viewChord}
          activeScaleRoot={activeScaleRoot}
          activeScaleType={activeScaleType}
          useVi={useVi}
          onSelectChord={selectChord}
          onSetChordGroup={setActiveChordGroup}
          onPlayCanon={playCanonProgression}
          onSetScaleRoot={setActiveScaleRoot}
          onSetScaleType={setActiveScaleType}
        />
        <OpenStrings onPlay={(si) => playNote(si, 0)} />
        <Instructions open={showInstructions} onToggle={() => setShowInstructions((v) => !v)} />
      </div>
      <MobileToolbar
        showNames={showNames}
        useVi={useVi}
        markedCount={marked.size}
        tunerOpen={tunerOpen}
        muted={muted}
        onToggleNames={() => setShowNames((v) => !v)}
        onToggleVi={() => setUseVi((v) => !v)}
        onPlayAll={playAll}
        onClearAll={clearAll}
        onToggleTuner={() => setTunerOpen((v) => !v)}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
