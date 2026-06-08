import { COUNTRIES } from "@/lib/data";

const SMSPVA_V1 = "https://smspva.com";
const countCache = new Map<string, { data: Record<string, number>; expires: number }>();

async function fetchCount(apiKey: string, svc: string, country: string): Promise<number> {
  try {
    const url = `${SMSPVA_V1}/priemnik.php?method=get_count_new&service=${svc}&country=${country}&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return -1;
    const d = await res.json();
    const n = typeof d?.online === "number" ? d.online : (typeof d?.total === "number" ? d.total : -1);
    return n;
  } catch {
    return -1;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ smspvaCode: string }> }
) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) return Response.json({}, { status: 503 });

  const { smspvaCode } = await params;
  const now = Date.now();
  const cached = countCache.get(smspvaCode);
  if (cached && cached.expires > now) return Response.json(cached.data);

  // Fetch real counts for all supported countries in parallel
  const results = await Promise.allSettled(
    COUNTRIES.map(cc =>
      fetchCount(apiKey, smspvaCode, cc.smspvaCode).then(n => ({ cc: cc.smspvaCode, n }))
    )
  );

  const counts: Record<string, number> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.n >= 0) {
      counts[r.value.cc] = r.value.n;
    }
  }

  countCache.set(smspvaCode, { data: counts, expires: now + 3 * 60 * 1000 });
  return Response.json(counts);
}
