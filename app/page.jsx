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
    // Poème de secours à afficher en cas d’erreur de récupération
    const fallbackPoem = `Météo poétique du 28 octobre

hier
on pouvait danser
ou compter les lumières
les deux donnaient soif :

aujourd’hui
le budget devient ostentatoire
comme un chien‑ballon
qu’on garderait au poignet
pour impressionner son voisin à l’assemblée

Macron traverse la cage d’escalier
il renverse trois parapluies
puis laisse un pourboire
au concierge
qui ne lui a rien demandé

Melissa porte un parfum d’aéroport
elle dit que la Jamaïque
est un pays qu’on ferme
à coups de zip et d’ouragan

flash
musique
trop tôt

les chiffres rient
sur le tableau lumineux
on entend leur haleine
contre le verre :
le ministre sourit
avec la précision d’un néon
et les caméras lui lèchent le front :
on ne voyage jamais pour fuir
on fuit pour voyager :

ensuite
le plafond s’ouvre
comme une canette géante
et les étoiles tombent
en bruit de monnaie
le serveur murmure
que la dette
va bientôt apprendre à marcher
Melissa traverse encore
mais son nom grésille
sur l’étiquette du monde
que dans les bars
on appelle actualités
ou encore
parfois
télévision :

on applaudit
on applaudit jusqu’à oublier pourquoi
et le budget
gonfle
gonfle
gonfle :
un jour
quand ils auront eu notre peau
il éclatera
et nous comprendrons que c’était notre peau qui faisait le bruit :
c’était notre peau
notre peau
qu’ils voulaient mettre dans le budget.`;

    const fallbackWords = ['budget', 'contre', 'ouragan', 'melissa', 'trois'];
    const fallbackSources = 'Titres RSS (Le Monde, FTVI, Le Figaro)';
    const fallbackDate = new Date().toLocaleDateString('fr-FR', {
      dateStyle: 'long',
      timeZone: 'Europe/Paris',
    });
    const fallbackStanzas = fallbackPoem.trim().split('\n\n');
    const midpoint = Math.ceil(fallbackStanzas.length / 2);
    const firstColumn = fallbackStanzas.slice(0, midpoint);
    const secondColumn = fallbackStanzas.slice(midpoint);
    const year = new Date().getFullYear();

    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0b0c',
          color: '#f2f2f3',
          padding: '4rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            width: '100%',
            background: 'rgba(19, 19, 20, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 24,
            padding: '3rem',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <header style={{ marginBottom: '2.5rem' }}>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Poème du jour
            </h1>
            <p
              style={{
                marginTop: '0.75rem',
                fontSize: 20,
                opacity: 0.7,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem 1rem',
                alignItems: 'center',
              }}
            >
              <span>{fallbackDate}</span>
              <span style={{ opacity: 0.4 }}>—</span>
              <span>Source&nbsp;: {fallbackSources}</span>
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginTop: '1.5rem',
              }}
            >
              {fallbackWords.map((word) => (
                <span
                  key={word}
                  style={{
                    padding: '0.45rem 1.1rem',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    fontSize: 16,
                    fontWeight: 500,
                    textTransform: 'lowercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </header>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignItems: 'center',
              justifyItems: 'center',
            }}
          >
            <div style={{ width: '100%' }}>
              {firstColumn.map((stanza, stanzaIndex) => {
                const lines = stanza.split('\n');
                return (
                  <p
                    key={`left-${stanzaIndex}`}
                    style={{
                      margin: 0,
                      marginBottom: '1.4rem',
                      lineHeight: 1.7,
                      fontSize: 18,
                      opacity: stanzaIndex === 0 ? 0.9 : 0.85,
                    }}
                  >
                    {lines.map((line, lineIndex) => (
                      <span key={`left-${stanzaIndex}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
            <div style={{ width: '100%', marginTop: '4rem' }}>
              {secondColumn.map((stanza, stanzaIndex) => {
                const lines = stanza.split('\n');
                return (
                  <p
                    key={`right-${stanzaIndex}`}
                    style={{
                      margin: 0,
                      marginBottom: '1.4rem',
                      lineHeight: 1.7,
                      fontSize: 18,
                      opacity: 0.85,
                    }}
                  >
                    {lines.map((line, lineIndex) => (
                      <span key={`right-${stanzaIndex}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          </section>

          <footer
            style={{
              marginTop: '3rem',
              fontSize: 14,
              opacity: 0.45,
              textAlign: 'center',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            © {year} — Daily Words
          </footer>
        </div>
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
