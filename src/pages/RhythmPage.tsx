import { Link, useParams } from "react-router-dom";
import { ChevronRight, Music2 } from "lucide-react";
import { SONGS, RHYTHMS } from "../data/mockData";
import SongCard from "../components/SongCard";

export default function RhythmPage() {
  const { id } = useParams<{ id?: string }>();
  const selectedRhythm = id ? RHYTHMS.find((r) => r.id === id) : null;

  const songs = id ? SONGS.filter((s) => s.rhythm.id === id) : SONGS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/rhythms" className="hover:text-white transition-colors">
          Điệu bài hát
        </Link>
        {selectedRhythm && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{selectedRhythm.name}</span>
          </>
        )}
      </nav>

      {!id ? (
        // Rhythm list
        <>
          <h1 className="text-2xl font-bold text-white mb-6">Điệu Bài Hát</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {RHYTHMS.map((rhythm) => (
              <Link
                key={rhythm.id}
                to={`/rhythms/${rhythm.id}`}
                className="card p-6 text-center hover:border-purple-700/50 hover:bg-purple-900/10 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                  <Music2 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                  Điệu {rhythm.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(rhythm.songCount || 0).toLocaleString()} bài
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : (
        // Songs in rhythm
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Điệu {selectedRhythm?.name}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {songs.length} bài hát trong danh sách
              </p>
            </div>
          </div>

          {songs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">
                Chưa có bài hát nào trong điệu này
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
