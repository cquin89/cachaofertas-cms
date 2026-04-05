import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50">
            <AlertTriangle size={24} className="text-danger-500" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-warm-800">
              Algo salió mal
            </p>
            <p className="mt-1 text-sm text-warm-500">
              {this.state.error?.message ?? 'Error inesperado'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={this.reset}>
            <RefreshCw size={14} />
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
