import { cn } from "../../utils";
import { OPEN_LABELS_EN, OPEN_LABELS_VI, STRING_THICKNESS } from "../../utils/guitarConstants";

interface OpenStringsProps {
  onPlay: (si: number) => void;
}

export default function OpenStrings({ onPlay }: OpenStringsProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 p-3 sm:p-4">
      <h2 className="text-sm font-bold text-gray-300 mb-2.5 flex items-center gap-2">
        {"Dây đàn chuẩn"}
        <span className="text-xs text-gray-600 font-normal">{"Nhấn để nghe"}</span>
      </h2>
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {[0, 1, 2, 3, 4, 5].map((si) => (
          <button
            key={si}
            onClick={() => onPlay(si)}
            className="flex flex-col items-center gap-1 py-3.5 rounded-xl bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600/60 transition-all active:scale-95 group"
          >
            <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              {OPEN_LABELS_EN[si]}
            </span>
            <span className="text-[10px] text-gray-500 group-hover:text-purple-400/70 transition-colors">
              {OPEN_LABELS_VI[si]}
            </span>
            <div
              className={cn("w-3/4 rounded-full mt-0.5", si <= 2 ? "bg-amber-600/50" : "bg-gray-400/30")}
              style={{ height: String(STRING_THICKNESS[si]) + "px" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
