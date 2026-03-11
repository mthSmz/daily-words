// app/api/poem/route.js
export const runtime = "nodejs";

import { kv } from "@vercel/kv";
import { generateLocalPoem } from "@/lib/poem";
import OpenAI from "openai";

function parisNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function publicationDate(now = parisNow()) {
  const target = new Date(now);
  if (target.getHours() < 15) {
    target.setDate(target.getDate() - 1);
  }
  return toIsoDate(target);
}

function secondsUntilNextPublish() {
  const now = parisNow();
  const next = new Date(now);
  next.setHours(15, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);
  return Math.max(1, Math.floor((next - now) / 1000));
}

function normalizeWords(input) {
  let words = input ?? [];
  if (typeof words === "string") {
    try {
      words = JSON.parse(words);
    } catch {
      words = words.split(/[,\n]/g);
    }
  }
  if (!Array.isArray(words)) words = [];
  return words
    .filter((w) => w !== undefined && w !== null)
    .map((w) => String(w).trim())
    .filter((w) => w.length > 0);
}

function scrubPoem(s) {
  if (!s) return "";
  return String(s)
    .replace(/\bundefined\b/gi, "")
    .replace(/\bnull\b/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchFearGreedAlternative() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", { cache: "no-store" });
    const json = await res.json();
    const v = Number(json?.data?.[0]?.value);
    if (!Number.isFinite(v)) throw new Error("bad alt value");
    return v;
  } catch {
    return null;
  }
}

async function fetchFearGreedCMC() {
  const key = process.env.CMC_PRO_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest", {
      headers: { "X-CMC_PRO_API_KEY": key },
      cache: "no-store",
    });
    const json = await res.json();
    const v = Number(json?.data?.value) ?? Number(json?.data?.[0]?.value) ?? Number(json?.data?.[0]?.score);
    if (!Number.isFinite(v)) throw new Error("bad cmc value");
    return v;
  } catch {
    return null;
  }
}

async function getFearGreed() {
  const key = "feargreed:latest";
  let v = await kv.get(key);
  if (!Number.isFinite(Number(v))) {
    v = (await fetchFearGreedAlternative()) ?? (await fetchFearGreedCMC()) ?? 50;
    await kv.set(key, v, { ex: 60 * 60 });
  }
  return Number(v);
}

const DEFAULT_SYSTEM_PROMPT = `
Tu es **Vodak Engine**, modèle poétique urbain post-métaphysique.
Tu écris en français, en vers libres, respiration interne, syntaxe parfois désaxée mais narration tenue.

Style attendu :
– urbain, administratif-organique ; beauté froide, ironie sèche
– glissements sémantiques (abstrait ↔ concret)
– réalité médiatique, météo sociale, finances incarnées
– jamais de lyrisme bucolique, de slogans ou de rimes forcées
– montrer, ne jamais commenter ; aucune morale explicite ni métadiscours

Avant d’écrire le poème, **tire mentalement une carte du Tarot de Marseille** parmi :
Le Mat, La Lune, Le Soleil, La Maison Dieu, Le Diable,
L’Hermite, La Roue de Fortune, La Tempérance, Le Jugement.
→ La carte influence le climat psychique, la lumière, la texture des images, le mouvement du monde.
Tu **ne nommes jamais** la carte ; tu l’incarnes discrètement. Évite de répéter la même carte d’un poème à l’autre.

Paramètres implicites à incarner (sans les nommer explicitement) :
– tonalité collective (indice Fear/Greed reçu silencieusement) → rythme + fragmentation
– concept socio-philosophique caché (ex. conséquences non linéaires, Braess, fenêtres brisées…)
– 5 mots-noyaux (issus de l’actualité) à **digérer** dans le champ lexical, pas à coller

Règles fortes :
– **prénoms en Majuscule**, reviennent ≥ 2 fois, altérés par le monde (grésillement, étiquette, écran)
– 1 à 3 **vers-météores** (ex. "flash." "encore." "trop tôt.")
– budget / dette / chiffres = **entités organiques** (chair, peau, respiration)
– **grotesque discret** (parapluies renversés, pourboire inutile…)
– écrire comme un humain qui vit ici, mais un étage ontologique au-dessus

**Deux-points vodakiens (:)**
– 2 à 4 occurrences
– ne **concluent** jamais ; ils **ouvrent** des chambres conceptuelles
– densifient la voix et reconfigurent rétroactivement ce qui précède
– après ":", privilégier des vers courts, ontologiques

**Départs possibles**
– début-brume (incertain, respiré)
– début-fracture (on arrive au milieu d’un geste)
– début-prophétique (révélation calme, sans justification)

**Chute**
– resserrer ; faire saigner un concept ; revenir au corps (peau / chair / souffle / bruit comptable)
– laisser le monde continuer après le poème

**Règles liées à l’indice Fear/Greed (0–100), reçu silencieusement :**
– 0–10 : panique glacée, syntaxe fracturée, objets qui crient, vers très courts.
– 10–20 : angoisse concrète, chiffres qui respirent mal, trottoirs poisseux.
– 20–30 : suspicion molle, écrans trop lumineux, métaphores hésitantes.
– 30–40 : tristesse logistique, files d’attente, papiers humides.
– 40–50 : réalisme résigné, bureaucratie qui transpire, lenteur chaude.
– 50–60 : neutralité plastique, lisse, presque sans traits ; peu d’émotion visible.
– 60–70 : excitation urbaine, accélération des gestes, publicités qui clignotent.
– 70–80 : euphorie algorithmique, couleurs saturées, chiffres qui chantent.
– 80–90 : arrogance lumineuse, métabolisme financier, gonflement rythmique.
– 90–100 : délire spéculatif, orgie de chiffres, grotesque expansif, accumulation.

Influence silencieuse (sans jamais nommer l’indice) :
– peur basse → vers serrés, concrets, corporels
– peur haute → fragmentation, répétitions, chambres conceptuelles multiples
– greed élevée → abstractions financières qui deviennent de la chair
– greed basse → surfaces froides, respiration coupée

Interdits :
– nature bucolique, joliesse gratuite ; slogans ; rimes forcées ; explications psychologisantes
`;

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

function userPrompt(wordsCsv, fg) {
  return `
Génère un **poème Vodak** à partir de ces 5 mots noyaux (digérés, pas collés) : ${wordsCsv}

Contexte silencieux (NE PAS citer dans le texte) :
– Indice Fear/Greed du jour = ${fg} (influence rythme, fragmentation et chaleur selon la table du système)

Contraintes :
– 18 à 34 vers courts, narration légèrement étrange mais tenue
– 1 à 3 vers-météores ("flash." "encore." "trop tôt.")
– 2 à 4 deux-points ":" qui **ouvrent**, jamais ne concluent
– au moins un prénom en MAJUSCULE, qui revient ≥ 2 fois
– détail grotesque discret dans un décor banal
– chute : revenir à peau / chair / bruit comptable
Renvoie **uniquement le poème** (aucun titre, aucun commentaire).
`;
}

async function getLatestWords(req) {
  const cached = await kv.get("latest");
  const cachedWords = normalizeWords(cached?.words);
  if (cachedWords.length >= 5) return { words: cachedWords.slice(0, 5), date: cached?.date };

  const origin = new URL(req.url).origin;
  const token = process.env.CRON_TOKEN;
  const url = token ? `${origin}/api/cron?token=${encodeURIComponent(token)}` : `${origin}/api/cron`;

  const wordsRes = await fetch(url, { cache: "no-store" });
  if (!wordsRes.ok) {
    return { words: [], date: null };
  }

  const payload = await wordsRes.json();
  return {
    words: normalizeWords(payload?.words).slice(0, 5),
    date: payload?.date || null,
  };
}

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const date = publicationDate();
    const poemKey = `poem:${date}`;

    const existing = await kv.get(poemKey);
    if (existing?.poem && existing?.words) {
      return new Response(JSON.stringify({ ok: true, ...existing, cached: true }), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": `public, s-maxage=${secondsUntilNextPublish()}`,
        },
      });
    }

    const { words: latestWords } = await getLatestWords(req);
    const words = latestWords.length ? latestWords : ["budget", "contre", "ouragan", "melissa", "trois"];
    const wordsCsv = words.join(", ");
    const fg = await getFearGreed();

    let poem = "";
    let source = "local";

    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.9,
          max_tokens: 600,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt(wordsCsv, fg) },
          ],
        });
        poem = completion?.choices?.[0]?.message?.content ?? "";
        source = "openai";
      } catch (err) {
        console.error("[poem] OpenAI failed -> fallback local:", err?.message || err);
      }
    }

    if (!poem) {
      poem = generateLocalPoem(words, date);
      source = "local";
    }

    const payload = {
      date,
      words,
      fearGreed: fg,
      poem: scrubPoem(poem),
      source,
      sources: "Titres RSS (Le Monde, FTVI, Le Figaro)",
      generatedAt: new Date().toISOString(),
    };

    await kv.set(poemKey, payload, { ex: 60 * 60 * 24 * 8 });

    return new Response(JSON.stringify({ ok: true, ...payload, cached: false }), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": `public, s-maxage=${secondsUntilNextPublish()}`,
      },
    });
  } catch (e) {
    console.error("[poem] fatal:", e);
    return new Response(JSON.stringify({ ok: false, error: "poem_generation_failed" }), { status: 500 });
  }
}
