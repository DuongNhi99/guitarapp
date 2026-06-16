import { Mic, MicOff } from "lucide-react";
import { cn } from "../../utils";
import { NOTE_EN, NOTE_VI, OPEN_MIDI, OPEN_LABELS_VI, OPEN_LABELS_EN } from "../../utils/guitarConstants";

interface TunerPanelProps {
  tunerActive: boolean;
  tunerFreq: number;
  tunerMidi: number;
  tunerVolume: number;
  useVi: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function TunerPanel({
  tunerActive, tunerFreq, tunerMidi, tunerVolume, useVi, onStart, onStop,
}: TunerPanelProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm">
          {tunerActive ? (
            <span className="flex items-center gap-2 text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {"Đang nghe..."}
            </span>
          ) : (
            <span className="text-gray-500">{"Microphone chưa kích hoạt"}</span>
          )}
        </div>
        <button
          onClick={tunerActive ? onStop : onStart}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95",
            tunerActive
              ? "bg-red-900/40 border border-red-800/60 text-red-400 hover:bg-red-900/60"
              : "bg-purple-700 text-white hover:bg-purple-600",
          )}
        >
          {tunerActive ? (
            <><MicOff className="w-3.5 h-3.5" />{"Dừng"}</>
          ) : (
            <><Mic className="w-3.5 h-3.5" />{"Bắt đầu"}</>
          )}
        </button>
      </div>
      <div className="px-4 sm:px-5 py-5">
        {tunerFreq > 0 ? (
          (() => {
            const roundedMidi = Math.round(tunerMidi);
            const cents = (tunerMidi - roundedMidi) * 100;
            const inTune = Math.abs(cents) <= 5;
            const close = Math.abs(cents) <= 20;
            const nc = ((roundedMidi % 12) + 12) % 12;
            const noteEn = NOTE_EN[nc];
            const noteVi = NOTE_VI[nc];
            let targetSi = 0;
            let bestDist = Infinity;
            OPEN_MIDI.forEach((m, si) => {
              const d = Math.abs(tunerMidi - m);
              if (d < bestDist) { bestDist = d; targetSi = si; }
            });
            const needlePos = Math.min(Math.max((cents + 50) / 100, 0), 1);
            const centsRounded = Math.round(cents);
            const centsLabel = centsRounded >= 0
              ? "+" + centsRounded + " cents — Hơi cao"
              : String(centsRounded) + " cents — Hơi thấp";
            return (
              <div className="flex flex-col items-center gap-5">
                <div className="flex items-center gap-6 flex-wrap justify-center">
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all",
                      inTune
                        ? "border-green-500 bg-green-900/20 shadow-lg shadow-green-900/30"
                        : close
                          ? "border-yellow-500 bg-yellow-900/15"
                          : "border-red-500/60 bg-red-900/10",
                    )}
                  >
                    <span className="text-3xl font-extrabold text-white leading-none">{noteEn}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{noteVi}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="text-gray-400">
                      {"Tần số: "}
                      <span className="text-white font-mono font-semibold">{tunerFreq.toFixed(1)} Hz</span>
                    </div>
                    <div className="text-gray-400">
                      {"Dây gần nhất: "}
                      <span className="text-purple-300 font-semibold">
                        {OPEN_LABELS_EN[targetSi]} {"—"} {OPEN_LABELS_VI[targetSi]}
                      </span>
                    </div>
                    <div className={cn("font-semibold", inTune ? "text-green-400" : close ? "text-yellow-400" : "text-red-400")}>
                      {inTune ? "✓ Đúng chuẩn" : centsLabel}
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-[10px] text-gray-600 mb-1 px-1">
                    <span>{"♭ Thấp"}</span>
                    <span>{"Chuẩn"}</span>
                    <span>{"Cao ♯"}</span>
                  </div>
                  <div className="relative h-5 rounded-full overflow-hidden bg-gray-800">
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to right, #dc2626 0%, #fbbf24 28%, #16a34a 42%, #16a34a 58%, #fbbf24 72%, #dc2626 100%)" }}
                    />
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/50" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md border-2 border-gray-500 transition-[left] duration-75"
                      style={{ left: "calc(" + String(needlePos * 100) + "% - 10px)" }}
                    />
                  </div>
                  <div className="text-center text-[10px] text-gray-500 mt-1.5">
                    {centsRounded >= 0 ? "+" + String(centsRounded) : String(centsRounded)} cents
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {[5, 4, 3, 2, 1, 0].map((si) => (
                    <div
                      key={si}
                      className={cn(
                        "flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all",
                        si === targetSi
                          ? "bg-purple-600/80 text-white shadow shadow-purple-900/40"
                          : "bg-gray-800/50 text-gray-600",
                      )}
                    >
                      <span className="font-bold text-[11px]">{OPEN_LABELS_EN[si]}</span>
                      <span className="text-[9px] opacity-70">{OPEN_LABELS_VI[si]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
              <Mic className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-gray-600 text-sm text-center leading-relaxed">
              {tunerActive
                ? "Đang chờ tín hiệu âm thanh từ micro..."
                : "Nhấn Bắt đầu và cho phép truy cập microphone để chỉnh dây đàn"}
            </p>
          </div>
        )}
      </div>
      {tunerActive && (
        <div className="px-4 sm:px-5 pb-4 flex items-center gap-2 text-xs text-gray-600">
          <Mic className="w-3 h-3 flex-shrink-0" />
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-75"
              style={{ width: String(tunerVolume * 100) + "%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
