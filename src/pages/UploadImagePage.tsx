import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, X, CheckCircle2, AlertCircle, ImageIcon, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { cn } from "../utils";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function UploadImagePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugEdited) setSlug(toSlug(val));
  }

  function handleFileChange(f: File | null) {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFileChange(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim() || !slug.trim()) { setError("Vui lòng điền đầy đủ thông tin."); return; }
    if (!supabase) { setError("Chưa kết nối Supabase."); return; }

    setUploading(true);
    setError(null);

    try {
      const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const filename = `${slug.trim()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("sheets")
        .upload(filename, file, { upsert: true, contentType: file.type || "image/jpeg" });
      if (upErr) throw new Error(upErr.message);

      const { data: pub } = supabase.storage.from("sheets").getPublicUrl(filename);

      const { error: dbErr } = await supabase
        .from("sheet_images")
        .upsert({ title: title.trim(), slug: slug.trim(), image_url: pub.publicUrl }, { onConflict: "slug" });
      if (dbErr) throw new Error(dbErr.message);

      setSuccess(true);
      setTimeout(() => navigate("/song-images"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setTitle(""); setSlug(""); setSlugEdited(false);
    setFile(null); setPreview(null); setError(null); setSuccess(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <p className="text-white text-lg font-bold">Tải lên thành công!</p>
          <p className="text-gray-500 text-sm mt-1">Đang chuyển về trang hình hợp âm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <div className="max-w-xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/song-images"
            className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Thêm Hình Hợp Âm</h1>
            <p className="text-gray-500 text-xs mt-0.5">Tải ảnh hợp âm lên thư viện</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* File drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
              preview ? "border-purple-500/40 bg-transparent" : "border-gray-700 hover:border-gray-600 bg-gray-900 flex flex-col items-center justify-center py-12"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full rounded-2xl" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-all"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm font-medium">Kéo thả hoặc nhấn để chọn ảnh</p>
                <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP</p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Tên bài hát</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Ai Chung Tình Được Mãi"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Slug <span className="text-gray-600 font-normal">(tên file, tự động tạo)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="ai-chung-tinh-duoc-mai"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-purple-300 placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-medium transition-all"
            >
              Xóa
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !title || !slug}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang tải...</>
              ) : (
                <><Upload className="w-4 h-4" /> Tải lên</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
