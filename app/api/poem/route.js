import { headers } from "next/headers";
import { generateLocalPoem } from "@/lib/poem";

// Cache jusqu'à 15:00 Europe/Paris (comme tes mots)
function parisNow() { return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" })); }
function secondsUntilNextPublish() {
  const now = parisNow();
  const next = new Date(now);
  next.setHours(15, 0, 0, 0);
  if (now >= next) next.setDate(next.getDate() + 1);
  return Math.max(1, Math.floor((next - now) / 1000));
}

export async function GET() {
  // Base URL sûre (dev/prod) sans variable d'env supplémentaire
  const host = headers().get("host");
  const proto = process.env.VERCEL ? "https" : "http";
  const base = `${proto}://${host}`;

  // Récupère tes 5 mots via ton endpoint déjà en place
  const token = process.env.CRON_TOKEN; // déjà "supersecret"
  const r = await fetch(`${base}/api/cron?token=${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!r.ok) {
    return new Response(JSON.stringify({ ok: false, error: "cron_fetch_failed" }), { status: 500 });
  }
  const { date, words } = await r.json();

  const poem = generateLocalPoem(words, date);

  const res = new Response(JSON.stringify({ ok: true, date, words, poem }), {
    headers: { "content-type": "application/json" }
  });
  res.headers.set("cache-control", `public, s-maxage=${secondsUntilNextPublish()}`);
  return res;
}
