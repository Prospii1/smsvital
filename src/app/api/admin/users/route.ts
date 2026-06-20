import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  try {
    // 1. Fetch auth users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Fetch profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, balance");
    if (profileError) throw profileError;

    // 3. Fetch orders (to count per user)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("user_id, data");
    if (ordersError) throw ordersError;

    // Build lookup maps
    const profileMap = new Map(profiles?.map(p => [p.id, p.balance]) ?? []);

    // Count orders per user and sum price of successful (received) orders only
    const orderCountMap = new Map<string, number>();
    const spentMap = new Map<string, number>();
    for (const o of (orders ?? [])) {
      if (!o.user_id) continue;
      orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
      if (o.data?.status === "received") {
        const price = Number(o.data?.price ?? 0);
        spentMap.set(o.user_id, (spentMap.get(o.user_id) ?? 0) + price);
      }
    }

    // Format final list of users
    const result = users.map(u => {
      const balance = profileMap.get(u.id) ?? 0;
      const oCount = orderCountMap.get(u.id) ?? 0;
      const spent = spentMap.get(u.id) ?? 0;

      return {
        id: u.id.slice(0, 8).toUpperCase(),
        email: u.email || "no-email",
        balance,
        orders: oCount,
        spent,
        status: u.banned_until ? "banned" : "active",
        joined: u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "unknown"
      };
    });

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
