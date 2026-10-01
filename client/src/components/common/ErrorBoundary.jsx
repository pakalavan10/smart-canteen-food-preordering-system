import React from 'react';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white">
          <div className="glass p-8 max-w-md w-full text-center space-y-4 border border-danger-500/30 rounded-3xl shadow-soft-lg">
            <div className="w-16 h-16 rounded-full bg-danger-500/15 text-danger-500 mx-auto flex items-center justify-center text-3xl border border-danger-500/30">
              <HiOutlineExclamationTriangle />
            </div>
            <h2 className="text-2xl font-display font-extrabold">Something went wrong</h2>
            <p className="text-sm text-surface-500">
              {this.state.error?.message || 'An unexpected application error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary w-full text-sm font-bold flex items-center justify-center gap-2"
            >
              <HiOutlineArrowPath className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
