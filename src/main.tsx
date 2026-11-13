import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7] text-[#252832] px-4 text-center">
          <h1 className="font-serif text-2xl font-bold mb-2">अकथ प्रकाशन | Akath Prakashan</h1>
          <p className="text-sm text-[#5A5E6B] mb-6">पृष्ठ लोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.</p>
          <a href="/" className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-sm font-semibold">मुख्यपृष्ठावर जा / Return Home</a>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<RootErrorBoundary><App /></RootErrorBoundary>);
}
