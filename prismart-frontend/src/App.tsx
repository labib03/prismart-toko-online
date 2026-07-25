import { useState, useEffect } from 'react';
import { Database, Server, CheckCircle2, XCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

interface HealthStatus {
  status: string;
  message: string;
  timestamp?: string;
  error?: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setHealth({ status: 'error', message: 'Tidak dapat terhubung ke Backend Express server.', error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="brand-logo">
          <ShoppingBag size={28} style={{ color: '#818cf8' }} />
          Prismart
        </div>
        <span className="badge">Fase 1: Foundation & Data Layer</span>
      </header>

      <main>
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Server size={24} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Status Infrastruktur Sistem</h2>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Memeriksa koneksi ke Backend & Database...</p>
          ) : health?.status === 'ok' ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} />
                Backend & Database Terhubung Berhasil
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{health.message}</p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={14} /> PostgreSQL: postgresql://localhost:5432/prismart_db
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                <XCircle size={20} />
                Koneksi Backend / PostgreSQL Belum Siap
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{health?.message}</p>
              {health?.error && <p style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.5rem', fontFamily: 'monospace' }}>{health.error}</p>}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Backend Architecture</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>Node.js + Express + Prisma</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frontend Architecture</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>React 18 + Vite + TS</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
