import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULTS = { percent: 35, min_usd: 0.05, usd_to_ngn: 1600 };

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("admin_config")
    .select("value")
    .eq("key", "markup")
    .single();

  if (error || !data) return Response.json(DEFAULTS);
  return Response.json({ ...DEFAULTS, ...data.value });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { percent, min_usd, usd_to_ngn } = body;

  if (typeof percent !== "number" || typeof min_usd !== "number" || typeof usd_to_ngn !== "number") {
    return Response.json({ error: "Invalid values" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("admin_config")
    .upsert({ key: "markup", value: { percent, min_usd, usd_to_ngn } });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
