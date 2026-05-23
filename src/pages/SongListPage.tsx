import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { SONGS, RHYTHMS, GENRES } from "../data/mockData";
import SongCard from "../components/SongCard";
import { cn } from "../utils";

const SORT_OPTIONS = [
  { value: "trending", label: "Nổi bật nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "views", label: "Nhiều lượt xem" },
  { value: "likes", label: "Nhiều yêu thích" },
];

export default function SongListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "trending";
  const rhythm = searchParams.get("rhythm") || "";
  const genre = searchParams.get("genre") || "";

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...SONGS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.name.toLowerCase().includes(q) ||
          s.chords.some((c) => c.toLowerCase() === q),
      );
    }
    if (rhythm) list = list.filter((s) => s.rhythm.id === rhythm);
    if (genre) list = list.filter((s) => s.genre.id === genre);

    switch (sort) {
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "views":
        list.sort((a, b) => b.views - a.views);
        break;
      case "likes":
        list.sort((a, b) => b.likes - a.likes);
        break;
      default:
        list.sort((a, b) => b.views - a.views);
    }
    return list;
  }, [query, sort, rhythm, genre]);

  const hasFilters = rhythm || genre;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">Bài hát</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {query ? `Kết quả tìm: "${query}"` : "Danh Sách Bài Hát"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {filtered.length} bài hát
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="input text-sm py-2 px-3 w-auto bg-gray-800 border-gray-700"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              "btn-secondary text-sm py-2",
              filterOpen &&
                "bg-purple-900/30 border-purple-700/50 text-purple-300 border",
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Lọc
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="card p-4 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 font-medium block mb-2">
                Điệu
              </label>
              <div className="flex flex-wrap gap-2">
                {RHYTHMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      setParam("rhythm", r.id === rhythm ? "" : r.id)
                    }
                    className={cn(
                      "tag",
                      r.id === rhythm &&
                        "bg-purple-900/50 text-purple-300 border border-purple-700/50",
                    )}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-medium block mb-2">
                Thể loại
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() =>
                      setParam("genre", g.id === genre ? "" : g.id)
                    }
                    className={cn(
                      "tag",
                      g.id === genre &&
                        "bg-purple-900/50 text-purple-300 border border-purple-700/50",
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hasFilters && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
              <span className="text-sm text-gray-400">Đang lọc:</span>
              {rhythm && (
                <button
                  onClick={() => setParam("rhythm", "")}
                  className="flex items-center gap-1 bg-purple-900/40 text-purple-300 text-xs px-2.5 py-1 rounded-full border border-purple-700/50"
                >
                  {RHYTHMS.find((r) => r.id === rhythm)?.name}
                  <X className="w-3 h-3" />
                </button>
              )}
              {genre && (
                <button
                  onClick={() => setParam("genre", "")}
                  className="flex items-center gap-1 bg-purple-900/40 text-purple-300 text-xs px-2.5 py-1 rounded-full border border-purple-700/50"
                >
                  {GENRES.find((g) => g.id === genre)?.name}
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Song grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">
            Không tìm thấy bài hát nào
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Thử tìm kiếm với từ khóa khác
          </p>
        </div>
      )}
    </div>
  );
}
