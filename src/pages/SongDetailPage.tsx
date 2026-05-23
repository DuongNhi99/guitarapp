import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Eye,
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Music2,
  User,
  Clock,
  Tag,
  PlayCircle,
  ChevronRight,
  Printer,
} from "lucide-react";
import { SONGS, CHORD_DIAGRAMS } from "../data/mockData";
import { formatNumber, formatDate, transposeChord } from "../utils";
import ChordViewer from "../components/ChordViewer";
import ChordDiagramView from "../components/ChordDiagram";
import SongCard from "../components/SongCard";

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(15);
  const [liked, setLiked] = useState(false);
  const [showAllChords, setShowAllChords] = useState(false);

  const song = SONGS.find((s) => s.id === Number(id));

  if (!song) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Music2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Không tìm thấy bài hát
        </h2>
        <p className="text-gray-400 mb-6">
          Bài hát bạn tìm có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Link to="/songs" className="btn-primary">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const transposedChords = song.chords.map((c) => transposeChord(c, transpose));
  const relatedSongs = SONGS.filter(
    (s) => s.id !== song.id && s.rhythm.id === song.rhythm.id,
  ).slice(0, 5);
  const displayedChords = showAllChords
    ? transposedChords
    : transposedChords.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/songs" className="hover:text-white transition-colors">
          Bài hát
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 truncate">{song.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Song header */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                <Music2 className="w-7 h-7 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {song.title}
                </h1>
                <Link
                  to={`/artists/${song.artist.id}/${song.artist.slug}`}
                  className="text-purple-400 hover:text-purple-300 font-medium mt-1 block transition-colors"
                >
                  {song.artist.name}
                </Link>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(song.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(song.views)} lượt xem
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Điệu {song.rhythm.name}
              </span>
              {song.capo !== undefined && song.capo > 0 && (
                <span className="tag">Capo {song.capo}</span>
              )}
              <span className="tag">{song.tone}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  liked
                    ? "bg-pink-900/40 text-pink-400 border border-pink-700/50"
                    : "btn-secondary"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-pink-400" : ""}`} />
                <span>
                  {liked
                    ? formatNumber(song.likes + 1)
                    : formatNumber(song.likes)}
                </span>
              </button>
              <button className="btn-secondary text-sm py-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
              <button className="btn-ghost text-sm py-2">
                <Printer className="w-4 h-4" />
                In
              </button>
            </div>
          </div>

          {/* Chord controls */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-4">
              {/* Transpose */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium min-w-[80px]">
                  Chuyển tông
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTranspose((t) => t - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-300" />
                  </button>
                  <span
                    className={`w-8 text-center text-sm font-bold ${transpose !== 0 ? "text-purple-400" : "text-white"}`}
                  >
                    {transpose > 0 ? `+${transpose}` : transpose}
                  </span>
                  <button
                    onClick={() => setTranspose((t) => t + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                  </button>
                  {transpose !== 0 && (
                    <button
                      onClick={() => setTranspose(0)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Capo */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-medium min-w-[44px]">
                  Capo
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCapo((c) => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-300" />
                  </button>
                  <span
                    className={`w-8 text-center text-sm font-bold ${capo !== 0 ? "text-green-400" : "text-white"}`}
                  >
                    {capo}
                  </span>
                  <button
                    onClick={() => setCapo((c) => Math.min(12, c + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Font size */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-400">Cỡ chữ</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize((f) => Math.min(24, f + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chord list */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">
                Hợp âm sử dụng
              </h3>
              {transposedChords.length > 8 && (
                <button
                  onClick={() => setShowAllChords(!showAllChords)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showAllChords
                    ? "Thu gọn"
                    : `Xem tất cả (${transposedChords.length})`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayedChords.map((chord) => (
                <Link
                  key={chord}
                  to={`/chords/${chord}`}
                  className="bg-purple-900/30 text-purple-300 border border-purple-700/40 hover:bg-purple-800/40 hover:border-purple-600/50 px-3 py-1.5 rounded-lg font-mono font-bold text-sm transition-colors"
                >
                  {chord}
                </Link>
              ))}
            </div>
          </div>

          {/* Lyrics with chords */}
          <div className="card p-6">
            <div style={{ fontSize: `${fontSize}px` }}>
              <ChordViewer content={song.content} transpose={transpose} />
            </div>
          </div>

          {/* Contributors */}
          <div className="card p-4 flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Đóng góp bởi:</span>
            {song.contributors.map((c) => (
              <Link
                key={c}
                to={`/profile/${c}`}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chord diagrams */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-4">Sơ Đồ Hợp Âm</h3>
            <div className="grid grid-cols-3 gap-4">
              {transposedChords.slice(0, 9).map((chord) =>
                CHORD_DIAGRAMS[chord] ? (
                  <div key={chord} className="flex flex-col items-center">
                    <ChordDiagramView chord={CHORD_DIAGRAMS[chord]} size="sm" />
                  </div>
                ) : (
                  <div key={chord} className="flex flex-col items-center py-2">
                    <span className="text-xs font-bold text-white">
                      {chord}
                    </span>
                    <div className="w-16 h-16 border border-dashed border-gray-700 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">?</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* YouTube embed placeholder */}
          {song.youtubeId && (
            <div className="card p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-red-500" />
                Video
              </h3>
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${song.youtubeId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={song.title}
                />
              </div>
            </div>
          )}

          {/* Related songs */}
          {relatedSongs.length > 0 && (
            <div className="card p-4">
              <h3 className="text-white font-semibold mb-3">
                Cùng Điệu {song.rhythm.name}
              </h3>
              <div className="space-y-1">
                {relatedSongs.map((s) => (
                  <SongCard key={s.id} song={s} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
