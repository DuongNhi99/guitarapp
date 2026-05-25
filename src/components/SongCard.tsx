import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, Music2 } from "lucide-react";
import type { Song } from "../types";
import { formatNumber, cn } from "../utils";

interface SongCardProps {
  song: Song;
  variant?: "default" | "compact" | "horizontal";
  rank?: number;
}

export default function SongCard({
  song,
  variant = "default",
  rank,
}: SongCardProps) {
  const navigate = useNavigate();

  if (variant === "compact") {
    return (
      <Link
        to={`/songs/${song.id}/${song.slug}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/60 transition-colors group"
      >
        {rank && (
          <span
            className={cn(
              "w-6 h-6 flex items-center justify-center text-xs font-bold rounded flex-shrink-0",
              rank === 1
                ? "bg-yellow-500/20 text-yellow-400"
                : rank === 2
                  ? "bg-gray-400/20 text-gray-300"
                  : rank === 3
                    ? "bg-orange-600/20 text-orange-400"
                    : "text-gray-500",
            )}
          >
            {rank}
          </span>
        )}
        <div className="w-9 h-9 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/20">
          <Music2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
            {song.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{song.artist.name}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
          <Eye className="w-3 h-3" />
          <span>{formatNumber(song.views)}</span>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        to={`/songs/${song.id}/${song.slug}`}
        className="card flex gap-4 p-4 hover:scale-[1.01] group"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
          <Music2 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors mb-0.5">
            {song.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{song.artist.name}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="tag text-xs">{song.rhythm.name}</span>
            <div className="flex flex-wrap gap-1">
              {song.chords.slice(0, 4).map((chord) => (
                <span
                  key={chord}
                  className="text-xs bg-purple-900/30 text-purple-300 border border-purple-700/30 px-1.5 py-0.5 rounded font-mono"
                >
                  {chord}
                </span>
              ))}
              {song.chords.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{song.chords.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(song.views)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(song.likes)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <div
      onClick={() => navigate(`/songs/${song.id}/${song.slug}`)}
      className="card p-4 flex flex-col gap-3 hover:scale-[1.02] group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
          <Music2 className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {song.title}
          </h3>
          <Link
            to={`/artists/${song.artist.id}/${song.artist.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors truncate block"
          >
            {song.artist.name}
          </Link>
        </div>
      </div>

      {/* Chord tags */}
      <div className="flex flex-wrap gap-1.5">
        {song.chords.slice(0, 5).map((chord) => (
          <span
            key={chord}
            className="text-xs bg-purple-900/30 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-md font-mono font-medium"
          >
            {chord}
          </span>
        ))}
        {song.chords.length > 5 && (
          <span className="text-xs text-gray-500 py-0.5">
            +{song.chords.length - 5}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <span className="tag text-xs">{song.rhythm.name}</span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNumber(song.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {formatNumber(song.likes)}
          </span>
        </div>
      </div>
    </div>
  );
}
