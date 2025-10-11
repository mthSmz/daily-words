import { kv } from "@vercel/kv";
import { fetchRSS, top5FromTitles } from "@/lib/news";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  let data = await kv.get("latest"); // { date, words } | null

  if (!data) {
    try {
      const titles = await fetchRSS();
      data = { date: new Date().toISOString().slice(0,10), words: top5FromTitles(titles) };
    } catch {
      data = { date: new Date().toISOString().slice(0,10), words: ["actualité","monde","politique","économie","culture"] };
    }
  }

  const today = new Date().toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" });

  return (
    <main style={{ minHeight:"100vh", display:"grid", placeItems:"center", background:"#0b0b0c", color:"#f2f2f3", padding:"2rem" }}>
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1 style={{ fontSize: 40, marginBottom: 12, fontWeight: 700 }}>5 mots du jour</h1>
        <p style={{ opacity: .65, marginBottom: 16, fontSize: 20 }}>{today} — <span>Source : titres RSS (Le Monde, FTVI, Le Figaro)</span></p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {data.words.map((w) => (
            <span key={w} style={{ padding:"10px 16px", borderRadius:999, border:"1px solid #2a2a2e", background:"#151518", fontSize:18 }}>
              {w}
            </span>
          ))}
        </div>
        <footer style={{ marginTop: 40, opacity: .5, fontSize: 14 }}>© {new Date().getFullYear()} — Daily Words (MVP)</footer>
      </div>
    </main>
  );
}
