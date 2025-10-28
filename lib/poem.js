// Fallback déterministe local (seed = date + mots) si pas d'API OpenAI.
function hashSeed(s) {
  let h = 2166136261; for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24); }
  return Math.abs(h);
}
function pick(arr, r) { return arr[r % arr.length]; }

export function generateLocalPoem(words, date) {
  const seed = hashSeed(date + "::" + words.join("|"));
  const tones = [
    "voix basse, ironie noire",
    "saccadé, un souffle de gare",
    "clair-obscur, comme un néon mouillé",
    "doucement cruel, presque tendre"
  ];
  const breaks = ["—", "·", ":", "…"];
  const t = pick(tones, seed), b = pick(breaks, seed>>3);

  // Petit “Vodak-like” (vers libres, collisions, glissements sémantiques)
  return [
    `${words[0]} ${b} dans la poche, comme une pièce fausse`,
    `${words[1]} qui coule sur les trottoirs — j'en bois la météo`,
    `on répète ${words[2]} pour conjurer la panne des slogans`,
    `et ${words[3]} claque aux feux rouges,`,
    `pendant que ${words[4]} compte ses ombres au standard`,
    ``,
    `je passe sous les vitrines où l’actualité se recoiffe`,
    `le monde a ce goût métallique des tickets compostés`,
    `je souris de travers, ${t},`,
    `et je rentre tard, avec cinq épines dans la langue`
  ].join("\n");
}

// ---- Option IA (si tu veux utiliser ton OPENAI_API_KEY) ----
export async function generateAIPoem(words, date) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const prompt = `
Tu es un poète (style Vodak : sublime + grotesque, ironie, collisions).
Écris un poème bref (12–18 vers, strophes irrégulières) en français.
Contrainte: utilise de façon organique ces 5 mots: ${words.join(", ")}.
Évite la grandiloquence automatique, préfère les images concrètes, urbaines.
Garde une musicalité sèche, quelques signes de ponctuation inattendus, pas de rimes forcées.
Le poème doit être autonome, sans titres. Date à incorporer subtilement: ${date}.
`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini", // ou ton modèle préféré
      temperature: 0.7,
      messages: [
        { role: "system", content: "Tu écris des poèmes nerveux, contemporains, à voix singulière." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}
