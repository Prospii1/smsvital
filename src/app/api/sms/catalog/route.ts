import { COUNTRIES, SERVICES, priceFor, availFor } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SMSPVA_BASE = "https://api.smspva.com";

let cache: { data: CatalogData; expires: number } | null = null;

interface CatalogEntry { price: number; count: number; }
interface CatalogData {
  prices: Record<string, CatalogEntry>;
  markup: { percent: number; min_usd: number; usd_to_ngn: number };
  fetchedAt: number;
}

async function getMarkup(): Promise<{ percent: number; min_usd: number; usd_to_ngn: number }> {
  try {
    const { data } = await supabaseAdmin
      .from("admin_config")
      .select("value")
      .eq("key", "markup")
      .single();
    if (data?.value) return { percent: 35, min_usd: 0.05, usd_to_ngn: 1600, ...data.value };
  } catch {}
  return { percent: 35, min_usd: 0.05, usd_to_ngn: 1600 };
}

function toNgn(usdPrice: number, m: { percent: number; min_usd: number; usd_to_ngn: number }): number {
  const fee = Math.max(usdPrice * (m.percent / 100), m.min_usd);
  return Math.round((usdPrice + fee) * m.usd_to_ngn);
}

async function buildCatalog(): Promise<CatalogData> {
  const markup = await getMarkup();
  const apiKey = process.env.SMSPVA_API_KEY;
  const prices: Record<string, CatalogEntry> = {};

  if (apiKey) {
    await Promise.allSettled(
      COUNTRIES.map(async (cc) => {
        try {
          const res = await fetch(
            `${SMSPVA_BASE}/activation/services/${cc.smspvaCode}`,
            { headers: { apikey: apiKey }, cache: "no-store" }
          );
          if (!res.ok) return;
          const data = await res.json();
          const list: Array<{ service: string; price: number | string; count: number | string }> =
            Array.isArray(data) ? data : (data.services ?? data.data ?? []);
          for (const item of list) {
            const key = `${item.service}_${cc.smspvaCode}`;
            prices[key] = {
              price: toNgn(Number(item.price), markup),
              count: Number(item.count ?? 0),
            };
          }
        } catch {}
      })
    );
  }

  // Fallback for any combo SMSPVA didn't return
  for (const svc of SERVICES) {
    for (const cc of COUNTRIES) {
      const key = `${svc.smspvaCode}_${cc.smspvaCode}`;
      if (!prices[key]) {
        prices[key] = {
          price: priceFor(svc, cc, markup.usd_to_ngn),
          count: availFor(svc, cc),
        };
      }
    }
  }

  return { prices, markup, fetchedAt: Date.now() };
}

export async function GET() {
  const now = Date.now();
  if (!cache || cache.expires < now) {
    const data = await buildCatalog();
    cache = { data, expires: now + 10 * 60 * 1000 };
  }
  return Response.json(cache.data);
}
