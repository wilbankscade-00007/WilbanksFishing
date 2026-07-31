import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase mb-3">Something snagged</p>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[#E2E8F0] uppercase mb-4">
            Line Broke
          </h1>
          <p className="text-sm text-[#E2E8F0]/50 max-w-md mb-8">
            A section hit an unexpected snag. Refresh the page to get back on the water.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#E10000] text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#C00000] transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}