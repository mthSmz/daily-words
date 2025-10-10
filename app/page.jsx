import { XMLParser } from "fast-xml-parser";
import removeAccents from "remove-accents";

export const revalidate = 0; // pas de cache

async function fetchRSS() {
  const FEEDS = [
    "https://www.lemonde.fr/rss/une.xml",
    "https://www.francetvinfo.fr/titres.rss",
    "https://www.lefigaro.fr/rss/figaro_actualites.xml"
  ];

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const titles = [];

  await Promise.allSettled(
    FEEDS.map(async (u) => {
      const res = await fetch(u, { cache: "no-store" });
      const xml = await res.text();
      const j = parser.parse(xml);
      const items = j?.rss?.channel?.item ?? [];
      for (const it of items) if (it?.title) titles.push(String(it.title));
    })
  );

  return titles;
}

function tokenize(t) {
  const STOP = new Set([
    "le","la","les","un","une","des","du","de","d","au","aux","et","ou","mais","donc","or","ni","car",
    "en","dans","sur","sous","avec","sans","pour","par","chez","vers","ce","cette","cet","ces","ça","cela",
    "il","elle","on","ils","elles","je","tu","nous","vous","y","a","est","sont","été","etre","sera","seront",
    "avoir","plus","moins","tres","ne","pas","que","qui","quoi","dont","ou","aujourd","hui","hier","demain"
  ]);

  const clean = removeAccents(t.toLowerCase())
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean
    .split(" ")
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

function top5FromTitles(titles) {
  const freq = new Map();
  titles.forEach((title) => {
    const seen = new Set();
    tokenize(title).forEach((w) => {
      if (seen.has(w)) return;
      seen.add(w);
      freq.set(w, (freq.get(w) ?? 0) + 1);
    });
  });

  // petit anti-bruit
  for (const ban of ["france", "paris", "video", "direct", "photo", "monde"]) {
    freq.delete(ban);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

export default async function Page() {
  let words = [];
  try {
    const titles = await fetchRSS();
    words = top5FromTitles(titles);
  } catch {
    words = ["actualité", "monde", "politique", "économie", "culture"]; // fallback
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  });

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
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>5 mots du jour</h1>
        <p style={{ opacity: 0.6, marginBottom: 16 }}>
          {today} — Source : titres RSS (Le Monde, FTVI, Le Figaro)
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {words.map((w) => (
            <span
              key={w}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid #2a2a2e",
                background: "#151518",
                fontSize: 14,
              }}
            >
              {w}
            </span>
          ))}
        </div>

        <footer style={{ marginTop: 32, opacity: 0.5, fontSize: 12 }}>
          © {new Date().getFullYear()} — Daily Words (MVP)
        </footer>
      </div>
    </main>
  );
}
