import { memo, useCallback } from "react";
import { cn } from "../../utils";
import { getNoteName, NOTE_EN, noteClass, isSharpNote } from "../../utils/guitarConstants";

interface CellProps {
  si: number;
  fret: number;
  midi: number;
  isMarked: boolean;
  showNames: boolean;
  vi: boolean;
  thickness: number;
  isOpen: boolean;
  isWound: boolean;
  onToggle: (si: number, fret: number) => void;
  scaleStatus?: 'root' | 'note' | null;
  isInlay?: boolean;
}

const FretCell = memo(function FretCell({
  si, fret, midi, isMarked, showNames, vi, thickness, isOpen, isWound, onToggle,
  scaleStatus = null, isInlay = false,
}: CellProps) {
  const name = getNoteName(midi, vi);
  const nameEn = NOTE_EN[noteClass(midi)];
  const sharp = isSharpNote(midi);
  const handleClick = useCallback(() => onToggle(si, fret), [onToggle, si, fret]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        isOpen ? "w-10 flex-shrink-0 h-[44px] sm:h-[52px]" : "flex-1 h-[44px] sm:h-[52px]",
      )}
    >
      {isInlay && (
        <div
          className="absolute w-3 h-3 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,225,130,0.06)', zIndex: 0 }}
        />
      )}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: `${Math.max(thickness, 1)}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          background: isWound
            ? 'linear-gradient(to bottom, rgba(70,48,8,0.80), rgba(188,138,42,0.96), rgba(215,170,60,1), rgba(188,138,42,0.96), rgba(70,48,8,0.80))'
            : 'linear-gradient(to bottom, rgba(55,55,75,0.72), rgba(178,178,200,0.94), rgba(205,205,225,1), rgba(178,178,200,0.94), rgba(55,55,75,0.72))',
          boxShadow: isWound
            ? '0 0 5px rgba(190,140,30,0.38), 0 1px 0 rgba(250,200,80,0.12)'
            : '0 0 4px rgba(160,160,210,0.30), 0 1px 0 rgba(240,240,255,0.10)',
        }}
      />
      {!isOpen && (
        <div
          className="absolute left-0 inset-y-0 w-px pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(180,185,200,0.65) 20%, rgba(210,215,230,0.70) 50%, rgba(180,185,200,0.65) 80%, transparent 100%)' }}
        />
      )}

      {isMarked ? (
        <button
          onClick={handleClick}
          className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-purple-950/70 border-2 border-purple-300/60 focus:outline-none"
          aria-label={`Bỏ đánh dấu ${name}`}
        >
          <span className="text-[10px] sm:text-[11px] font-extrabold text-white leading-none select-none">
            {nameEn}
          </span>
        </button>
      ) : scaleStatus ? (
        <button
          onClick={handleClick}
          className={cn(
            "relative z-10 rounded-full flex items-center justify-center transition-all active:scale-90 focus:outline-none",
            scaleStatus === 'root'
              ? "w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 hover:bg-amber-400 border-2 border-amber-100/90"
              : "w-6 h-6 sm:w-7 sm:h-7 bg-teal-500 hover:bg-teal-400 border border-teal-200/70",
          )}
          style={scaleStatus === 'root' ? {
            boxShadow: '0 0 0 2px rgba(251,191,36,0.32), 0 0 14px rgba(251,191,36,0.55)',
          } : {
            boxShadow: '0 0 8px rgba(20,184,166,0.40)',
          }}
          aria-label={`Đánh dấu ${name}`}
        >
          <span className={cn(
            "font-black text-white leading-none select-none tracking-tight",
            scaleStatus === 'root' ? "text-[10px] sm:text-[12px]" : "text-[9px] sm:text-[10px] font-extrabold",
          )}>
            {nameEn}
          </span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:bg-purple-700/30 group focus:outline-none"
          aria-label={`Đánh dấu ${name}`}
        >
          {showNames && (
            <span
              className={cn(
                "text-[10px] font-medium pointer-events-none select-none transition-colors",
                sharp
                  ? "text-pink-400/70 group-hover:text-pink-300"
                  : "text-gray-400 group-hover:text-gray-200",
              )}
            >
              {name}
            </span>
          )}
        </button>
      )}
    </div>
  );
});

export default FretCell;
