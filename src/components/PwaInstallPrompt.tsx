import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = navigator.userAgent;
    const ios =
      /iphone|ipad|ipod/i.test(ua) && !(window as { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIos(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="bg-gray-900 border border-purple-700/60 rounded-2xl p-4 shadow-2xl shadow-purple-900/40">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-4">
          <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Cài Abbaguitar</p>
            {isIos ? (
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Nhấn{" "}
                <span className="text-purple-400 font-medium">
                  Chia sẻ ⎋ → Thêm vào Màn hình chính
                </span>{" "}
                để cài ứng dụng và dùng microphone tốt hơn.
              </p>
            ) : (
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Cài ứng dụng để dùng tuner microphone nhanh hơn, ngay cả khi
                offline.
              </p>
            )}
          </div>
        </div>

        {!isIos && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            Cài đặt ngay
          </button>
        )}
      </div>
    </div>
  );
}
