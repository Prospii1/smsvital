import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SMSPVA_BASE = "https://api.smspva.com";

export async function POST() {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) return Response.json({ error: "Service unavailable" }, { status: 503 });

  const authUser = await getAuthenticatedUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all orders for this user
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, data, created_at")
    .eq("user_id", authUser.userId);

  if (error || !orders) {
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  const now = Date.now();
  let refundCount = 0;
  let refundedAmount = 0;

  for (const order of orders) {
    if (!order.data || order.data.status !== "waiting") continue;

    const createdAt = new Date(order.created_at).getTime();
    const expires = order.data.expires ?? 600;
    const elapsed = (now - createdAt) / 1000;

    // Refund if we're past the expiration time (with a tiny 5s buffer to avoid race conditions)
    if (elapsed >= (expires - 5)) {
      const price = order.data.price ?? 0;
      const smspvaOrderId = order.data.smspvaOrderId;

      if (smspvaOrderId) {
        await fetch(`${SMSPVA_BASE}/activation/blocknumber/${smspvaOrderId}`, {
          method: "PUT",
          headers: { apikey: apiKey },
          cache: "no-store",
        }).catch(() => {});
      }

      // Mark order expired in DB
      await supabaseAdmin
        .from("orders")
        .update({ data: { ...order.data, status: "expired" } })
        .eq("id", order.id);

      // Refund balance atomically
      await supabaseAdmin
        .rpc("credit_balance", { user_id: authUser.userId, amount: price });

      // Record refund transaction
      const txnId = "TXN-REF-" + order.id.slice(4);
      const txn = {
        id: txnId,
        t: "refund",
        label: `Refund · timeout`,
        amt: +price,
        ref: order.id,
        when: new Date().toLocaleString("en-NG"),
      };
      await supabaseAdmin
        .from("transactions")
        .insert({ id: txnId, user_id: authUser.userId, data: txn, created_at: new Date().toISOString() });

      refundCount++;
      refundedAmount += price;
    }
  }

  // Fetch updated profile balance if anything was refunded
  let newBalance = authUser.balance;
  if (refundCount > 0) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("balance")
      .eq("id", authUser.userId)
      .single();
    if (profile) newBalance = profile.balance;
  }

  return Response.json({ ok: true, refundCount, refundedAmount, newBalance });
}
