'use client';

import { useState, useEffect } from 'react';

const FALLBACK_WORDS = ['budget', 'contre', 'ouragan', 'melissa', 'trois'];
const FALLBACK_SOURCES = 'Titres RSS (Le Monde, FTVI, Le Figaro)';
const FALLBACK_POEM = `hier
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

  const now = new Date();
  const fallbackData = {
    poem: FALLBACK_POEM,
    words: FALLBACK_WORDS,
    sources: FALLBACK_SOURCES,
    date: now.toISOString(),
  };

  const resolvedData = data && data.ok ? data : fallbackData;
  const rawDate = resolvedData.date ? new Date(resolvedData.date) : now;
  const displayDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'Europe/Paris',
  }).format(rawDate);
  const pageTitle = `Météo poétique du ${displayDate}`;
  const sourcesLabel = resolvedData.sources || FALLBACK_SOURCES;
  const wordsList =
    Array.isArray(resolvedData.words) && resolvedData.words.length
      ? resolvedData.words
      : FALLBACK_WORDS;

  const normalizedPoem = (resolvedData.poem || FALLBACK_POEM)
    .replace(/\r\n/g, '\n')
    .trim();
  const stanzas = normalizedPoem
    ? normalizedPoem
        .split(/\n{2,}/)
        .map((stanza) => stanza.trim())
        .filter(Boolean)
    : [];
  const columnCount = Math.min(3, Math.max(1, Math.ceil(stanzas.length / 4)));
  const perColumn = Math.ceil(stanzas.length / columnCount) || 1;
  const columns = Array.from({ length: columnCount }, (_, columnIndex) =>
    stanzas.slice(columnIndex * perColumn, (columnIndex + 1) * perColumn)
  );
  const columnTemplates = {
    1: 'minmax(0, 3fr)',
    2: 'minmax(0, 3fr) minmax(0, 2fr)',
    3: 'minmax(0, 3fr) minmax(0, 2fr) minmax(0, 1.5fr)',
  };
  const gridTemplateColumns = columnTemplates[columnCount] || columnTemplates[1];
  const columnOffsets = [0, 48, 96];
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
            {pageTitle}
          </h1>
          <p
            style={{
              marginTop: '0.75rem',
              fontSize: 20,
              opacity: 0.7,
            }}
          >
            Source&nbsp;: {sourcesLabel}
          </p>
          {wordsList.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginTop: '1.5rem',
              }}
            >
              {wordsList.map((word) => (
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
          )}
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns,
            gap: '2.75rem',
            alignItems: 'start',
          }}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              style={{
                width: '100%',
                marginTop: columnOffsets[columnIndex] || 0,
              }}
            >
              {column.map((stanza, stanzaIndex) => {
                const lines = stanza.split('\n');
                return (
                  <p
                    key={`stanza-${columnIndex}-${stanzaIndex}`}
                    style={{
                      margin: 0,
                      marginBottom: '1.4rem',
                      lineHeight: 1.7,
                      fontSize: 18,
                      opacity:
                        columnIndex === 0 && stanzaIndex === 0
                          ? 0.9
                          : 0.85,
                    }}
                  >
                    {lines.map((line, lineIndex) => (
                      <span key={`line-${columnIndex}-${stanzaIndex}-${lineIndex}`}>
                        {line}
                        {lineIndex < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          ))}
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
