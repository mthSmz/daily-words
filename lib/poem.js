// lib/poem.js — générateur local, déterministe (pas d'IA)

function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
function pick(arr, n) { return arr[n % arr.length]; }

export function generateLocalPoem(words, date) {
  const seed = hashSeed(date + "::" + words.join("|"));
  const tones = [
    "voix basse, ironie noire",
    "saccadé, un souffle de gare",
    "clair-obscur, comme un néon mouillé",
    "doucement cruel, presque tendre"
  ];
  const breaks = ["—", "·", ":", "…"];
  const t = pick(tones, seed), b = pick(breaks, seed >> 3);

  return [
    `${words[0]} ${b} dans la poche, comme une pièce fausse`,
    `${words[1]} qui coule sur les trottoirs — j’en bois la météo`,
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
