import { XMLParser } from "fast-xml-parser";
import removeAccents from "remove-accents";

export const dynamic = "force-dynamic"; // évite un cache agressif côté Vercel
export const revalidate = 0;            // on veut recalculer à chaque rendu

async function fetchRSS() {
  const FEEDS = [
    "https://www.lemonde.fr/rss/une.xml",
    "https://www.francetvinfo.fr/titres.rss",
    "https://www.lefigaro.fr/rss/figaro_actualites.xml",
  ];

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const titles = [];

  await Promise.allSettled(
    FEEDS.map(async (u) => {
      const res = await fetch(u, { cache: "no-store" });
      const xml = await res.text();
      const j = parser.parse(xml);
      const items = j?.rss?.channel?.item ?? [];
      for (const it of items) {
        const t = it?.title;
        if (t && typeof t === "string") titles.push(t);
      }
    })
  );

  return titles;
}

// Décodage léger des entités HTML + numériques (&#233; / &#xE9;)
function decodeEntities(s) {
  return s
    // entités nommées courantes
    .replace(/&nbsp;?/gi, " ")
    .replace(/&amp;?/gi, "&")
    .replace(/&quot;?/gi, '"')
    .replace(/&apos;?/gi, "'")
    .replace(/&lt;?/gi, "<")
    .replace(/&gt;?/gi, ">")
    // numériques : hexadécimal
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16) || 0)
    )
    // numériques : décimal
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10) || 0)
    );
}

function tokenize(raw) {
  const STOP = new Set([
    "le","la","les","un","une","des","du","de","d","au","aux",
    "et","ou","mais","donc","or","ni","car","en","dans","sur","sous",
    "avec","sans","pour","par","chez","vers","ce","cette","cet","ces",
    "ça","cela","il","elle","on","ils","elles","je","tu","nous","vous",
    "y","a","est","sont","été","etre","sera","seront","avoir","plus",
    "moins","tres","ne","pas","que","qui","quoi","dont","ou","aujourd",
    "hui","hier","demain"
  ]);

  const basicDecoded = decodeEntities(raw);

  const clean = removeAccents(basicDecoded.toLowerCase())
    // artefacts de mauvais encodage : "xe9", "xE0", etc.
    .replace(/\bx[0-9a-f]{2}\b/gi, " ")
    // URLs et ponctuation
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean
    .split(" ")
    .filter(
      (w) =>
        w.length >= 3 &&
        !STOP.has(w) &&
        !/^\d+$/.test(w) &&
        !/^x[0-9a-f]{2}$/i.test(w)
    );
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
  const BAN = ["france", "paris", "video", "direct", "photo", "monde"];
  BAN.forEach((b) => freq.delete(b));

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
        <h1 style={{ fontSize: 40, marginBottom: 12, fontWeight: 700 }}>
          5 mots du jour
        </h1>

        <p style={{ opacity: 0.65, marginBottom: 16, fontSize: 20 }}>
          {today} — <span>Source : titres RSS (Le Monde, FTVI, Le Figaro)</span>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {words.map((w) => (
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

        <footer style={{ marginTop: 40, opacity: 0.5, fontSize: 14 }}>
          © {new Date().getFullYear()} — Daily Words (MVP)
        </footer>
      </div>
    </main>
  );
}
