import { Volume2, VolumeX, Play, Eye, EyeOff, RotateCcw, Mic } from "lucide-react";
import { cn } from "../../utils";

interface MobileToolbarProps {
  showNames: boolean;
  useVi: boolean;
  markedCount: number;
  tunerOpen: boolean;
  muted: boolean;
  onToggleNames: () => void;
  onToggleVi: () => void;
  onPlayAll: () => void;
  onClearAll: () => void;
  onToggleTuner: () => void;
  onToggleMute: () => void;
}

export default function MobileToolbar({
  showNames, useVi, markedCount, tunerOpen, muted,
  onToggleNames, onToggleVi, onPlayAll, onClearAll, onToggleTuner, onToggleMute,
}: MobileToolbarProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800/80"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch divide-x divide-gray-800/60">
        <button
          onClick={onToggleNames}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
            showNames ? "text-purple-400 bg-purple-900/20" : "text-gray-500 active:bg-gray-800/60",
          )}
        >
          {showNames ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          <span className="text-[9px] font-medium">{"Nốt"}</span>
        </button>
        <button
          onClick={onToggleVi}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-gray-500 active:bg-gray-800/60 transition-all"
        >
          <span className="text-sm font-bold leading-none">{useVi ? "Vi" : "En"}</span>
          <span className="text-[9px] font-medium mt-0.5">{"Ngôn ngữ"}</span>
        </button>
        <button
          onClick={onPlayAll}
          disabled={markedCount === 0}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
            markedCount > 0 ? "text-green-400 active:bg-green-900/20" : "text-gray-700",
          )}
        >
          <Play className="w-5 h-5" />
          <span className="text-[9px] font-medium">
            {markedCount > 0 ? "Chơi (" + String(markedCount) + ")" : "Chơi"}
          </span>
        </button>
        <button
          onClick={onClearAll}
          disabled={markedCount === 0}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
            markedCount > 0 ? "text-red-400 active:bg-red-900/20" : "text-gray-700",
          )}
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] font-medium">{"Xóa"}</span>
        </button>
        <button
          onClick={onToggleTuner}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
            tunerOpen ? "text-cyan-400 bg-cyan-900/20" : "text-gray-500 active:bg-gray-800/60",
          )}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[9px] font-medium">Tuner</span>
        </button>
        <button
          onClick={onToggleMute}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 py-3.5 transition-all",
            muted ? "text-red-400 bg-red-900/20" : "text-gray-500 active:bg-gray-800/60",
          )}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span className="text-[9px] font-medium">{"Âm thanh"}</span>
        </button>
      </div>
    </div>
  );
}
