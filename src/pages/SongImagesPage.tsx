import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Music2, ZoomIn } from "lucide-react";
import { SONGS } from "../data/mockData";
import type { Song } from "../types";
import { cn } from "../utils";

const imageSongs = SONGS.filter((s) => s.sheetImage);

export default function SongImagesPage() {
  const [selected, setSelected] = useState<Song | null>(null);
  const [zoom, setZoom] = useState(false);

  const selectedIdx = selected ? imageSongs.findIndex((s) => s.id === selected.id) : -1;

  const prev = useCallback(() => {
    if (selectedIdx > 0) { setSelected(imageSongs[selectedIdx - 1]); setZoom(false); }
  }, [selectedIdx]);

  const next = useCallback(() => {
    if (selectedIdx < imageSongs.length - 1) { setSelected(imageSongs[selectedIdx + 1]); setZoom(false); }
  }, [selectedIdx]);

  const close = useCallback(() => { setSelected(null); setZoom(false); }, []);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, prev, next, close]);

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Hình Hợp Âm</h1>
            <p className="text-gray-500 text-sm mt-1">{imageSongs.length} bài hát</p>
          </div>
          <Link
            to="/songs"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
          >
            <Music2 className="w-4 h-4" />
            Danh sách bài hát
          </Link>
        </div>

        {/* Grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {imageSongs.map((song) => (
            <button
              key={song.id}
              onClick={() => { setSelected(song); setZoom(false); }}
              className="break-inside-avoid w-full group relative rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/60 transition-all duration-200 shadow-lg hover:shadow-purple-900/20 block"
            >
              <img
                src={song.sheetImage}
                alt={song.title}
                className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-white text-xs font-bold leading-tight line-clamp-2">{song.title}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{song.artist.name}</p>
              </div>
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          ))}
        </div>

        {imageSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Music2 className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">
              Chưa có hình hợp âm nào.
              <br />
              Đặt ảnh vào thư mục <code className="text-purple-400">public/sheets/</code>
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={close}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-white font-bold text-sm leading-tight">{selected.title}</p>
              <p className="text-gray-400 text-xs">{selected.artist.name} · {selected.tone} · {selected.rhythm.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-xs">{selectedIdx + 1} / {imageSongs.length}</span>
              <Link
                to={`/songs/${selected.id}/${selected.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
              >
                Xem hợp âm
              </Link>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center px-12 py-2 min-h-0 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.sheetImage}
              alt={selected.title}
              onClick={() => setZoom((v) => !v)}
              className={cn(
                "rounded-lg shadow-2xl cursor-zoom-in transition-all duration-200",
                zoom
                  ? "max-w-none max-h-none w-auto h-auto cursor-zoom-out"
                  : "max-h-full max-w-full object-contain",
              )}
            />
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={selectedIdx === 0}
            className="fixed left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={selectedIdx === imageSongs.length - 1}
            className="fixed right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Bottom thumbnails */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {imageSongs.map((song, i) => (
              <button
                key={song.id}
                onClick={() => { setSelected(song); setZoom(false); }}
                className={cn(
                  "flex-shrink-0 w-12 h-14 rounded-lg overflow-hidden border-2 transition-all",
                  i === selectedIdx
                    ? "border-purple-500 opacity-100 scale-105"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <img src={song.sheetImage} alt={song.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
