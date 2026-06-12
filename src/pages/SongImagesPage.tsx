import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  X, ChevronLeft, ChevronRight, Music2, Upload, Loader2,
  Search, ImageIcon, Pencil, Trash2, AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { SheetImage } from "../lib/supabase";
import { SONGS } from "../data/mockData";
import { cn } from "../utils";

const songBySlug = Object.fromEntries(SONGS.map((s) => [s.slug, s]));
const PER_PAGE = 20;

// Derive the storage object path from a public image URL.
function storagePath(imageUrl: string): string | null {
  const marker = "/storage/v1/object/public/sheets/";
  const idx = imageUrl.indexOf(marker);
  return idx === -1 ? null : imageUrl.slice(idx + marker.length);
}

// Strip Vietnamese diacritics so search matches the DB's title_norm column.
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export default function SongImagesPage() {
  const [images, setImages] = useState<SheetImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<SheetImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Debounce the search box and reset to page 1 on change.
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
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
        // Search the normalized column (accent-insensitive) when present, and
        // fall back to the plain title if the migration hasn't been applied yet.
        const buildQuery = (col: "title_norm" | "title", value: string) => {
          let q = client
            .from("sheet_images")
            .select("*", { count: "exact" })
            .order("title", { ascending: true })
            .range(from, to);
          if (value) q = q.ilike(col, `%${value}%`);
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
  }, [page, debouncedQuery, refreshKey]);

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
      // Remove the storage object first (best-effort), then the DB record.
      const path = storagePath(editing.image_url);
      if (path) await supabase.storage.from("sheets").remove([path]);

      const { error: dbError } = await supabase
        .from("sheet_images")
        .delete()
        .eq("id", editing.id);
      if (dbError) throw new Error(dbError.message);

      setEditing(null);
      setConfirmDelete(false);
      // Step back a page if we just removed the only item on a non-first page.
      if (images.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Hình Hợp Âm</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Đang tải..." : `${total} bài hát`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/song-images/upload"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all"
            >
              <Upload className="w-4 h-4" />
              Thêm hình
            </Link>
            <Link
              to="/songs"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
            >
              <Music2 className="w-4 h-4" />
              Danh sách
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài hát..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Not configured */}
        {!loading && !supabase && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Music2 className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium mb-1">Chưa kết nối Supabase</p>
            <p className="text-gray-600 text-sm">
              Thêm <code className="text-purple-400">VITE_SUPABASE_URL</code> và{" "}
              <code className="text-purple-400">VITE_SUPABASE_ANON_KEY</code> vào <code className="text-gray-400">.env.local</code>
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && supabase && error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && supabase && !error && images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Music2 className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm mb-4">
              {debouncedQuery ? "Không tìm thấy bài hát nào." : "Chưa có hình hợp âm nào."}
            </p>
            {!debouncedQuery && (
              <Link
                to="/song-images/upload"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
              >
                <Upload className="w-4 h-4" /> Thêm hình đầu tiên
              </Link>
            )}
          </div>
        )}

        {/* List */}
        {!loading && !error && images.length > 0 && (
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/60 hover:bg-gray-800/60 transition-all duration-150"
              >
                <button
                  onClick={() => { setSelectedIdx(i); setZoom(false); }}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-600/15 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/25 transition-colors">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-white text-sm font-medium leading-tight flex-1 min-w-0 truncate">{img.title}</span>
                </button>
                <button
                  onClick={() => openEdit(img)}
                  title="Sửa"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-700 transition-all flex-shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-gray-500 text-sm">Trang {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => !saving && setEditing(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Sửa hình hợp âm</h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all"
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
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-purple-300 placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
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
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-medium transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={deleteImg}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
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
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-950/40 text-sm font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
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
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white font-bold text-sm leading-tight">{selected.title}</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-xs">{selectedIdx + 1} / {images.length}</span>
              {songBySlug[selected.slug] && (
                <Link
                  to={`/songs/${songBySlug[selected.slug].id}/${selected.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                >
                  Xem hợp âm
                </Link>
              )}
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
              src={selected.image_url}
              alt={selected.title}
              onClick={() => setZoom((v) => !v)}
              className={cn(
                "rounded-lg shadow-2xl transition-all duration-200",
                zoom
                  ? "max-w-none max-h-none w-auto h-auto cursor-zoom-out"
                  : "max-h-full max-w-full object-contain cursor-zoom-in",
              )}
            />
          </div>

          {/* Prev / Next */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={selectedIdx === 0}
            className="fixed left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={selectedIdx === images.length - 1}
            className="fixed right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Bottom thumbnails */}
          <div
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => { setSelectedIdx(i); setZoom(false); }}
                className={cn(
                  "flex-shrink-0 w-12 h-14 rounded-lg overflow-hidden border-2 transition-all",
                  i === selectedIdx
                    ? "border-purple-500 opacity-100 scale-105"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
