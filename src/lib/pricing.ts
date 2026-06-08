import { supabaseAdmin } from "./supabase-admin";

export interface Tier { from: number; to: number; percent: number; }
export interface Markup { tiers: Tier[]; min_usd: number; usd_to_ngn: number; }

export const DEFAULT_MARKUP: Markup = {
  tiers: [{ from: 0, to: 9999, percent: 35 }],
  min_usd: 0.05,
  usd_to_ngn: 1600,
};

export async function getMarkup(): Promise<Markup> {
  try {
    const { data } = await supabaseAdmin
      .from("admin_config").select("value").eq("key", "markup").single();
    if (data?.value) {
      const v = data.value;
      return {
        tiers:      Array.isArray(v.tiers) && v.tiers.length ? v.tiers : DEFAULT_MARKUP.tiers,
        min_usd:    typeof v.min_usd    === "number" ? v.min_usd    : DEFAULT_MARKUP.min_usd,
        usd_to_ngn: typeof v.usd_to_ngn === "number" ? v.usd_to_ngn : DEFAULT_MARKUP.usd_to_ngn,
      };
    }
  } catch {}
  return DEFAULT_MARKUP;
}

export function getTierPercent(usd: number, tiers: Tier[]): number {
  for (const t of tiers) {
    if (usd >= t.from && usd <= t.to) return t.percent;
  }
  return tiers[tiers.length - 1]?.percent ?? 35;
}

export function toNgn(usd: number, m: Markup): number {
  const pct = getTierPercent(usd, m.tiers);
  const fee = Math.max(usd * (pct / 100), m.min_usd);
  return Math.round((usd + fee) * m.usd_to_ngn);
}

const SMSPVA_V1 = "https://smspva.com";

export async function fetchSmspvaPrice(apiKey: string, svcCode: string, ccCode: string): Promise<number | null> {
  try {
    const url = `${SMSPVA_V1}/priemnik.php?method=get_service_price&service=${svcCode}&country=${ccCode}&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    if (d?.response === "1" && d?.price) return Number(d.price);
  } catch {}
  return null;
}
