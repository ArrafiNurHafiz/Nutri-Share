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
    return { hasError: true, error };
  }

  constructor(props: Props) {
    super(props);
    const self = this as any;
    self.state = { hasError: false, error: null };
    self.handleReload = () => self.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    const self = this as any;
    if (self.state.hasError) {
      if (self.props.fallback) return self.props.fallback;

      return (
        <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle size={36} className="text-[#E53935]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.
            </p>
            {self.state.error && (
              <details className="text-left text-xs text-gray-400 mb-6 bg-gray-50 p-3 rounded-xl">
                <summary className="cursor-pointer font-medium">Detail teknis</summary>
                <pre className="mt-2 whitespace-pre-wrap">{self.state.error.message}</pre>
              </details>
            )}
            <button onClick={self.handleReload}
              className="bg-[#2D7A4F] text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
            >
              <RefreshCw size={18} /> Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return self.props.children;
  }
}
