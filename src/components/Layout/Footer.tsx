import { Link } from "react-router-dom";
import { Guitar, Heart, ExternalLink } from "lucide-react";
import { RHYTHMS, GENRES } from "../../data/mockData";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Guitar className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Abba<span className="text-purple-400">guitar</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nền tảng hợp âm guitar lớn nhất Việt Nam. Hàng chục nghìn bài hát
              với hợp âm chuẩn xác, dễ học.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Đăng bài hát
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Rhythm links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">
              Điệu Bài Hát
            </h3>
            <ul className="space-y-2">
              {RHYTHMS.slice(0, 8).map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/rhythms/${r.id}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-between group"
                  >
                    <span>Điệu {r.name}</span>
                    <span className="text-gray-600 group-hover:text-gray-400 text-xs">
                      {r.songCount?.toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genre links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Thể Loại</h3>
            <ul className="space-y-2">
              {GENRES.map((g) => (
                <li key={g.id}>
                  <Link
                    to={`/genres/${g.id}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-between group"
                  >
                    <span>{g.name}</span>
                    <span className="text-gray-600 group-hover:text-gray-400 text-xs">
                      {g.songCount?.toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Khám Phá</h3>
            <ul className="space-y-2">
              {[
                { label: "Bài hát mới nhất", href: "/songs?sort=newest" },
                { label: "Bài hát nổi bật", href: "/songs?sort=trending" },
                { label: "Tìm theo hợp âm", href: "/find-by-chord" },
                { label: "Hướng dẫn guitar", href: "/guide" },
                { label: "Hợp âm guitar", href: "/chords" },
                { label: "Tải ứng dụng", href: "/apps" },
                { label: "Yêu cầu hợp âm", href: "/request" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Abbaguitar. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with{" "}
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for
            music lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
