import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// A schema change on persisted local data (or any other unexpected render
// error) must not leave the screen permanently blank — especially in
// standalone PWA mode, where there's no address bar to reload from.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center dark:bg-[#0f1115]">
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">
            Algo deu errado ao carregar o app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
