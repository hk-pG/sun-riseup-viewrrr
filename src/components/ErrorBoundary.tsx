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
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="rounded-lg border border-destructive bg-card p-6 text-center">
              <h2 className="mb-2 font-semibold text-destructive text-lg">
                アプリケーションエラー
              </h2>
              <p className="mb-4 text-muted-foreground">
                予期しないエラーが発生しました。
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
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
