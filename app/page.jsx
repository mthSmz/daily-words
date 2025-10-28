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

    const fallbackDate = new Date().toLocaleDateString('fr-FR', {
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
            {fallbackDate} — <span>Poème par défaut</span>
          </p>
          <section
            style={{
              marginTop: 28,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: 18,
            }}
          >
            {fallbackPoem}
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
