'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadPoem() {
      try {
        const res = await fetch('/api/poem', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadPoem();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0b0b0c',
          color: '#f2f2f3',
          padding: '2rem',
        }}
      >
        <p>Chargement…</p>
      </main>
    );
  }

  if (!data || !data.ok) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0b0b0c',
          color: '#f2f2f3',
          padding: '2rem',
        }}
      >
        <p>Impossible de récupérer le poème du jour.</p>
      </main>
    );
  }

  const today = new Date(data.date).toLocaleDateString('fr-FR', {
    dateStyle: 'long',
    timeZone: 'Europe/Paris',
  });

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b0b0c',
        color: '#f2f2f3',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 720, width: '100%' }}>
        <h1 style={{ fontSize: 40, marginBottom: 12, fontWeight: 700 }}>
          Poème du jour
        </h1>
        <p style={{ opacity: 0.65, marginBottom: 16, fontSize: 20 }}>
          {today} —{' '}
          <span>
            Mots d’actualité :{' '}
            {Array.isArray(data.words) ? data.words.join(', ') : ''}
          </span>
        </p>
        <section
          style={{
            marginTop: 28,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            fontSize: 18,
          }}
        >
          {data.poem}
        </section>
        <footer
          style={{ marginTop: 40, opacity: 0.5, fontSize: 14 }}
        >
          © {new Date().getFullYear()} — Daily Words
        </footer>
      </div>
    </main>
  );
}
