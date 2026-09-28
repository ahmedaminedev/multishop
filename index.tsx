import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App Global Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ maxWidth: '640px', width: '100%', backgroundColor: '#131b2e', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>MultiShop - Tableau de Bord</h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
              {this.state.error?.message || "Un problème temporaire a été détecté lors du chargement."}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/?mode=backoffice'; }}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Réinitialiser & Ouvrir Backoffice
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#334155', color: '#ffffff', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
