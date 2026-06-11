import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { clearCatalogCache } from "@/app/api/sms/catalog/route";

interface Tier { from: number; to: number; percent: number; }

const DEFAULT_TIERS: Tier[] = [{ from: 0, to: 9999, percent: 35 }];
const DEFAULTS = { tiers: DEFAULT_TIERS, min_usd: 0.05, usd_to_ngn: 1600 };

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { data, error } = await supabaseAdmin
    .from("admin_config")
    .select("value")
    .eq("key", "markup")
    .single();

  if (error || !data) return Response.json(DEFAULTS);
  const v = data.value ?? {};
  return Response.json({
    tiers:      Array.isArray(v.tiers) && v.tiers.length ? v.tiers : DEFAULT_TIERS,
    min_usd:    typeof v.min_usd    === "number" ? v.min_usd    : DEFAULTS.min_usd,
    usd_to_ngn: typeof v.usd_to_ngn === "number" ? v.usd_to_ngn : DEFAULTS.usd_to_ngn,
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const { tiers, min_usd, usd_to_ngn } = body;

  if (!Array.isArray(tiers) || tiers.length === 0)
    return Response.json({ error: "At least 1 tier is required" }, { status: 400 });
  if (tiers.length > 10)
    return Response.json({ error: "Maximum 10 tiers allowed" }, { status: 400 });
  for (const t of tiers) {
    if (typeof t.from !== "number" || typeof t.to !== "number" || typeof t.percent !== "number")
      return Response.json({ error: "Each tier must have numeric from, to, percent" }, { status: 400 });
    if (t.from < 0)
      return Response.json({ error: "Tier 'from' cannot be negative" }, { status: 400 });
    if (t.to <= t.from)
      return Response.json({ error: "Tier 'to' must be greater than 'from'" }, { status: 400 });
    if (t.percent < 0 || t.percent > 1000)
      return Response.json({ error: "Tier percent must be 0–1000" }, { status: 400 });
  }
  if (typeof min_usd !== "number" || min_usd < 0 || min_usd > 100)
    return Response.json({ error: "min_usd must be 0–100" }, { status: 400 });
  if (typeof usd_to_ngn !== "number" || usd_to_ngn < 100 || usd_to_ngn > 100000)
    return Response.json({ error: "usd_to_ngn must be 100–100,000" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("admin_config")
    .upsert({ key: "markup", value: { tiers, min_usd, usd_to_ngn } });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Clear in-memory catalog cache so new markup applies immediately on this instance
  clearCatalogCache();

  return Response.json({ ok: true });
}
