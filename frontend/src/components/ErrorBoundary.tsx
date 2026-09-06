import { Component, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// React error boundaries must be class components.
// Use a workaround for TypeScript strict class field checks.
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    if (
      error?.message &&
      (error.message.includes("dynamically imported module") ||
        error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("Importing a module script failed"))
    ) {
      const refreshedKey = "error_boundary_chunk_reload";
      const attempts = Number(sessionStorage.getItem(refreshedKey) || 0);
      if (attempts < 2) {
        sessionStorage.setItem(refreshedKey, String(attempts + 1));
        window.location.reload();
      }
    }
    return { hasError: true, error };
  }

  constructor(props: Props) {
    super(props);
    const self = this as any;
    self.state = { hasError: false, error: null };
    self.handleReload = () => self.setState({ hasError: false, error: null });
    self.handleClearCacheAndReload = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
        if ("caches" in window) {
          const names = await caches.keys();
          for (const name of names) {
            await caches.delete(name);
          }
        }
      } catch {
        /* ignore */
      }
      window.location.reload();
    };
  }

  render(): ReactNode {
    const self = this as any;
    if (self.state.hasError) {
      if (self.props.fallback) return self.props.fallback;

      return (
        <div className="min-h-[100dvh] bg-[#F7F4EE] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle size={36} className="text-[#E53935]" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Terjadi Kendala Memuat Halaman
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Terdapat versi cache lama atau kendala koneksi sementara. Silakan coba muat ulang atau bersihkan cache.
            </p>
            {self.state.error && (
              <details className="text-left text-xs text-gray-400 mb-6 bg-gray-50 p-3 rounded-xl">
                <summary className="cursor-pointer font-medium text-gray-500">
                  Rincian Teknis
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-red-600 font-mono">
                  {self.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={self.handleReload}
                className="bg-[#2D7A4F] text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-[#24623f] transition-all shadow-sm"
              >
                <RefreshCw size={16} /> Muat Ulang
              </button>
              <button
                type="button"
                onClick={self.handleClearCacheAndReload}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all"
              >
                Bersihkan Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return self.props.children;
  }
}
