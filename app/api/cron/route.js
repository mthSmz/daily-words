import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchRSS, top5FromTitles } from "@/lib/news";

export const runtime = "edge";

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const titles = await fetchRSS();
  if (!titles.length) {
    return NextResponse.json({ ok: false, error: "no_titles" }, { status: 500 });
  }

  const words = top5FromTitles(titles);
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const payload = { date, words };

  await kv.set(`daily:${date}`, payload);
  await kv.set("latest", payload);

  return NextResponse.json({ ok: true, ...payload });
}
