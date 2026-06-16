import { Volume2, VolumeX, Play, Eye, EyeOff, RotateCcw, Mic } from "lucide-react";
import { cn } from "../../utils";

interface DesktopControlsProps {
  showNames: boolean;
  useVi: boolean;
  muted: boolean;
  markedCount: number;
  tunerOpen: boolean;
  onToggleNames: () => void;
  onToggleVi: () => void;
  onPlayAll: () => void;
  onClearAll: () => void;
  onToggleTuner: () => void;
  onToggleMute: () => void;
}

export default function DesktopControls({
  showNames, useVi, muted, markedCount, tunerOpen,
  onToggleNames, onToggleVi, onPlayAll, onClearAll, onToggleTuner, onToggleMute,
}: DesktopControlsProps) {
  return (
    <div className="hidden sm:flex flex-wrap items-center gap-2 mb-5">
      <button
        onClick={onToggleNames}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
          showNames
            ? "bg-purple-600 border-purple-500 text-white"
            : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700",
        )}
      >
        {showNames ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        {"Hiển thị nốt"}
      </button>
      <button
        onClick={onToggleVi}
        className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
      >
        {useVi ? "Tiếng Việt" : "English"}
      </button>
      <button
        onClick={onPlayAll}
        disabled={markedCount === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Play className="w-4 h-4" />
        {"Chơi"}
        {markedCount > 0 ? " (" + String(markedCount) + ")" : ""}
      </button>
      <button
        onClick={onClearAll}
        disabled={markedCount === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/80 border border-gray-700 text-gray-300 hover:bg-red-900/40 hover:text-red-400 hover:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        {"Xóa"}
      </button>
      <button
        onClick={onToggleTuner}
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
        onClick={onToggleMute}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ml-auto border",
          muted
            ? "bg-red-900/40 border-red-800/60 text-red-400"
            : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700",
        )}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
