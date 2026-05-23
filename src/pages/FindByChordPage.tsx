import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { SONGS, ALL_CHORDS } from "../data/mockData";
import SongCard from "../components/SongCard";
import { cn } from "../utils";

export default function FindByChordPage() {
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [mode, setMode] = useState<"all" | "any">("any");

  const toggleChord = (chord: string) => {
    setSelectedChords((prev) =>
      prev.includes(chord) ? prev.filter((c) => c !== chord) : [...prev, chord],
    );
  };

  const results = useMemo(() => {
    if (selectedChords.length === 0) return [];
    if (mode === "all") {
      return SONGS.filter((s) =>
        selectedChords.every((c) => s.chords.includes(c)),
      );
    }
    return SONGS.filter((s) =>
      selectedChords.some((c) => s.chords.includes(c)),
    );
  }, [selectedChords, mode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">Tìm theo hợp âm</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Tìm Bài Hát Theo Hợp Âm
        </h1>
        <p className="text-gray-400 text-sm">
          Chọn các hợp âm bạn biết để tìm bài hát phù hợp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chord selector */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Chọn hợp âm</h3>
              {selectedChords.length > 0 && (
                <button
                  onClick={() => setSelectedChords([])}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Selected chords */}
            {selectedChords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-gray-800/50 rounded-lg">
                {selectedChords.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => toggleChord(chord)}
                    className="flex items-center gap-1 bg-purple-700 text-white text-xs px-2.5 py-1 rounded font-mono font-bold hover:bg-purple-600 transition-colors"
                  >
                    {chord}
                    <span className="text-purple-300">×</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mode selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("any")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  mode === "any"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700",
                )}
              >
                Có ít nhất 1
              </button>
              <button
                onClick={() => setMode("all")}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  mode === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700",
                )}
              >
                Có tất cả
              </button>
            </div>

            {/* All chords */}
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
              {ALL_CHORDS.map((chord) => (
                <button
                  key={chord}
                  onClick={() => toggleChord(chord)}
                  className={cn(
                    "font-mono text-sm px-3 py-1.5 rounded-lg font-bold transition-colors",
                    selectedChords.includes(chord)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {selectedChords.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">
                Chọn hợp âm để tìm bài hát
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Chọn các hợp âm bạn biết ở bên trái
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-medium">
                  {results.length} bài hát phù hợp
                </p>
              </div>
              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-400">
                    Không tìm thấy bài hát nào phù hợp
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Thử đổi sang chế độ "Có ít nhất 1"
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
