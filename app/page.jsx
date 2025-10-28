// app/page.jsx
import { kv } from "@vercel/kv";
import { fetchRSS, top5FromTitles } from "@/lib/news";
import { generateLocalPoem } from "@/lib/poem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // 1) Récupère { date, words } depuis KV (ou calcule à la volée)
  let data = await kv.get("latest"); // { date, words } | null

  if (!data) {
    try {
      const titles = await fetchRSS();
      data = {
        date: new Date().toISOString().slice(0, 10),
        words: top5FromTitles(titles),
      };
    } catch {
      data = {
        date: new Date().toISOString().slice(0, 10),
        words: ["actualité", "monde", "politique", "économie", "culture"],
      };
    }
  }

  // 2) Présentation de la date côté UI (Europe/Paris)
  const today = new Date().toLocaleDateString("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  });

  // 3) Génère un poème déterministe à partir des 5 mots + date
  const poem = generateLocalPoem(data.words, data.date);

  return (
    <main
      style={{
