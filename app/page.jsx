import { kv } from "@vercel/kv";
import { fetchRSS, top5FromTitles } from "@/lib/news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// --- Générateur de poème local, déterministe (pas d'API externe) ---
function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
function pick(arr, n) { return arr[n % arr.length]; }

function generateLocalPoem(words, date) {
  const list = Array.isArray(words) ? words : [];
  const safe = (i, fallback) => (list[i] ?? fallback ?? "").toString();
  const seed = hashSeed((date || "") + "::" + list.join("|"));

  const tones = [
    "voix basse, ironie noire",
    "saccadé, un souffle de gare",
    "clair-obscur, comme un néon mouillé",
    "doucement cruel, presque tendre",
  ];
  const breaks = ["—", "·", ":", "…"];
  const t = pick(tones, seed);
  const b = pick(breaks, seed >> 3);

  const w0 = safe(0, "ville");
  const w1 = safe(1, "pluie");
  const w2 = safe(2, "budget");
  const w3 = safe(3, "entreprises");
  const w4 = safe(4, "gouvernement");

  return [
    `${w0} ${b} dans la poche, comme une pièce fausse`,
    `${w1} qui coule sur les trottoirs — j’en bois la météo`,
    `on répète ${w2} pour conjurer la panne des slogans`,
    `et ${w3} claque aux feux rouges,`,
    `pendant que ${w4} compte ses ombres au standard`,
    ``,
    `je passe sous les vitrines où l’actualité se recoiffe`,
    `le monde a ce goût métallique des tickets compostés`,
    `je souris de travers, ${t},`,
    `et je rentre tard, avec cinq épines dans la langue`,
  ].join("\n");
}
// -------------------------------------------------------------------

export default async function Page() {
  // 1) Récupère les 5 mots (depuis KV sinon RSS)
  let data = await kv.get("latest"); // { date, words } | null

  if (!data) {
    try {
      const titles = await fetchRSS();
      data = { date: new Date().toISOString().slice(0, 10), words: top5FromTitles(titles) };
    } catch {
      data = {
        date: new Date().toISOString().slice(0, 10),
        words: ["actualité", "monde", "politique", "économie", "culture"],
      };
    }
  }

  const today = new Date().toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

  // 2) Génère le poème à partir des mots + date (même texte jusqu’à 15h tant que les mots ne changent pas)
  const poem = generateLocalPoem(data.words, data.date);

  // 3) Rendu
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0c",
        color: "#f2f2f3",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1 style={{ fontSize: 40, marginBottom: 12, fontWeight: 700 }}>5 mots du jour</h1>
        <p style={{ opacity: 0.65, marginBottom: 16, fontSize: 20 }}>
          {today} — <span>Source : titres RSS (Le Monde, FTVI, Le Figaro)</span>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {data.words.map((w) => (
            <span
              key={w}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #2a2a2e",
                background: "#151518",
                fontSize: 18,
              }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* Poème */}
        <section style={{ marginTop: 28, whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 18 }}>
        {/*   {poem}*/}
hier
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
à coups de zip et d'ouragan

flash
musique
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
télévision : </br></br>

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
c'était notre peau 
notre peau 
qu'ils voulaient mettre dans le budget.

        </section>

        <footer style={{ marginTop: 40, opacity: 0.5, fontSize: 14 }}>
          © {new Date().getFullYear()} — Daily Words (MVP)
        </footer>
      </div>
    </main>
  );
}
