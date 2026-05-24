import { Link } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Flame,
  Star,
} from "lucide-react";
import SongCard from "../components/SongCard";
import {
  SONGS,
  TRENDING_SONGS,
  NEW_SONGS,
  RHYTHMS,
  ARTISTS,
} from "../data/mockData";
import { formatNumber } from "../utils";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-gray-900 to-pink-900/20 border border-purple-800/30 p-6 sm:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" />
            Nền tảng hợp âm #1 Việt Nam
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Abbaguitar
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              mọi bài hát
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-6 leading-relaxed">
            Khám phá hơn <strong className="text-white">80,000+ bài hát</strong>{" "}
            với hợp âm guitar đầy đủ, chuẩn xác. Transpose, capo và sơ đồ hợp âm
            tích hợp.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/songs" className="btn-primary">
              <Star className="w-4 h-4" />
              Khám phá bài hát
            </Link>
            <Link to="/submit" className="btn-secondary">
              Đăng hợp âm
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { value: "80K+", label: "Bài hát" },
              { value: "15K+", label: "Nghệ sĩ" },
              { value: "500K+", label: "Lượt xem/ngày" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Trending Songs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Bài Hát Nổi Bật
              </h2>
              <Link
                to="/songs?sort=trending"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRENDING_SONGS.map((song) => (
                <SongCard key={song.id} song={song} variant="horizontal" />
              ))}
            </div>
          </section>

          {/* New Songs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Hợp Âm Mới
              </h2>
              <Link
                to="/songs?sort=newest"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NEW_SONGS.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </section>

          {/* Browse by Rhythm */}
          <section>
            <h2 className="section-title">
              <Clock className="w-5 h-5 text-green-400" />
              Điệu Bài Hát
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {RHYTHMS.map((rhythm) => (
                <Link
                  key={rhythm.id}
                  to={`/rhythms/${rhythm.id}`}
                  className="card p-4 text-center hover:border-purple-700/50 hover:bg-purple-900/10 group"
                >
                  <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {rhythm.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(rhythm.songCount || 0)} bài
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top trending today */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Mới Nổi Hôm Nay
            </h3>
            <div className="space-y-1">
              {SONGS.slice(0, 8).map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  variant="compact"
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Top Artists */}
          <div className="card p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Nghệ Sĩ Nổi Bật
            </h3>
            <div className="space-y-2">
              {ARTISTS.slice(0, 8).map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artists/${artist.id}/${artist.slug}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-pink-600/40 border border-purple-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-300">
                        {artist.name[0]}
                      </span>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate max-w-[140px]">
                      {artist.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {artist.songCount}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/artists"
              className="flex items-center justify-center gap-1 mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors pt-3 border-t border-gray-800"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
