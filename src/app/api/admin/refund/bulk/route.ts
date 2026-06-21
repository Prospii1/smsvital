import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, data, created_at")
    .eq("data->>status", "waiting");

  if (error || !orders) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  const now = Date.now();
  let refundCount = 0;
  let refundedAmount = 0;

  for (const order of orders) {
    const createdAt = new Date(order.created_at).getTime();
    const expires = order.data?.expires ?? 600;
    const elapsed = (now - createdAt) / 1000;

    if (elapsed < expires) continue;

    const price = order.data?.price ?? 0;
    const userId = order.user_id;

    const { data: claimed } = await supabaseAdmin
      .from("orders")
      .update({ data: { ...order.data, status: "expired" } })
      .eq("id", order.id)
      .eq("data->>status", "waiting")
      .select("id");

    if (!claimed || claimed.length === 0) continue;

    await supabaseAdmin.rpc("credit_balance", { user_id: userId, amount: price });

    const txnId = "TXN-REF-" + order.id.slice(4);
    await supabaseAdmin
      .from("transactions")
      .upsert({
        id: txnId,
        user_id: userId,
        data: {
          id: txnId,
          t: "refund",
          label: "Refund · admin bulk",
          amt: +price,
          ref: order.id,
          when: new Date().toLocaleString("en-NG"),
        },
        created_at: new Date().toISOString(),
      }, { ignoreDuplicates: true });

    await supabaseAdmin.from("orders").delete().eq("id", order.id);

    refundCount++;
    refundedAmount += price;
  }

  return Response.json({ ok: true, refundCount, refundedAmount });
}
