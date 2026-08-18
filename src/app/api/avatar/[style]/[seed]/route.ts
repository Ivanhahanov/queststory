import { NextResponse } from "next/server";
import { DICEBEAR_STYLES } from "@/lib/dicebear";

// Аватарки раньше грузились напрямую с api.dicebear.com с каждого устройства
// игрока — на плохом или заблокированном для внешних хостов интернете (в т.ч.
// из России) это давало до 10с ожидания на каждую аватарку или полный обрыв.
// Здесь Vercel сам сходит за svg один раз и дальше отдаёт его же с нашего
// домена, закешированным на edge — seed+style детерминируют результат.
export async function GET(req: Request, { params }: { params: Promise<{ style: string; seed: string }> }) {
  const { style, seed: seedParam } = await params;
  if (!DICEBEAR_STYLES.some((s) => s.id === style)) {
    return NextResponse.json({ error: "unknown style" }, { status: 400 });
  }

  const seed = seedParam.replace(/\.svg$/, "");
  const backgroundColor = new URL(req.url).searchParams.get("backgroundColor");

  const upstream = new URL(`https://api.dicebear.com/9.x/${style}/svg`);
  upstream.searchParams.set("seed", seed);
  if (backgroundColor) upstream.searchParams.set("backgroundColor", backgroundColor);

  const res = await fetch(upstream, { next: { revalidate: 31536000 } });
  if (!res.ok) return NextResponse.json({ error: "upstream error" }, { status: 502 });

  return new NextResponse(await res.text(), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
