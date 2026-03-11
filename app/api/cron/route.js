import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchRSS, top5FromTitles } from "@/lib/news";

export const runtime = "nodejs";

function isAuthorized(request) {
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "1") return true;

  const configuredToken = process.env.CRON_TOKEN;
  if (!configuredToken) return true;

  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken && queryToken === configuredToken) return true;

  const authHeader = request.headers.get("authorization") || "";
  if (authHeader === `Bearer ${configuredToken}`) return true;

  return false;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const titles = await fetchRSS();
  if (!titles.length) {
    return NextResponse.json({ ok: false, error: "no_titles" }, { status: 500 });
  }

  const words = top5FromTitles(titles);
  if (!words.length) {
    return NextResponse.json({ ok: false, error: "no_words" }, { status: 500 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const payload = { date, words, sources: "Titres RSS (Le Monde, FTVI, Le Figaro)" };

  await kv.set(`daily:${date}`, payload, { ex: 60 * 60 * 24 * 7 });
  await kv.set("latest", payload, { ex: 60 * 60 * 24 * 7 });

  return NextResponse.json({ ok: true, ...payload });
}
