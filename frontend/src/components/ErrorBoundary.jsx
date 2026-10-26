import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SoundChain Caught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#14120F] text-[#F6F1E7] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#1A1814] border border-hairline rounded-sm p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-brass/10 border border-brass/40 mx-auto flex items-center justify-center text-brass">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <p className="text-brass text-xs font-semibold uppercase tracking-wider font-mono">
                SoundChain Ledger Recovered
              </p>
              <h1 className="font-serif text-2xl font-bold text-paper">
                Something went wrong
              </h1>
              <p className="text-xs text-ash leading-relaxed">
                A UI component encountered an issue. Your wallet balances and on-chain state remain safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-[#100F0D] border border-hairline rounded text-[11px] font-mono text-ash text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded hover:bg-brass-light transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <a
                href="/"
                className="px-4 py-2 border border-hairline text-ash hover:text-paper text-xs rounded transition-colors inline-flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
