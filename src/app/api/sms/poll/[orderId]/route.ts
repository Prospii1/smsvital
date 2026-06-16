import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SMSPVA_BASE = "https://api.smspva.com";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) return Response.json({ error: "Service unavailable" }, { status: 503 });

  const authUser = await getAuthenticatedUser();
  if (!authUser) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, data, created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (order.user_id !== authUser.userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Order already settled by a previous poll/cleanup/ban call — nothing to do.
  if (order.data?.status !== "waiting") {
    return Response.json({ waiting: true }, { status: 202 });
  }

  const smspvaOrderId = order.data?.smspvaOrderId;

  if (smspvaOrderId) {
    const res = await fetch(`${SMSPVA_BASE}/activation/sms/${smspvaOrderId}`, {
      headers: { apikey: apiKey },
      cache: "no-store",
    });

    const raw = await res.json();
    // SMSPVA wraps response in `data` field
    const data = raw?.data ?? raw;

    if (data.sms || raw.statusCode === 200) {
      const sms = data.sms ?? data.text ?? data.message;
      await supabaseAdmin
        .from("orders")
        .update({ data: { ...order.data, status: "received", code: sms } })
        .eq("id", orderId);
      return Response.json({ sms }, { status: 200 });
    }
  }

  // No code yet — check whether this order's own countdown has expired.
  // Mirrors the refund logic in src/app/api/sms/ban/[orderId]/route.ts.
  const createdAt = new Date(order.created_at).getTime();
  const expires = order.data?.expires ?? 600;
  const elapsed = (Date.now() - createdAt) / 1000;

  if (elapsed >= expires) {
    const price = order.data?.price ?? 0;

    if (smspvaOrderId) {
      await fetch(`${SMSPVA_BASE}/activation/blocknumber/${smspvaOrderId}`, {
        method: "PUT",
        headers: { apikey: apiKey },
        cache: "no-store",
      }).catch(() => {});
    }

    // Atomic claim: only refund if we can flip waiting -> expired ourselves.
    // Prevents a double refund if cleanup/ban already claimed this order concurrently.
    const { data: claimed } = await supabaseAdmin
      .from("orders")
      .update({ data: { ...order.data, status: "expired" } })
      .eq("id", orderId)
      .eq("data->>status", "waiting")
      .select("id");

    if (claimed && claimed.length > 0) {
      const { data: newBalance } = await supabaseAdmin
        .rpc("credit_balance", { user_id: authUser.userId, amount: price });

      const txnId = "TXN-REF-" + orderId.slice(4);
      const txn = {
        id: txnId,
        t: "refund",
        label: `Refund · timeout`,
        amt: +price,
        ref: orderId,
        when: new Date().toLocaleString("en-NG"),
      };
      await supabaseAdmin
        .from("transactions")
        .insert({ id: txnId, user_id: authUser.userId, data: txn, created_at: new Date().toISOString() });

      return Response.json({ expired: true, newBalance, txn }, { status: 200 });
    }

    // Someone else already claimed/refunded it — just report expired without re-crediting.
    return Response.json({ expired: true }, { status: 200 });
  }

  return Response.json({ waiting: true }, { status: 202 });
}
