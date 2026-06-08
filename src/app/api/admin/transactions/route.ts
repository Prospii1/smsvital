import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { data: rows, error } = await supabaseAdmin
    .from("transactions")
    .select("data, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const txns = (rows ?? []).map((r: any) => {
    const age = r.created_at ? new Date(r.created_at).toLocaleString() : "unknown";
    return {
      id: r.data?.id || `TXN-${r.created_at}`,
      label: r.data?.label || "unknown",
      ref: r.data?.ref || "unknown",
      t: r.data?.t || "purchase",
      amt: r.data?.amt || 0,
      when: r.data?.when || age,
      created_at: r.created_at
    };
  });

  return Response.json(txns);
}
