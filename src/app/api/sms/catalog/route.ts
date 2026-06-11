import { COUNTRIES, SERVICES as STATIC_SERVICES, priceFor, availFor } from "@/lib/data";
import { SMSPVA_MAP } from "@/lib/smspva-map";
import { getMarkup, toNgn, type Markup } from "@/lib/pricing";

const SMSPVA_V1 = "https://smspva.com";
const REF_COUNTRY = "VN";
const BATCH = 40;
const CACHE_TTL = 5 * 60 * 1000;

let cache: { data: CatalogData; expires: number; markupHash: string } | null = null;

interface CatalogEntry { price: number; count: number; }
interface ServiceInfo {
  id: string; name: string; smspvaCode: string;
  c: string; logoUrl: string; base: number; avail: number;
}
interface CatalogData {
  prices: Record<string, CatalogEntry>;
  services: ServiceInfo[];
  countries: typeof COUNTRIES;
  markup: Markup;
  fetchedAt: number;
}

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h % 360)}, 70%, 55%)`;
}

function slugToId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

async function fetchAllServiceCodes(apiKey: string): Promise<string[]> {
  try {
    const url = `${SMSPVA_V1}/priemnik.php?method=get_price&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return [...new Set<string>(data.map((r: any) => r.Service).filter(Boolean))];
  } catch { return []; }
}

async function fetchRefPrice(apiKey: string, svcCode: string): Promise<number | null> {
  try {
    const url = `${SMSPVA_V1}/priemnik.php?method=get_service_price&service=${svcCode}&country=${REF_COUNTRY}&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (d?.response === "1" && d?.price) return Number(d.price);
  } catch {}
  return null;
}

async function fetchPrice(apiKey: string, svc: string, country: string): Promise<number | null> {
  try {
    const url = `${SMSPVA_V1}/priemnik.php?method=get_service_price&service=${svc}&country=${country}&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (d?.response === "1" && d?.price) return Number(d.price);
  } catch {}
  return null;
}

async function buildCatalog(markup: Markup): Promise<CatalogData> {
  const apiKey = process.env.SMSPVA_API_KEY;
  const prices: Record<string, CatalogEntry> = {};
  const servicesMap: Map<string, ServiceInfo> = new Map();

  if (apiKey) {
    const allCodes = await fetchAllServiceCodes(apiKey);

    const refPrices = new Map<string, number>();
    for (let i = 0; i < allCodes.length; i += BATCH) {
      const batch = allCodes.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(code => fetchRefPrice(apiKey, code).then(p => ({ code, p })))
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.p !== null) {
          refPrices.set(r.value.code, r.value.p);
        }
      }
    }

    for (const [code, refUsd] of refPrices) {
      const known = SMSPVA_MAP[code];
      const name  = known?.name ?? `Service ${code.replace('opt', '#')}`;
      const slug  = known?.slug;
      const color = known?.c ?? colorFor(name);
      const id    = known ? slugToId(name) : code;
      const logoUrl = slug
        ? `https://cdn.simpleicons.org/${slug}`
        : `https://cdn.simpleicons.org/${slugToId(name)}`;

      servicesMap.set(code, { id, name, smspvaCode: code, c: color, logoUrl, base: refUsd, avail: 10000 });
      prices[`${code}_${REF_COUNTRY}`] = { price: toNgn(refUsd, markup), count: 10000 };
    }

    const featured = STATIC_SERVICES.map(s => s.smspvaCode);
    const combos: Array<[string, string]> = [];
    for (const svc of featured) {
      for (const cc of COUNTRIES) {
        const k = `${svc}_${cc.smspvaCode}`;
        if (!prices[k]) combos.push([svc, cc.smspvaCode]);
      }
    }
    for (let i = 0; i < combos.length; i += BATCH) {
      const batch = combos.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map(async ([svc, cc]) => {
          const p = await fetchPrice(apiKey, svc, cc);
          if (p !== null) {
            const svcInfo = servicesMap.get(svc);
            const ccInfo = COUNTRIES.find(c => c.smspvaCode === cc);
            prices[`${svc}_${cc}`] = {
              price: toNgn(p, markup),
              count: svcInfo && ccInfo ? availFor(svcInfo, ccInfo) : 5000,
            };
          }
        })
      );
    }
  }

  const activeServices = servicesMap.size > 0
    ? Array.from(servicesMap.values())
    : STATIC_SERVICES.map(s => ({ ...s, logoUrl: s.logoUrl }));

  for (const svc of STATIC_SERVICES) {
    for (const cc of COUNTRIES) {
      const k = `${svc.smspvaCode}_${cc.smspvaCode}`;
      if (!prices[k]) {
        prices[k] = { price: priceFor(svc, cc, markup.usd_to_ngn), count: availFor(svc, cc) };
      }
    }
    if (!servicesMap.has(svc.smspvaCode)) {
      activeServices.push({ ...svc, logoUrl: svc.logoUrl });
    }
  }

  activeServices.sort((a, b) => {
    const aKnown = !!SMSPVA_MAP[a.smspvaCode];
    const bKnown = !!SMSPVA_MAP[b.smspvaCode];
    if (aKnown !== bKnown) return aKnown ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return { prices, services: activeServices, countries: COUNTRIES, markup, fetchedAt: Date.now() };
}

export async function GET() {
  const now = Date.now();

  // Always check current markup hash so cache is invalidated when markup changes
  const currentMarkup = await getMarkup();
  const markupHash = JSON.stringify(currentMarkup);

  if (!cache || cache.expires < now || cache.markupHash !== markupHash) {
    const data = await buildCatalog(currentMarkup);
    cache = { data, expires: now + CACHE_TTL, markupHash };
  }
  return Response.json(cache.data);
}

export { cache };
export function clearCatalogCache() { cache = null; }

export async function DELETE() {
  const { requireAdmin } = await import("@/lib/admin-guard");
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  cache = null;
  return Response.json({ ok: true });
}
