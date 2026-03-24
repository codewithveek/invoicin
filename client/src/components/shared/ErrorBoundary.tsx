import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <div className="text-[32px] mb-3">⚠️</div>
          <h2 className="text-[18px] mb-2">Something went wrong</h2>
          <p className="text-[#888] text-[13px] mb-5">
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-brand text-white border-0 rounded-md cursor-pointer text-[13px]"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
