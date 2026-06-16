import { Play, Square } from "lucide-react";
import { cn } from "../../utils";
import {
  CHORD_GROUPS, CANON_PROGRESSIONS, CHORDS, SCALES, NOTE_EN, NOTE_VI,
} from "../../utils/guitarConstants";

interface ChordLibraryProps {
  activeChord: string | null;
  activeChordGroup: number;
  playingCanon: string | null;
  activeScaleRoot: number | null;
  activeScaleType: string;
  useVi: boolean;
  onSelectChord: (name: string) => void;
  onSetChordGroup: (idx: number) => void;
  onPlayCanon: (key: string, chords: string[]) => void;
  onSetScaleRoot: (root: number | null) => void;
  onSetScaleType: (type: string) => void;
}

export default function ChordLibrary({
  activeChord, activeChordGroup, playingCanon, activeScaleRoot, activeScaleType, useVi,
  onSelectChord, onSetChordGroup, onPlayCanon, onSetScaleRoot, onSetScaleType,
}: ChordLibraryProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 overflow-hidden">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {CHORD_GROUPS.map((group, idx) => (
          <button
            key={group.label}
            onClick={() => onSetChordGroup(idx)}
            className={cn(
              "flex-1 py-2.5 sm:py-3.5 text-[11px] sm:text-sm font-semibold transition-all active:bg-gray-800/40 whitespace-nowrap px-1",
              activeChordGroup === idx
                ? "text-white border-b-2 border-purple-500 bg-purple-600/10"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40",
            )}
          >
            <span className="sm:hidden">
              {group.label === "7" ? "Loại 7"
                : group.label === "Canon" ? "Canon"
                : group.label === "Thang âm" ? "Gam"
                : group.label}
            </span>
            <span className="hidden sm:inline">
              {group.label === "7" ? "Hợp âm 7"
                : group.label === "Canon" ? "Canon"
                : group.label === "Thang âm" ? "Thang âm"
                : "Hợp âm " + group.label}
            </span>
          </button>
        ))}
      </div>
      <div className="p-3 sm:p-4">
        {CHORD_GROUPS[activeChordGroup].label === "Canon" ? (
          <div className="flex flex-col gap-2.5">
            {CANON_PROGRESSIONS.map(({ key, chords }) => (
              <div key={key} className="flex items-center gap-2">
                <button
                  onClick={() => onPlayCanon(key, chords)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 border",
                    playingCanon === key
                      ? "bg-purple-600 border-purple-500 text-white shadow shadow-purple-900/40"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white",
                  )}
                  title={playingCanon === key ? "Dừng" : `Phát Canon ${key}`}
                >
                  {playingCanon === key
                    ? <Square className="w-2.5 h-2.5 fill-current" />
                    : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
                </button>
                <span className="text-xs font-bold text-gray-400 w-7 flex-shrink-0 text-right pr-1">{key}</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {chords.filter((n) => CHORDS[n]).map((name, i) => (
                    <button
                      key={`${key}-${i}`}
                      onClick={() => onSelectChord(name)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 whitespace-nowrap flex-shrink-0 min-w-[40px] text-center",
                        activeChord === name && playingCanon === key
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 ring-1 ring-purple-400/50"
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
        ) : CHORD_GROUPS[activeChordGroup].label === "Thang âm" ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">{"Nốt gốc"}</p>
              <div className="flex flex-wrap gap-1.5">
                {NOTE_EN.map((note, i) => (
                  <button
                    key={note}
                    onClick={() => onSetScaleRoot(activeScaleRoot === i ? null : i)}
                    className={cn(
                      "px-2.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 min-w-[36px] text-center border",
                      activeScaleRoot === i
                        ? "bg-amber-500 border-amber-400 text-white shadow shadow-amber-900/40"
                        : note.includes("#")
                          ? "bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500",
                    )}
                  >
                    {useVi ? NOTE_VI[i] : note}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">{"Loại thang âm"}</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(SCALES).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => onSetScaleType(key)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 border",
                      activeScaleType === key
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-500",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {activeScaleRoot !== null && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500">{"Các nốt:"}</span>
                {(SCALES[activeScaleType]?.intervals ?? []).map((interval) => {
                  const nc = (activeScaleRoot + interval) % 12;
                  return (
                    <span
                      key={interval}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-bold border",
                        nc === activeScaleRoot
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-emerald-900/30 border-emerald-700/40 text-emerald-400",
                      )}
                    >
                      {useVi ? NOTE_VI[nc] : NOTE_EN[nc]}
                    </span>
                  );
                })}
              </div>
            )}
            {activeScaleRoot === null && (
              <p className="text-xs text-gray-600 text-center py-2">
                {"Chọn nốt gốc để hiển thị thang âm trên cần đàn"}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {CHORD_GROUPS[activeChordGroup].names
              .filter((n) => CHORDS[n])
              .map((name) => (
                <button
                  key={name}
                  onClick={() => onSelectChord(name)}
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
  );
}
