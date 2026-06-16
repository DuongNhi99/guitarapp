import { Music, Volume2, VolumeX } from "lucide-react";
import { cn } from "../../utils";

interface GuitarHeaderProps {
  muted: boolean;
  onToggleMute: () => void;
}

export default function GuitarHeader({ muted, onToggleMute }: GuitarHeaderProps) {
  return (
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
        onClick={onToggleMute}
        className={cn(
          "sm:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
          muted
            ? "bg-red-900/50 text-red-400"
            : "bg-gray-800 text-gray-400 hover:text-white",
        )}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
