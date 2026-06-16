import { cn } from "../../utils";

interface InstructionsProps {
  open: boolean;
  onToggle: () => void;
}

export default function Instructions({ open, onToggle }: InstructionsProps) {
  return (
    <div className="bg-gray-900/40 rounded-2xl border border-gray-800 overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors"
      >
        <span>{"Hướng dẫn sử dụng"}</span>
        <span className={cn("text-gray-600 transition-transform duration-200", open ? "rotate-180" : "")}>
          {"▾"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-8 text-xs text-gray-500 border-t border-gray-800 pt-3">
          <div>{"• Nhấn vào ô trên cần đàn để phát âm và đánh dấu nốt"}</div>
          <div>{"• Nhấn lại nốt đã đánh dấu để bỏ đánh dấu"}</div>
          <div>{"• Bật Hiển thị nốt để xem tên tất cả các nốt"}</div>
          <div>{"• Chuyển đổi Tiếng Việt / English cho tên nốt nhạc"}</div>
          <div>{"• Chọn hợp âm để hiển thị vị trí ngón tay"}</div>
          <div>{"• Nhấn Chơi để phát tất cả nốt đã chọn"}</div>
          <div>{"• Phím số 1 → 6 để gảy dây mở từ dây trầm đến cao"}</div>
          <div>{"• Nhấn dây đàn chuẩn để nghe cao độ tham chiếu"}</div>
        </div>
      )}
    </div>
  );
}
