import { useState } from "react";
import { Coffee, Copy, Check, Star, Music2, Sparkles } from "lucide-react";

// const TIERS = [
//   { emoji: "☕", label: "1 ly cà phê", amount: 25000, desc: "Cảm ơn bạn rất nhiều!" },
//   { emoji: "☕☕", label: "2 ly cà phê", amount: 50000, desc: "Bạn thật tuyệt vời!" },
//   { emoji: "🍱", label: "Bữa trưa", amount: 100000, desc: "Bạn là người hào phóng nhất!" },
//   { emoji: "🎸", label: "Cây đàn nhỏ", amount: 200000, desc: "Bạn là anh hùng của chúng tôi!" },
// ];

const SUPPORTERS = [
  { name: "Minh Tú", amount: "50k", message: "Keep up the great work! 🎸" },
  { name: "Lan Anh", amount: "200k", message: "Ứng dụng rất hay, cảm ơn nhé!" },
  { name: "Hoàng Nam", amount: "100k", message: "Guitar forever! ❤️" },
  {
    name: "Thảo Vy",
    amount: "500k",
    message: "Học guitar nhờ app này quá tốt 🙏",
  },
];

export default function DonatePage() {
  const [copied, setCopied] = useState<string | null>(null);
  //   const [selectedTier, setSelectedTier] = useState<number | null>(1);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 pt-16 pb-12 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-3xl rounded-full" />
          <div className="absolute top-10 left-1/3 w-[300px] h-[200px] bg-pink-600/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Ủng hộ dự án mã nguồn mở
          </div>

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl rotate-6 opacity-30" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Coffee className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Buy me{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              a coffee, please!
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Abbaguitar là dự án phi lợi nhuận, được xây dựng với tình yêu âm
            nhạc. Sự ủng hộ của bạn giúp chúng tôi duy trì và phát triển nền
            tảng này.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-xs text-gray-500 mt-0.5">Bài hát</div>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-xs text-gray-500 mt-0.5">Người dùng</div>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-gray-500 mt-0.5">Miễn phí</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Left: QR + payment info */}
          <div className="space-y-4">
            {/* QR Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-[#ae2070] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-white font-semibold">
                  Thanh toán qua MoMo
                </span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ae2070]/20 to-pink-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                    <img
                      src="/qr-momo.png"
                      alt="MoMo QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm mb-5">
                Quét mã QR bằng app MoMo để thanh toán nhanh
              </p>

              {/* Account info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">
                      Tên tài khoản
                    </div>
                    <div className="text-white text-sm font-medium">
                      Abbaguitar
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy("Abbaguitar", "name")}
                    className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
                  >
                    {copied === "name" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Alternative: bank transfer note */}
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 flex gap-3">
              <Music2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300/80 text-sm leading-relaxed">
                Mọi khoản ủng hộ dù nhỏ đều giúp chúng tôi duy trì máy chủ và
                thêm nhiều bài hát mới mỗi ngày. Cảm ơn bạn rất nhiều! 🙏
              </p>
            </div>
          </div>

          {/* Right: tier selection + message */}
          <div className="space-y-4">
            {/* <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Chọn mức ủng hộ
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {TIERS.map((tier, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTier(i)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedTier === i
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    }`}
                  >
                    {selectedTier === i && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-1">{tier.emoji}</div>
                    <div className="text-white text-sm font-medium">{tier.label}</div>
                    <div className="text-amber-400 text-sm font-bold mt-0.5">
                      {tier.amount.toLocaleString("vi-VN")}đ
                    </div>
                    {selectedTier === i && (
                      <div className="text-xs text-amber-300/70 mt-1">{tier.desc}</div>
                    )}
                  </button>
                ))}
              </div>

              {selectedTier !== null && (
                <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Số tiền</span>
                    <span className="text-white font-bold text-lg">
                      {TIERS[selectedTier].amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(TIERS[selectedTier].amount.toString(), "amount")}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 text-sm"
                  >
                    {copied === "amount" ? (
                      <>
                        <Check className="w-4 h-4" /> Đã sao chép!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Sao chép số tiền
                      </>
                    )}
                  </button>
                </div>
              )}
            </div> */}

            {/* Recent supporters */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Người ủng hộ gần đây
              </h2>
              <div className="space-y-3">
                {SUPPORTERS.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      {s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {s.name}
                        </span>
                        <span className="text-amber-400 text-xs font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {s.amount}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {s.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-amber-900/20 border border-gray-800 rounded-2xl px-6 py-10">
          <div className="text-3xl mb-3">🎸</div>
          <h3 className="text-white text-xl font-bold mb-2">
            Cảm ơn bạn đã yêu thích âm nhạc!
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Mỗi khoản ủng hộ là nguồn động lực to lớn để chúng tôi tiếp tục xây
            dựng công cụ học guitar tốt hơn cho cộng đồng.
          </p>
        </div>
      </div>
    </div>
  );
}
