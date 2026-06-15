import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  X, ChevronLeft, ChevronRight, Music2, Upload, Loader2,
  Search, ImageIcon, Pencil, Trash2, AlertCircle, ZoomIn,
  Folder, FolderPlus, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { SheetImage } from "../lib/supabase";
import { SONGS } from "../data/mockData";
import { cn } from "../utils";

const songBySlug = Object.fromEntries(SONGS.map((s) => [s.slug, s]));
const PER_PAGE = 20;

function storagePath(imageUrl: string): string | null {
  const marker = "/storage/v1/object/public/sheets/";
  const idx = imageUrl.indexOf(marker);
  return idx === -1 ? null : imageUrl.slice(idx + marker.length);
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

interface FolderInfo {
  name: string; // "" = uncategorized (folder IS NULL in DB)
  count: number;
  coverUrl: string;
}

export default function SongImagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // null = folder grid view, "" = uncategorized, "FolderName" = named folder
  const currentFolder = searchParams.get("folder");

  // Folder grid state
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderCreated, setNewFolderCreated] = useState(false);

  // Image list state
  const [images, setImages] = useState<SheetImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Edit modal state
  const [editing, setEditing] = useState<SheetImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Reset image list when navigating between folders (during render, not in effect)
  const [prevFolder, setPrevFolder] = useState(currentFolder);
  if (prevFolder !== currentFolder) {
    setPrevFolder(currentFolder);
    setPage(1);
    setQuery("");
    setDebouncedQuery("");
    setImages([]);
    setTotal(0);
    setSelectedIdx(null);
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch folder list when in grid mode
  useEffect(() => {
    if (currentFolder !== null || !supabase) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) setFoldersLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("sheet_images")
          .select("folder, image_url")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (err) throw err;
        const map = new Map<string, FolderInfo>();
        for (const row of data ?? []) {
          const name = row.folder ?? "All";
          if (!map.has(name)) map.set(name, { name, count: 0, coverUrl: row.image_url });
          map.get(name)!.count++;
        }
        if (!cancelled) setFolders(
          Array.from(map.values()).sort((a, b) => {
            if (a.name === "All" && b.name !== "All") return -1;
            if (a.name !== "All" && b.name === "All") return 1;
            return a.name.localeCompare(b.name);
          })
        );
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setFoldersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentFolder, refreshKey]);

  // Fetch images when inside a folder
  useEffect(() => {
    if (currentFolder === null) return;
    let cancelled = false;
    const client = supabase;
    async function run() {
      if (!client) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        const from = (page - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;
        const term = debouncedQuery.trim();

        const buildQuery = (col: "title_norm" | "title", value: string) => {
          let q = client
            .from("sheet_images")
            .select("*", { count: "exact" })
            .order("title", { ascending: true })
            .range(from, to);
          if (value) q = q.ilike(col, `%${value}%`);
          if (currentFolder === "All") q = q.or("folder.is.null,folder.eq.All");
          else q = q.eq("folder", currentFolder);
          return q;
        };

        let { data, count, error: dbError } = await buildQuery("title_norm", normalizeText(term));
        if (dbError?.code === "42703") {
          ({ data, count, error: dbError } = await buildQuery("title", term));
        }
        if (cancelled) return;
        if (dbError) throw new Error(dbError.message);
        setImages(data ?? []);
        setTotal(count ?? 0);
      } catch (e) {
        if (cancelled) return;
        setImages([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : "Lỗi không xác định.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [page, debouncedQuery, refreshKey, currentFolder]);

  const selected = selectedIdx !== null ? images[selectedIdx] : null;

  const prev = useCallback(() => {
    if (selectedIdx !== null && selectedIdx > 0) { setSelectedIdx(selectedIdx - 1); setZoom(false); }
  }, [selectedIdx]);

  const next = useCallback(() => {
    if (selectedIdx !== null && selectedIdx < images.length - 1) { setSelectedIdx(selectedIdx + 1); setZoom(false); }
  }, [selectedIdx, images.length]);

  const close = useCallback(() => { setSelectedIdx(null); setZoom(false); }, []);

  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIdx, prev, next, close]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || zoom) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
    touchStartX.current = null;
  }

  function openEdit(img: SheetImage) {
    setEditing(img);
    setEditTitle(img.title);
    setEditSlug(img.slug);
    setConfirmDelete(false);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editing || !supabase) return;
    if (!editTitle.trim() || !editSlug.trim()) { setEditError("Vui lòng điền đầy đủ thông tin."); return; }
    setSaving(true);
    setEditError(null);
    try {
      const { error: dbError } = await supabase
        .from("sheet_images")
        .update({ title: editTitle.trim(), slug: editSlug.trim() })
        .eq("id", editing.id);
      if (dbError) throw new Error(dbError.message);
      setEditing(null);
      reload();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImg() {
    if (!editing || !supabase) return;
    setSaving(true);
    setEditError(null);
    try {
      const path = storagePath(editing.image_url);
      if (path) await supabase.storage.from("sheets").remove([path]);

      const { error: dbError } = await supabase
        .from("sheet_images")
        .delete()
        .eq("id", editing.id);
      if (dbError) throw new Error(dbError.message);

      setEditing(null);
      setConfirmDelete(false);
      if (images.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  }

  function confirmFolderName() {
    if (!newFolderName.trim()) return;
    setNewFolderCreated(true);
  }

  function closeNewFolderModal() {
    setNewFolderModal(false);
    setNewFolderName("");
    setNewFolderCreated(false);
  }

  const uploadLink = currentFolder !== null
    ? `/song-images/upload?folder=${encodeURIComponent(currentFolder)}`
    : "/song-images/upload";

  const folderDisplayName = currentFolder ?? "";

  return (
    <div className="min-h-screen bg-gray-950 pb-24">

      {/* Sticky toolbar */}
      <div className="sticky top-16 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {currentFolder !== null && (
                <button
                  onClick={() => setSearchParams({})}
                  aria-label="Quay lại"
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-300" />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                  {currentFolder !== null ? folderDisplayName : "Hình Hợp Âm"}
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  {currentFolder === null
                    ? (foldersLoading ? "Đang tải..." : `${folders.length} thư mục`)
                    : (loading ? "Đang tải..." : `${total} bài hát`)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/songs"
                aria-label="Danh sách bài hát"
                className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 active:scale-95 transition-all"
              >
                <Music2 className="w-4 h-4" />
                <span className="hidden sm:inline">Danh sách</span>
              </Link>
              {currentFolder === null && (
                <button
                  onClick={() => { setNewFolderName(""); setNewFolderModal(true); }}
                  aria-label="Tạo thư mục"
                  className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tạo thư mục</span>
                </button>
              )}
              <Link
                to={uploadLink}
                aria-label="Thêm hình"
                className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white active:scale-95 transition-all shadow-lg shadow-purple-900/30"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Thêm hình</span>
              </Link>
            </div>
          </div>

          {/* Search — only shown inside a folder */}
          {currentFolder !== null && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài hát..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-gray-900 border border-gray-800 text-white text-base sm:text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">

        {/* ---- FOLDER GRID MODE ---- */}
        {currentFolder === null && (
          <>
            {foldersLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-900/60 border border-gray-800/60 overflow-hidden animate-pulse">
                    <div className="h-28 sm:h-36 bg-gray-800" />
                    <div className="p-3 space-y-2">
                      <div className="h-3.5 bg-gray-800 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-800/70 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!foldersLoading && !supabase && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <Music2 className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium mb-1">Chưa kết nối Supabase</p>
                <p className="text-gray-600 text-sm px-4">
                  Thêm <code className="text-purple-400">VITE_SUPABASE_URL</code> và{" "}
                  <code className="text-purple-400">VITE_SUPABASE_ANON_KEY</code> vào <code className="text-gray-400">.env.local</code>
                </p>
              </div>
            )}

            {!foldersLoading && supabase && folders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                  <Folder className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm mb-5">Chưa có thư mục nào.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => { setNewFolderName(""); setNewFolderModal(true); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium transition-all active:scale-95"
                  >
                    <FolderPlus className="w-4 h-4" /> Tạo thư mục
                  </button>
                  <Link
                    to="/song-images/upload"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" /> Thêm hình đầu tiên
                  </Link>
                </div>
              </div>
            )}

            {!foldersLoading && supabase && folders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {folders.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSearchParams({ folder: f.name })}
                    className="group text-left rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-500/50 hover:bg-gray-800/50 overflow-hidden transition-all duration-150 active:scale-[0.98]"
                  >
                    <div className="relative h-28 sm:h-36 overflow-hidden bg-gray-800">
                      {f.coverUrl ? (
                        <img
                          src={f.coverUrl}
                          alt={f.name || "Chưa phân loại"}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Folder className="w-10 h-10 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-white font-semibold text-sm truncate">
                        {f.name || "Chưa phân loại"}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{f.count} hình</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- IMAGE LIST MODE (inside a folder) ---- */}
        {currentFolder !== null && (
          <>
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-gray-900/60 border border-gray-800/60 animate-pulse">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-800 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-800 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-800/70 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !supabase && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <Music2 className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium mb-1">Chưa kết nối Supabase</p>
                <p className="text-gray-600 text-sm px-4">
                  Thêm <code className="text-purple-400">VITE_SUPABASE_URL</code> và{" "}
                  <code className="text-purple-400">VITE_SUPABASE_ANON_KEY</code> vào <code className="text-gray-400">.env.local</code>
                </p>
              </div>
            )}

            {!loading && supabase && error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {!loading && supabase && !error && images.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                  {debouncedQuery ? <Search className="w-7 h-7 text-gray-600" /> : <ImageIcon className="w-7 h-7 text-gray-600" />}
                </div>
                <p className="text-gray-400 text-sm mb-5">
                  {debouncedQuery ? "Không tìm thấy bài hát nào." : "Thư mục này chưa có hình."}
                </p>
                {!debouncedQuery && (
                  <Link
                    to={uploadLink}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" /> Thêm hình vào thư mục
                  </Link>
                )}
              </div>
            )}

            {!loading && !error && images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {images.map((img, i) => {
                  const hasChords = !!songBySlug[img.slug];
                  return (
                    <div
                      key={img.id}
                      className="group flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-500/50 hover:bg-gray-800/50 active:scale-[0.99] transition-all duration-150"
                    >
                      <button
                        onClick={() => { setSelectedIdx(i); setZoom(false); }}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 ring-1 ring-white/5">
                          <img
                            src={img.image_url}
                            alt={img.title}
                            loading="lazy"
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm sm:text-base font-semibold leading-snug line-clamp-2">{img.title}</p>
                          {hasChords && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-purple-300/90">
                              <Music2 className="w-3 h-3" /> Có hợp âm
                            </span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => openEdit(img)}
                        aria-label="Sửa"
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700 active:scale-90 transition-all flex-shrink-0"
                      >
                        <Pencil className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-between sm:justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 h-11 px-4 rounded-xl bg-gray-900 border border-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>
                <span className="text-gray-400 text-sm font-medium tabular-nums">
                  {page} <span className="text-gray-600">/ {totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 h-11 px-4 rounded-xl bg-gray-900 border border-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* New Folder Modal */}
      {newFolderModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          onClick={closeNewFolderModal}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-gray-900 border border-gray-800 p-5 pb-7 sm:pb-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-700 mx-auto mb-4" />

            {/* Step 1 — enter name */}
            {!newFolderCreated && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">Thư mục mới</h2>
                  <button onClick={closeNewFolderModal} aria-label="Đóng" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tên thư mục</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmFolderName()}
                  autoFocus
                  placeholder="VD: Nhạc trẻ, Bolero, Rock..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-base sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={closeNewFolderModal} className="flex-1 h-12 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition-all">
                    Hủy
                  </button>
                  <button
                    onClick={confirmFolderName}
                    disabled={!newFolderName.trim()}
                    className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                  >
                    Tạo thư mục
                  </button>
                </div>
              </>
            )}

            {/* Step 2 — success, choose action */}
            {newFolderCreated && (
              <>
                <div className="flex flex-col items-center text-center py-2 mb-5">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                  <p className="text-white font-bold text-base">Tạo thư mục thành công!</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Thư mục <span className="text-purple-300 font-medium">"{newFolderName}"</span> đã sẵn sàng.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { closeNewFolderModal(); setSearchParams({ folder: newFolderName.trim() }); }}
                    className="flex-1 h-12 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition-all"
                  >
                    Xem thư mục
                  </button>
                  <button
                    onClick={() => { closeNewFolderModal(); navigate(`/song-images/upload?folder=${encodeURIComponent(newFolderName.trim())}`); }}
                    className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Thêm hình ngay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-gray-900 border border-gray-800 p-5 pb-7 sm:pb-5 max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-700 mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Sửa hình hợp âm</h2>
              <button
                onClick={() => setEditing(null)}
                aria-label="Đóng"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tên bài hát</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 h-12 text-white placeholder-gray-600 text-base sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 h-12 text-purple-300 placeholder-gray-600 text-base sm:text-sm font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {editError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {editError}
                </div>
              )}

              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Xóa vĩnh viễn hình này? Không thể hoàn tác.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={saving}
                      className="flex-1 h-12 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 active:scale-95 text-sm font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={deleteImg}
                      disabled={saving}
                      className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving}
                    aria-label="Xóa"
                    className="flex items-center justify-center gap-1.5 h-12 px-4 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-950/40 active:scale-95 text-sm font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : "Lưu"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selected && selectedIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={close}>
          {/* Top bar */}
          <div
            className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm leading-tight truncate min-w-0">{selected.title}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gray-500 text-xs tabular-nums hidden sm:inline">{selectedIdx + 1} / {images.length}</span>
              {songBySlug[selected.slug] && (
                <Link
                  to={`/songs/${songBySlug[selected.slug].id}/${selected.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 h-9 inline-flex items-center rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all active:scale-95"
                >
                  Xem hợp âm
                </Link>
              )}
              <button
                onClick={close}
                aria-label="Đóng"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center px-2 sm:px-12 py-2 min-h-0 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={selected.image_url}
              alt={selected.title}
              onClick={() => setZoom((v) => !v)}
              className={cn(
                "rounded-lg shadow-2xl transition-all duration-200 select-none",
                zoom
                  ? "max-w-none max-h-none w-auto h-auto cursor-zoom-out"
                  : "max-h-full max-w-full object-contain cursor-zoom-in",
              )}
            />
          </div>

          {/* Prev / Next (desktop) */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={selectedIdx === 0}
            aria-label="Trước"
            className="hidden sm:flex fixed left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={selectedIdx === images.length - 1}
            aria-label="Sau"
            className="hidden sm:flex fixed right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Bottom thumbnails + mobile counter */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <p className="sm:hidden text-center text-gray-500 text-xs tabular-nums pb-1">{selectedIdx + 1} / {images.length}</p>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => { setSelectedIdx(i); setZoom(false); }}
                  className={cn(
                    "flex-shrink-0 w-11 h-14 sm:w-12 sm:h-14 rounded-lg overflow-hidden border-2 transition-all",
                    i === selectedIdx
                      ? "border-purple-500 opacity-100 scale-105"
                      : "border-transparent opacity-50 hover:opacity-80",
                  )}
                >
                  <img src={img.image_url} alt={img.title} loading="lazy" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
