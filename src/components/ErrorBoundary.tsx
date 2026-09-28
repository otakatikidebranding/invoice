import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleResetStorage = () => {
    if (window.confirm('Bersihkan data penyimpanan lokal dan muat ulang halaman?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-neutral-300 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Terjadi Kendala Memuat Aplikasi
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Aplikasi mendeteksi kesalahan saat memuat komponen atau data tersimpan.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left overflow-x-auto text-[11px] font-mono text-neutral-700 max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="py-2.5 px-3 bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-700 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-300"
                title="Hapus cache lokal jika data rusak"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
