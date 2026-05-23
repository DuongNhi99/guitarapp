import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Download,
  Heart,
  Share2,
  Printer,
  Star,
  Guitar,
  Music2,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Eye,
  Clock,
  FileMusic,
  User,
  BookOpen,
} from "lucide-react";
import { SHEETS } from "../data/mockData";
import { formatNumber, formatDate, transposeChord } from "../utils";
import { printSheetMusic } from "../utils/printSheet";
import SheetViewer from "../components/SheetViewer";
import SheetCard from "../components/SheetCard";
import type { Difficulty } from "../types";

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

export default function SheetPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [liked, setLiked] = useState(false);

  const sheet = SHEETS.find((s) => s.id === Number(id));

  if (!sheet) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FileMusic className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Không tìm thấy bản nhạc
        </h2>
        <Link to="/sheets" className="btn-primary mt-4 inline-flex">
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  const transposedChords = sheet.chords.map((c) =>
    transposeChord(c, transpose),
  );
  const relatedSheets = SHEETS.filter(
    (s) => s.id !== sheet.id && s.rhythm.id === sheet.rhythm.id,
  ).slice(0, 4);

  const stars = DIFFICULTY_STARS[sheet.difficulty];

  /* Build a Song-like object for printSheetMusic */
  const songLike = {
    ...sheet,
    id: sheet.songId,
    youtubeId: undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/sheets" className="hover:text-white transition-colors">
          Bản nhạc
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 truncate">{sheet.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                <FileMusic className="w-7 h-7 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {sheet.title}
                </h1>
                <Link
                  to={`/artists/${sheet.artist.id}/${sheet.artist.slug}`}
                  className="text-purple-400 hover:text-purple-300 font-medium mt-1 block transition-colors"
                >
                  {sheet.artist.name}
                </Link>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(sheet.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(sheet.views)} lượt xem
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {formatNumber(sheet.downloads)} lượt tải
              </span>
              <span className="tag">{sheet.tone}</span>
              <span className="tag">Điệu {sheet.rhythm.name}</span>
              {sheet.capo > 0 && <span className="tag">Capo {sheet.capo}</span>}
            </div>

            {/* Instruments + difficulty */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                {sheet.instruments.map((inst) => (
                  <span
                    key={inst}
                    className="flex items-center gap-1 text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full capitalize"
                  >
                    <Guitar className="w-3.5 h-3.5 text-purple-400" />
                    {inst}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < stars ? "text-yellow-400" : "text-gray-600"}`}
                    fill={i < stars ? "currentColor" : "none"}
                  />
                ))}
                <span className="text-gray-400 ml-1">
                  {DIFFICULTY_LABEL[sheet.difficulty]}
                </span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  printSheetMusic(songLike as never, transpose, capo)
                }
                className="btn-primary text-sm py-2 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải PDF
              </button>
              <button
                onClick={() =>
                  printSheetMusic(songLike as never, transpose, capo)
                }
                className="btn-secondary text-sm py-2"
              >
                <Printer className="w-4 h-4" />
                In bản nhạc
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  liked
                    ? "bg-pink-900/40 text-pink-400 border border-pink-700/50"
                    : "btn-secondary"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-pink-400" : ""}`} />
                {liked
                  ? formatNumber(sheet.likes + 1)
                  : formatNumber(sheet.likes)}
              </button>
              <button className="btn-ghost text-sm py-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
              <Link
                to={`/songs/${sheet.songId}/${sheet.slug}`}
                className="btn-ghost text-sm py-2 flex items-center gap-2"
              >
                <Music2 className="w-4 h-4" />
                Xem hợp âm
              </Link>
            </div>
          </div>

          {/* Controls */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Transpose */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 min-w-[80px]">
                  Chuyển tông
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTranspose((t) => t - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
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
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-gray-300" />
                  </button>
                  {transpose !== 0 && (
                    <button
                      onClick={() => setTranspose(0)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Capo */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 min-w-[44px]">Capo</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCapo((c) => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
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
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
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
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize((f) => Math.min(22, f + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chords used */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Hợp âm sử dụng
            </h3>
            <div className="flex flex-wrap gap-2">
              {transposedChords.map((chord) => (
                <Link
                  key={chord}
                  to={`/chords/${chord}`}
                  className="bg-purple-900/30 text-purple-300 border border-purple-700/40 hover:bg-purple-800/40 px-3 py-1.5 rounded-lg font-mono font-bold text-sm transition-colors"
                >
                  {chord}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Sheet viewer (paper style) ── */}
          <div className="card overflow-hidden">
            {/* Paper header */}
            <div className="bg-gradient-to-r from-purple-900/30 to-gray-900/30 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">{sheet.title}</h2>
                <p className="text-purple-400 text-sm">{sheet.artist.name}</p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                <p>
                  Giọng: <span className="text-gray-300">{sheet.tone}</span>
                </p>
                {capo > 0 && (
                  <p>
                    Capo: <span className="text-green-400">{capo}</span>
                  </p>
                )}
                {transpose !== 0 && (
                  <p>
                    Chuyển:{" "}
                    <span className="text-purple-400">
                      {transpose > 0 ? "+" : ""}
                      {transpose}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Viewer body */}
            <div className="p-6 bg-gray-950/50">
              <SheetViewer
                content={sheet.content}
                transpose={transpose}
                fontSize={fontSize}
              />
            </div>

            {/* Footer bar */}
            <div className="bg-gray-900/50 border-t border-gray-800 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Đóng góp bởi:{" "}
                {sheet.contributors.map((c) => (
                  <span key={c} className="text-purple-400 ml-1">
                    @{c}
                  </span>
                ))}
              </span>
              <button
                onClick={() =>
                  printSheetMusic(songLike as never, transpose, capo)
                }
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải PDF
              </button>
            </div>
          </div>

          {/* Tags */}
          {sheet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <BookOpen className="w-4 h-4 text-gray-500" />
              {sheet.tags.map((tag) => (
                <span key={tag} className="tag text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Contributor */}
          <div className="card p-4 flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Đóng góp:</span>
            {sheet.contributors.map((c) => (
              <span key={c} className="text-sm font-medium text-purple-400">
                @{c}
              </span>
            ))}
          </div>

          {/* Sheet info */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-white text-sm">
              Thông tin bản nhạc
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Giọng gốc", value: sheet.tone },
                { label: "Điệu", value: sheet.rhythm.name },
                { label: "Thể loại", value: sheet.genre.name },
                { label: "Số trang", value: `${sheet.pages} trang` },
                {
                  label: "Độ khó",
                  value: DIFFICULTY_LABEL[sheet.difficulty],
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related sheets */}
          {relatedSheets.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-white mb-3 text-sm">
                Bản nhạc liên quan
              </h3>
              <div className="space-y-2">
                {relatedSheets.map((s) => (
                  <SheetCard key={s.id} sheet={s} variant="list" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
