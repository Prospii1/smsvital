import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { data: rows, error } = await supabaseAdmin
    .from("orders")
    .select("data, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const orders = (rows ?? []).map((r: any) => ({
    id: r.data?.id || `ORD-${r.created_at}`,
    svc: r.data?.svc || "unknown",
    cc: r.data?.cc || "unknown",
    number: r.data?.number || "unknown",
    code: r.data?.code || null,
    price: r.data?.price || 0,
    status: r.data?.status || "unknown",
    smspvaOrderId: r.data?.smspvaOrderId || null,
    created_at: r.created_at,
  }));

  return Response.json(orders);
}
