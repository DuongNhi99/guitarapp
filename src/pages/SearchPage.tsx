import { useSearchParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { Search as SearchIcon, ChevronRight } from "lucide-react";
import { SONGS } from "../data/mockData";
import SongCard from "../components/SongCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.name.toLowerCase().includes(q) ||
        s.chords.some((c) => c.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">Tìm kiếm</span>
      </nav>

      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (
            e.currentTarget.elements.namedItem("q") as HTMLInputElement
          ).value;
          if (q.trim()) setSearchParams({ q: q.trim() });
        }}
        className="relative max-w-xl mb-8"
      >
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Tìm bài hát, nghệ sĩ, hợp âm..."
          className="input pl-12 py-3 text-base"
          autoFocus
        />
      </form>

      {query ? (
        <>
          <h1 className="text-xl font-bold text-white mb-1">
            Kết quả tìm kiếm: <span className="text-purple-400">"{query}"</span>
          </h1>
          <p className="text-gray-400 text-sm mb-6">{results.length} kết quả</p>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">
                Không tìm thấy kết quả
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-300 text-xl font-medium mb-2">
            Tìm kiếm bài hát
          </p>
          <p className="text-gray-500 text-sm">
            Nhập tên bài hát, nghệ sĩ hoặc hợp âm để tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}
