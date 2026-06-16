import { cn } from "../../utils";
import {
  OPEN_MIDI, STRING_THICKNESS, NUM_FRETS, FRET_DOTS, DOUBLE_DOT_FRET,
  OPEN_LABELS_VI, OPEN_LABELS_EN, mk,
} from "../../utils/guitarConstants";
import type { MarkedKey } from "../../utils/guitarConstants";
import FretCell from "./FretCell";

interface FretboardProps {
  marked: Set<MarkedKey>;
  showNames: boolean;
  useVi: boolean;
  onToggle: (si: number, fret: number) => void;
  getScaleStatus: (midi: number) => 'root' | 'note' | null;
}

const displayOrder = [5, 4, 3, 2, 1, 0];

export default function Fretboard({ marked, showNames, useVi, onToggle, getScaleStatus }: FretboardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-5 border border-amber-700/50 shadow-2xl shadow-black/70">
      <div
        className="px-1 sm:px-5 py-2 sm:py-5 overflow-x-auto scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch', background: 'linear-gradient(180deg, #2e1a08 0%, #1e0f04 35%, #271508 65%, #1e0f04 100%)' }}
      >
        <div className="min-w-[620px] sm:min-w-[700px]">
          <div className="flex items-center mb-1 select-none">
            <div className="w-9 sm:w-14 flex-shrink-0" />
            <div className="w-10 flex-shrink-0 text-center text-[10px] text-amber-300 font-mono font-bold">0</div>
            <div className="w-[6px] flex-shrink-0" />
            {Array.from({ length: NUM_FRETS }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 text-center text-[10px] font-mono font-bold",
                  FRET_DOTS.has(i + 1) ? "text-amber-300" : "text-amber-400/60",
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
          {displayOrder.map((si, displayIdx) => {
            const openMidi = OPEN_MIDI[si];
            const isWound = si <= 2;
            const isSingleDotRow = displayIdx === 2;
            const isDoubleDotRowTop = displayIdx === 1;
            const isDoubleDotRowBot = displayIdx === 3;
            return (
              <div
                key={si}
                className={cn(
                  "flex items-center",
                  displayIdx % 2 === 0 ? "bg-white/[0.04]" : "bg-black/[0.08]",
                )}
              >
                <div className="w-9 sm:w-14 flex-shrink-0 flex items-center justify-end pr-1.5 sm:pr-3 select-none">
                  <span className={cn("text-xs font-mono font-bold", isWound ? "text-amber-300" : "text-amber-100/80")}>
                    {useVi ? OPEN_LABELS_VI[si] : OPEN_LABELS_EN[si]}
                  </span>
                </div>
                <FretCell
                  si={si}
                  fret={0}
                  midi={openMidi}
                  isMarked={marked.has(mk(si, 0))}
                  showNames={showNames}
                  vi={useVi}
                  thickness={STRING_THICKNESS[si]}
                  isOpen
                  isWound={isWound}
                  onToggle={onToggle}
                  scaleStatus={getScaleStatus(openMidi)}
                />
                <div
                  className="w-[6px] flex-shrink-0 self-stretch"
                  style={{ background: '#c8b870', boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,240,160,0.3)' }}
                />
                {Array.from({ length: NUM_FRETS }, (_, fi) => {
                  const fret = fi + 1;
                  const isInlay =
                    (isSingleDotRow && FRET_DOTS.has(fret) && fret !== DOUBLE_DOT_FRET) ||
                    ((isDoubleDotRowTop || isDoubleDotRowBot) && fret === DOUBLE_DOT_FRET);
                  return (
                    <FretCell
                      key={fret}
                      si={si}
                      fret={fret}
                      midi={openMidi + fret}
                      isMarked={marked.has(mk(si, fret))}
                      showNames={showNames}
                      vi={useVi}
                      thickness={STRING_THICKNESS[si]}
                      isOpen={false}
                      isWound={isWound}
                      onToggle={onToggle}
                      scaleStatus={getScaleStatus(openMidi + fret)}
                      isInlay={isInlay}
                    />
                  );
                })}
              </div>
            );
          })}
          <div className="flex items-center mt-0.5 select-none">
            <div className="w-9 sm:w-14 flex-shrink-0" />
            <div className="w-10 flex-shrink-0" />
            <div className="w-[6px] flex-shrink-0" />
            {Array.from({ length: NUM_FRETS }, (_, i) => {
              const f = i + 1;
              return (
                <div key={f} className="flex-1 flex items-center justify-center py-1.5">
                  {FRET_DOTS.has(f) && (
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow shadow-amber-900/50" />
                      {f === DOUBLE_DOT_FRET && (
                        <div className="w-3 h-3 rounded-full bg-amber-400 shadow shadow-amber-900/50" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/60 to-transparent pointer-events-none sm:hidden rounded-r-2xl" />
    </div>
  );
}
