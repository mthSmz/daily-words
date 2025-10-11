import { XMLParser } from "fast-xml-parser";
import removeAccents from "remove-accents";

export async function fetchRSS() {
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
      for (const it of items) {
        const t = it?.title;
        if (t && typeof t === "string") titles.push(t);
      }
    })
  );

  return titles;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;?/gi, " ")
    .replace(/&amp;?/gi, "&")
    .replace(/&quot;?/gi, '"')
    .replace(/&apos;?/gi, "'")
    .replace(/&lt;?/gi, "<")
    .replace(/&gt;?/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16) || 0))
    .replace(/&#(\d+);/g,   (_, dec) => String.fromCodePoint(parseInt(dec, 10) || 0));
}

export function tokenize(raw) {
  const STOP = new Set([
    "le","la","les","un","une","des","du","de","d","au","aux","et","ou","mais","donc","or","ni","car",
    "en","dans","sur","sous","avec","sans","pour","par","chez","vers","ce","cette","cet","ces","ça","cela",
    "il","elle","on","ils","elles","je","tu","nous","vous","y","a","est","sont","été","etre","sera","seront",
    "avoir","plus","moins","tres","ne","pas","que","qui","quoi","dont","ou","aujourd","hui","hier","demain"
  ]);

  const basicDecoded = decodeEntities(raw);

  const clean = removeAccents(basicDecoded.toLowerCase())
    .replace(/\bx[0-9a-f]{2}\b/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean.split(" ").filter(
    (w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w) && !/^x[0-9a-f]{2}$/i.test(w)
  );
}

export function top5FromTitles(titles) {
  const freq = new Map();
  titles.forEach((title) => {
    const seen = new Set();
    tokenize(title).forEach((w) => {
      if (seen.has(w)) return;
      seen.add(w);
      freq.set(w, (freq.get(w) ?? 0) + 1);
    });
  });
  ["france","paris","video","direct","photo","monde"].forEach((b) => freq.delete(b));
  return [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w);
}
