import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { orderId } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, data, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (order.data?.status !== "waiting") {
    return Response.json({ error: "Order is not in waiting status — cannot refund" }, { status: 400 });
  }

  const price = order.data?.price ?? 0;
  const userId = order.user_id;

  // Atomic claim — prevents double refund if cron runs concurrently
  const { data: claimed } = await supabaseAdmin
    .from("orders")
    .update({ data: { ...order.data, status: "expired" } })
    .eq("id", orderId)
    .eq("data->>status", "waiting")
    .select("id");

  if (!claimed || claimed.length === 0) {
    return Response.json({ error: "Order was already processed by another operation" }, { status: 409 });
  }

  await supabaseAdmin.rpc("credit_balance", { user_id: userId, amount: price });

  const txnId = "TXN-REF-" + orderId.slice(4);
  await supabaseAdmin
    .from("transactions")
    .upsert({
      id: txnId,
      user_id: userId,
      data: {
        id: txnId,
        t: "refund",
        label: "Refund · admin",
        amt: +price,
        ref: orderId,
        when: new Date().toLocaleString("en-NG"),
      },
      created_at: new Date().toISOString(),
    }, { ignoreDuplicates: true });

  return Response.json({ ok: true, refunded: price, userId });
}
