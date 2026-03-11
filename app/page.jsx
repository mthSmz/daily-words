'use client';

import { useState, useEffect } from 'react';

const FALLBACK_WORDS = ['budget', 'contre', 'ouragan', 'melissa', 'trois'];
const FALLBACK_SOURCES = 'Titres RSS (Le Monde, FTVI, Le Figaro)';
const FALLBACK_POEM = `hier
on pouvait danser
ou compter les lumières
les deux donnaient soif :

aujourd’hui
le budget devient ostentatoire
comme un chien-ballon
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

flash,
musique !
non :
trop tôt

les chiffres rient
sur le tableau lumineux
on entend leur haleine
contre le verre :
le ministre sourit
avec la précision d’un néon
et les caméras lui lèchent le front :
on ne voyage jamais pour fuir
on fuit pour voyager :

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
télévision :

on applaudit
on applaudit jusqu’à oublier pourquoi
et le budget
gonfle
gonfle
gonfle :
un jour
quand ils auront eu notre peau
il éclatera
et nous comprendrons que c’était notre peau qui faisait le bruit :
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

  // --- Helpers
  const normalize = (str) =>
    (str || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n') // trailing spaces before line breaks
      .trim();

  // --- Data resolution
  const now = new Date();
  const fallbackData = {
    poem: FALLBACK_POEM,
    words: FALLBACK_WORDS,
    sources: FALLBACK_SOURCES,
    date: now.toISOString(),
  };

  const resolvedData = data && data.ok ? data : fallbackData;

  // Normalize poem and detect if it's the fallback poem
  const normalizedPoem = normalize(resolvedData.poem || FALLBACK_POEM);
  const isFallbackPoem = normalizedPoem === normalize(FALLBACK_POEM);

  // Date & Title
  const rawDate = resolvedData.date ? new Date(resolvedData.date) : now;
  const displayDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'Europe/Paris',
  }).format(rawDate);

  // If the displayed poem is exactly the fallback, force the requested fixed title
  const pageTitle = isFallbackPoem
    ? 'Météo poétique du 28 octobre 2025'
    : `Météo poétique du ${displayDate}`;

  const sourcesLabel = resolvedData.sources || FALLBACK_SOURCES;
  const wordsList =
    Array.isArray(resolvedData.words) && resolvedData.words.length
      ? resolvedData.words
      : FALLBACK_WORDS;

  // Build columns from stanzas
  const stanzas = normalizedPoem
    ? normalizedPoem
        .split(/\n{2,}/)
        .map((stanza) => stanza.trim())
        .filter(Boolean)
    : [];

  const columnCount = 3;
  const columns = Array.from({ length: columnCount }, () => []);
  const stanzaLineCounts = stanzas.map((stanza) => stanza.split('\n').length);
  const totalLines = stanzaLineCounts.reduce((sum, count) => sum + count, 0);
  const idealLinesPerColumn = Math.ceil(totalLines / columnCount) || 0;
  let currentColumn = 0;
  let currentColumnLines = 0;

  stanzas.forEach((stanza, index) => {
    const stanzaLines = stanzaLineCounts[index];
    if (
      currentColumn < columnCount - 1 &&
      currentColumnLines > 0 &&
      idealLinesPerColumn > 0 &&
      currentColumnLines + stanzaLines > idealLinesPerColumn
    ) {
      currentColumn += 1;
      currentColumnLines = 0;
    }
    columns[currentColumn].push(stanza);
    currentColumnLines += stanzaLines;
  });

  const gridTemplateColumns = 'repeat(3, minmax(220px, 1fr))';
  const year = new Date().getFullYear();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top, #141417 0%, #09090a 55%, #050506 100%)',
        color: '#f2f2f3',
        padding: '4rem 2.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          width: '100%',
          background: 'rgba(18, 18, 19, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 28,
          padding: '3.25rem',
          boxShadow: '0 32px 90px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
        }}
      >
        <header
          style={{
            display: 'grid',
            gap: '1.25rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {pageTitle}
          </h1>
          <p
            style={{
              fontSize: 19,
              opacity: 0.72,
              margin: 0,
            }}
          >
            Source&nbsp;: {sourcesLabel}
          </p>
          {wordsList.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              {wordsList.map((word) => (
                <span
                  key={word}
                  style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    fontSize: 15,
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
            gap: '2.5rem',
          }}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={`column-${columnIndex}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {column.map((stanza, stanzaIndex) => {
                const lines = stanza.split('\n');
                return (
                  <p
                    key={`stanza-${columnIndex}-${stanzaIndex}`}
                    style={{
                      margin: 0,
                      lineHeight: 1.75,
                      fontSize: 18,
                      opacity: 0.88,
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
            fontSize: 13,
            opacity: 0.45,
            textAlign: 'center',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          © {year} — Daily Words
        </footer>
      </div>
    </main>
  );
}
