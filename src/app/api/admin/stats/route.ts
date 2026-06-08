import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const [
    { data: txns },
    { data: orderRows },
    { count: userCount },
    { count: totalOrderCount },
    { data: statusRows },
  ] = await Promise.all([
    supabaseAdmin.from("transactions").select("data, created_at").order("created_at", { ascending: true }),
    supabaseAdmin.from("orders").select("created_at").order("created_at", { ascending: true }),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("data->status"),
  ]);

  // Monthly chart buckets (last 12 months)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const revenue = months.map(({ year, month }) =>
    (txns ?? []).filter((r: any) => {
      const d = new Date(r.created_at);
      return d.getFullYear() === year && d.getMonth() === month &&
        r.data?.t === "topup" && (r.data?.amt ?? 0) > 0;
    }).reduce((s: number, r: any) => s + (r.data?.amt ?? 0), 0)
  );

  const orders = months.map(({ year, month }) =>
    (orderRows ?? []).filter((r: any) => {
      const d = new Date(r.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );

  const labels = months.map(({ year, month }) =>
    new Date(year, month, 1).toLocaleString("en-US", { month: "short" })
  );

  // Real platform-wide stats
  const allOrders = totalOrderCount ?? 0;
  const expired = (statusRows ?? []).filter((r: any) => r.status === "expired").length;
  const received = (statusRows ?? []).filter((r: any) => r.status === "received").length;
  const refundRate = allOrders > 0 ? ((expired / allOrders) * 100).toFixed(1) : "0.0";
  const successRate = allOrders > 0 ? Math.round((received / allOrders) * 100) : 0;
  const totalRevenue = (txns ?? [])
    .filter((r: any) => r.data?.t === "topup" && (r.data?.amt ?? 0) > 0)
    .reduce((s: number, r: any) => s + (r.data?.amt ?? 0), 0);

  return Response.json({
    revenue, orders, labels,
    userCount: userCount ?? 0,
    totalOrderCount: allOrders,
    refundRate,
    successRate,
    totalRevenue,
  });
}
