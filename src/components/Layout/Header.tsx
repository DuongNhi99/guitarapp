import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  //   Music2,
  Guitar,
  //   BookOpen,
  //   Radio,
  FileMusic,
  Sliders,
  Sun,
  Moon,
  Image,
  Coffee,
} from "lucide-react";
import { cn } from "../../utils";
import { useTheme } from "../../contexts/ThemeContext";

const navItems = [
  //   { label: "Bài hát", href: "/songs", icon: Music2 },
  { label: "Bài hát", href: "/song-images", icon: Image },
  { label: "Bản nhạc", href: "/sheets", icon: FileMusic },
  //   { label: "Hợp âm", href: "/chords", icon: Guitar },
  { label: "Guitar", href: "/guitar", icon: Sliders },
  //   { label: "Điệu", href: "/rhythms", icon: Radio },
  //   { label: "Thể loại", href: "/genres", icon: BookOpen },
  { label: "Buy me a coffee!", href: "/donate", icon: Coffee },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Guitar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">
              Abba<span className="text-purple-400">guitar</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-link px-3 py-2 rounded-lg flex items-center gap-1.5",
                  location.pathname.startsWith(item.href) ||
                    (item.href === "/guitar" && location.pathname === "/")
                    ? "text-purple-400 bg-purple-900/20 font-semibold"
                    : "hover:bg-gray-800",
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-auto lg:mr-4"
          >
            <div
              className={cn(
                "relative flex items-center rounded-lg border transition-all duration-200",
                searchFocused
                  ? "border-purple-500 bg-gray-800"
                  : "border-gray-700 bg-gray-900",
              )}
            >
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Tìm bài hát, nghệ sĩ..."
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </form>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost p-2 hidden lg:flex"
            title={
              theme === "dark"
                ? "Chuyển sang chế độ sáng"
                : "Chuyển sang chế độ tối"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-500" />
            )}
          </button>

          {/* Auth buttons - desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm py-1.5">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn-primary text-sm py-1.5">
              Đăng ký
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                  location.pathname.startsWith(item.href) ||
                    (item.href === "/guitar" && location.pathname === "/")
                    ? "text-purple-400 bg-purple-900/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-800 flex gap-2">
              <button
                onClick={toggleTheme}
                className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" /> Chế độ sáng
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-500" /> Chế độ tối
                  </>
                )}
              </button>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center btn-secondary text-sm py-2.5"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center btn-primary text-sm py-2.5"
              >
                Đăng ký
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
