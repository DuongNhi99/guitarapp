import { useNavigate } from "react-router-dom";
import { Download, Heart, Eye, Star, Guitar, Piano, Music } from "lucide-react";
import type { Sheet, Difficulty } from "../types";
import { formatNumber } from "../utils";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

const DIFFICULTY_STARS: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

const INSTRUMENT_ICON: Record<string, React.FC<{ className?: string }>> = {
  guitar: Guitar,
  ukulele: Guitar,
  piano: Piano,
};

function InstrumentIcon({ name }: { name: string }) {
  const Icon = INSTRUMENT_ICON[name] ?? Music;
  return <Icon className="w-3.5 h-3.5" />;
}

interface SheetCardProps {
  sheet: Sheet;
  variant?: "grid" | "list";
}

export default function SheetCard({ sheet, variant = "grid" }: SheetCardProps) {
  const navigate = useNavigate();
  const stars = DIFFICULTY_STARS[sheet.difficulty];

  if (variant === "list") {
    return (
      <div
        onClick={() => navigate(`/sheets/${sheet.id}/${sheet.slug}`)}
        className="card flex items-center gap-4 p-4 hover:scale-[1.005] cursor-pointer group"
      >
        {/* Mini sheet preview thumbnail */}
        <div className="w-16 h-20 flex-shrink-0 bg-white rounded-md border border-gray-200 overflow-hidden relative shadow-sm">
          <MiniSheetPreview content={sheet.content} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
            {sheet.title}
          </h3>
          <p className="text-sm text-gray-400 truncate mt-0.5">
            {sheet.artist.name}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="tag text-xs">{sheet.rhythm.name}</span>
            <span className="tag text-xs">Capo {sheet.capo}</span>
            <span
              className={`flex items-center gap-0.5 text-xs ${DIFFICULTY_COLOR[sheet.difficulty]}`}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  fill={i < stars ? "currentColor" : "none"}
                />
              ))}
              <span className="ml-1">{DIFFICULTY_LABEL[sheet.difficulty]}</span>
            </span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            {formatNumber(sheet.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {formatNumber(sheet.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatNumber(sheet.views)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/sheets/${sheet.id}/${sheet.slug}`)}
      className="card flex flex-col cursor-pointer group hover:scale-[1.02] transition-transform overflow-hidden"
    >
      {/* Sheet paper thumbnail */}
      <div className="relative w-full aspect-[3/4] bg-white border-b border-gray-700 overflow-hidden">
        <MiniSheetPreview content={sheet.content} full />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-purple-900/0 group-hover:bg-purple-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" /> Xem bản nhạc
          </div>
        </div>
        {/* Pages badge */}
        <div className="absolute top-2 right-2 bg-gray-900/80 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-medium">
          {sheet.pages} trang
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors truncate leading-snug">
            {sheet.title}
          </h3>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {sheet.artist.name}
          </p>
        </div>

        {/* Instruments */}
        <div className="flex items-center gap-1.5 text-gray-400">
          {sheet.instruments.map((inst) => (
            <span
              key={inst}
              className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-0.5 rounded capitalize"
            >
              <InstrumentIcon name={inst} />
              {inst}
            </span>
          ))}
        </div>

        {/* Difficulty stars */}
        <div
          className={`flex items-center gap-1 text-xs ${DIFFICULTY_COLOR[sheet.difficulty]}`}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              fill={i < stars ? "currentColor" : "none"}
            />
          ))}
          <span className="ml-0.5">{DIFFICULTY_LABEL[sheet.difficulty]}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-800">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" /> {formatNumber(sheet.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> {formatNumber(sheet.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {formatNumber(sheet.views)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Tiny read-only preview that mimics sheet paper lines */
function MiniSheetPreview({
  content,
  full,
}: {
  content: string;
  full?: boolean;
}) {
  const lines = content
    .split("\n")
    .filter((l) => l.trim())
    .slice(0, full ? 40 : 12);

  return (
    <div className="w-full h-full bg-white p-2 overflow-hidden select-none">
      {/* Faint staff-like header */}
      <div className="flex items-center gap-1 mb-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-400 opacity-70" />
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full" />
      </div>
      <div className="w-2/3 h-1 bg-gray-300 rounded mb-2" />

      {lines.map((line, i) => {
        const isSection = /^\[.+\]$/.test(line.trim());
        const chordCount = (line.match(/\[\[/g) || []).length;
        const cleanLine = line.replace(/\[\[[^\]]+\]\]/g, "").trim();

        return (
          <div key={i} className="mb-0.5">
            {isSection ? (
              <div className="w-1/3 h-1 bg-purple-300 rounded my-1" />
            ) : (
              <div className="flex items-end gap-0.5">
                {/* Chord dots */}
                {chordCount > 0 && (
                  <div className="flex gap-0.5 mb-0.5 self-start mt-0.5">
                    {Array.from({ length: Math.min(chordCount, 4) }).map(
                      (_, ci) => (
                        <div
                          key={ci}
                          className="w-3 h-1 bg-purple-400 rounded-sm opacity-80"
                        />
                      ),
                    )}
                  </div>
                )}
                {/* Text line */}
                {cleanLine && (
                  <div
                    className="h-1 bg-gray-300 rounded"
                    style={{
                      width: `${Math.min(90, 30 + cleanLine.length * 2)}%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
