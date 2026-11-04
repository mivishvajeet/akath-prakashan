import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {
  installGitHubPagesStaticAdapter,
  getGitHubPagesBasePath,
  normalizeAppRoutePath,
  runGitHubPagesAssetDiagnostics,
} from './utils/githubPagesAdapter.ts';

// 1. Initialize GitHub Pages static API adapter and normalize subpath / 404.html redirects
let detectedBase = '';
let normalizedInitialRoute = '/';
try {
  installGitHubPagesStaticAdapter();
  detectedBase = getGitHubPagesBasePath();
  normalizedInitialRoute = normalizeAppRoutePath(window.location.pathname);
  if (
    detectedBase &&
    window.location.pathname === detectedBase &&
    !window.location.pathname.endsWith('/')
  ) {
    window.history.replaceState(
      null,
      '',
      `${detectedBase}/${window.location.search}${window.location.hash}`
    );
  }
} catch {
  // Never block React root mounting if environment restricts window/history properties
}

class RootErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(): {hasError: boolean} {
    return {hasError: true};
  }

  render() {
    if (this.state.hasError) {
      const homeHref = detectedBase ? `${detectedBase}/` : '/';
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7] text-[#252832] px-4 text-center">
          <h1 className="font-serif text-2xl font-bold mb-2">
            अकथ प्रकाशन | Akath Prakashan
          </h1>
          <p className="text-sm text-[#5A5E6B] mb-6">
            पृष्ठ लोड करताना अडचण आली. कृपया मुख्यपृष्ठावर परत जा.
          </p>
          <a
            href={homeHref}
            className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-sm font-semibold"
          >
            मुख्यपृष्ठावर जा / Return Home ({normalizedInitialRoute})
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );

  // 3. Run post-render browser console diagnostic check for manifest & static assets
  window.addEventListener(
    'load',
    () => {
      setTimeout(() => {
        void runGitHubPagesAssetDiagnostics();
      }, 300);
    },
    {once: true}
  );
}
