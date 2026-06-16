import { cn } from "../../utils";
import { NOTE_EN, NOTE_VI, noteClass, OPEN_LABELS_VI, OPEN_LABELS_EN } from "../../utils/guitarConstants";
import type { LastNote } from "../../utils/guitarConstants";

interface NoteDisplayProps {
  lastNote: LastNote | null;
  useVi: boolean;
}

export default function NoteDisplay({ lastNote, useVi }: NoteDisplayProps) {
  return (
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
                    {useVi ? OPEN_LABELS_VI[lastNote.si] : OPEN_LABELS_EN[lastNote.si]}
                  </span>
                </span>
                <span className="text-gray-400 text-xs">
                  {"Phím"}{" "}
                  <span className="font-bold text-white">{lastNote.fret}</span>
                </span>
                <span className="hidden sm:block text-gray-600 text-[10px]">
                  MIDI {lastNote.midi}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1 ml-auto">
              {NOTE_EN.map((n, i) => (
                <div
                  key={n}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-semibold select-none transition-all border",
                    i === noteClass(lastNote.midi)
                      ? "bg-purple-600 border-purple-400/60 text-white shadow-md shadow-purple-900/60 ring-2 ring-purple-400/50"
                      : n.includes("#")
                        ? "bg-gray-800 border-gray-700/60 text-gray-400"
                        : "bg-gray-600/70 border-gray-500/50 text-gray-100",
                  )}
                >
                  {useVi ? NOTE_VI[i] : n}
                </div>
              ))}
            </div>
          </div>
          <div className="flex sm:hidden gap-0.5 mt-2.5">
            {NOTE_EN.map((n, i) => (
              <div
                key={n}
                className={cn(
                  "flex-1 h-8 rounded flex items-center justify-center text-[8px] font-bold select-none transition-all border",
                  i === noteClass(lastNote.midi)
                    ? "bg-purple-600 border-purple-400/60 text-white ring-1 ring-purple-400/60"
                    : n.includes("#")
                      ? "bg-gray-800 border-gray-700/50 text-gray-400"
                      : "bg-gray-600/70 border-gray-500/40 text-gray-100",
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
  );
}
