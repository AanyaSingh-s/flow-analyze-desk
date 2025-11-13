import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="mb-4 text-gray-700">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.href = "/";
              }}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

