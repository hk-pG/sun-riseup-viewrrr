import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-background flex h-screen items-center justify-center">
            <div className="border-destructive bg-card rounded-lg border p-6 text-center">
              <h2 className="text-destructive mb-2 text-lg font-semibold">
                アプリケーションエラー
              </h2>
              <p className="text-muted-foreground mb-4">
                予期しないエラーが発生しました。
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2"
              >
                再読み込み
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
