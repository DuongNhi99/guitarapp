import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Guitar,
  Music2,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  Star,
  Download,
  FileMusic,
} from "lucide-react";
import { SHEETS, RHYTHMS, GENRES } from "../data/mockData";
import type { Difficulty } from "../types";
import { cn, formatNumber } from "../utils";
import SheetCard from "../components/SheetCard";

const INSTRUMENTS = ["guitar", "ukulele", "piano"];
const DIFFICULTIES: { value: Difficulty; label: string; stars: number }[] = [
  { value: "beginner", label: "Cơ bản", stars: 1 },
  { value: "intermediate", label: "Trung bình", stars: 2 },
  { value: "advanced", label: "Nâng cao", stars: 3 },
];
const SORT_OPTIONS = [
  { value: "downloads", label: "Tải nhiều nhất" },
  { value: "views", label: "Xem nhiều nhất" },
  { value: "likes", label: "Yêu thích nhất" },
  { value: "newest", label: "Mới nhất" },
];

export default function SheetsPage() {
  const [query, setQuery] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [rhythmFilter, setRhythmFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sort, setSort] = useState("downloads");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleInstrument = (v: string) =>
    setInstruments((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    );
  const toggleDifficulty = (v: Difficulty) =>
    setDifficulties((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    );

  const filtered = useMemo(() => {
    let list = [...SHEETS];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.name.toLowerCase().includes(q),
      );
    }
    if (instruments.length)
      list = list.filter((s) =>
        instruments.some((i) => s.instruments.includes(i)),
      );
    if (difficulties.length)
      list = list.filter((s) => difficulties.includes(s.difficulty));
    if (rhythmFilter) list = list.filter((s) => s.rhythm.id === rhythmFilter);
    if (genreFilter) list = list.filter((s) => s.genre.id === genreFilter);

    list.sort((a, b) => {
      if (sort === "downloads") return b.downloads - a.downloads;
      if (sort === "views") return b.views - a.views;
      if (sort === "likes") return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [query, instruments, difficulties, rhythmFilter, genreFilter, sort]);

  const activeFilterCount =
    instruments.length +
    difficulties.length +
    (rhythmFilter ? 1 : 0) +
    (genreFilter ? 1 : 0);

  const clearAll = () => {
    setInstruments([]);
    setDifficulties([]);
    setRhythmFilter("");
    setGenreFilter("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-4">
          <FileMusic className="w-4 h-4" />
          Thư viện bản nhạc
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Tìm &amp; Tải{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Bản Nhạc
          </span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Hàng nghìn bản nhạc guitar, ukulele, piano — xem trước và tải PDF miễn
          phí.
        </p>

        {/* Hero search */}
        <div className="mt-6 max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên bài hát, nghệ sĩ..."
            className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-base"
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 mt-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Guitar className="w-4 h-4 text-purple-400" />
            {formatNumber(SHEETS.reduce((s, x) => s + x.downloads, 0))} lượt tải
          </span>
          <span className="flex items-center gap-1.5">
            <Music2 className="w-4 h-4 text-purple-400" />
            {SHEETS.length} bản nhạc
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-purple-400" />
            Miễn phí 100%
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-5">
          <FilterPanel
            instruments={instruments}
            difficulties={difficulties}
            rhythmFilter={rhythmFilter}
            genreFilter={genreFilter}
            onToggleInstrument={toggleInstrument}
            onToggleDifficulty={toggleDifficulty}
            onRhythm={setRhythmFilter}
            onGenre={setGenreFilter}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  "lg:hidden flex items-center gap-1.5 btn-secondary text-sm py-1.5",
                  activeFilterCount > 0 && "border-purple-500 text-purple-300",
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" /> Xóa bộ lọc
                </button>
              )}

              <span className="text-sm text-gray-500">
                {filtered.length} bản nhạc
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-purple-500 appearance-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Layout toggle */}
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setLayout("grid")}
                  className={cn(
                    "p-1.5 transition-colors",
                    layout === "grid"
                      ? "bg-purple-700 text-white"
                      : "text-gray-500 hover:text-gray-300",
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout("list")}
                  className={cn(
                    "p-1.5 transition-colors",
                    layout === "list"
                      ? "bg-purple-700 text-white"
                      : "text-gray-500 hover:text-gray-300",
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filterOpen && (
            <div className="lg:hidden card p-4 mb-4">
              <FilterPanel
                instruments={instruments}
                difficulties={difficulties}
                rhythmFilter={rhythmFilter}
                genreFilter={genreFilter}
                onToggleInstrument={toggleInstrument}
                onToggleDifficulty={toggleDifficulty}
                onRhythm={setRhythmFilter}
                onGenre={setGenreFilter}
              />
            </div>
          )}

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy bản nhạc phù hợp.</p>
              <button
                onClick={() => {
                  setQuery("");
                  clearAll();
                }}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : layout === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} variant="list" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Filter panel (shared desktop/mobile) ── */
interface FilterPanelProps {
  instruments: string[];
  difficulties: Difficulty[];
  rhythmFilter: string;
  genreFilter: string;
  onToggleInstrument: (v: string) => void;
  onToggleDifficulty: (v: Difficulty) => void;
  onRhythm: (v: string) => void;
  onGenre: (v: string) => void;
}

function FilterPanel({
  instruments,
  difficulties,
  rhythmFilter,
  genreFilter,
  onToggleInstrument,
  onToggleDifficulty,
  onRhythm,
  onGenre,
}: FilterPanelProps) {
  return (
    <div className="space-y-5 text-sm">
      {/* Instrument */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Nhạc cụ
        </p>
        <div className="space-y-1.5">
          {INSTRUMENTS.map((inst) => (
            <label
              key={inst}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={instruments.includes(inst)}
                onChange={() => onToggleInstrument(inst)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              <span className="capitalize text-gray-300 group-hover:text-white transition-colors">
                {inst}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Độ khó
        </p>
        <div className="space-y-1.5">
          {DIFFICULTIES.map(({ value, label, stars }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={difficulties.includes(value)}
                onChange={() => onToggleDifficulty(value)}
                className="accent-purple-500 w-4 h-4 rounded"
              />
              <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < stars ? "text-yellow-400" : "text-gray-600",
                    )}
                    fill={i < stars ? "currentColor" : "none"}
                  />
                ))}
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rhythm */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Điệu
        </p>
        <div className="space-y-1">
          {["", ...RHYTHMS.slice(0, 6).map((r) => r.id)].map((id) => {
            const rhythm = RHYTHMS.find((r) => r.id === id);
            return (
              <button
                key={id}
                onClick={() => onRhythm(id)}
                className={cn(
                  "w-full text-left px-2 py-1 rounded transition-colors",
                  rhythmFilter === id
                    ? "bg-purple-700/40 text-purple-300"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                {id === "" ? "Tất cả" : rhythm?.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Thể loại
        </p>
        <div className="space-y-1">
          {["", ...GENRES.slice(0, 5).map((g) => g.id)].map((id) => {
            const genre = GENRES.find((g) => g.id === id);
            return (
              <button
                key={id}
                onClick={() => onGenre(id)}
                className={cn(
                  "w-full text-left px-2 py-1 rounded transition-colors",
                  genreFilter === id
                    ? "bg-purple-700/40 text-purple-300"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                {id === "" ? "Tất cả" : genre?.name}
              </button>
            );
          })}
        </div>
      </div>

      <Link
        to="/find-by-chord"
        className="block text-center text-xs text-purple-400 hover:text-purple-300 transition-colors border border-purple-700/30 rounded-lg py-2"
      >
        🎸 Tìm bài theo hợp âm
      </Link>
    </div>
  );
}
