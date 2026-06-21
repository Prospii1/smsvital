import { supabaseAdmin } from "@/lib/supabase-admin";

const SMSPVA_BASE = "https://api.smspva.com";

export async function GET(request: Request) {
  // Vercel sets this header automatically for cron jobs.
  // Also accept a manual secret for ad-hoc admin triggers.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) return Response.json({ error: "Service unavailable" }, { status: 503 });

  // Fetch ALL waiting orders across all users that are past expiry
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, data, created_at")
    .eq("data->>status", "waiting");

  if (error || !orders) {
    console.error("Cron cleanup: failed to fetch orders", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  const now = Date.now();
  let refundCount = 0;
  let refundedAmount = 0;

  for (const order of orders) {
    const createdAt = new Date(order.created_at).getTime();
    const expires = order.data?.expires ?? 600;
    const elapsed = (now - createdAt) / 1000;

    if (elapsed < expires) continue; // Not expired yet

    const price = order.data?.price ?? 0;
    const userId = order.user_id;
    const smspvaOrderId = order.data?.smspvaOrderId;

    // Check if SMS came through before refunding
    if (smspvaOrderId) {
      try {
        const checkRes = await fetch(`${SMSPVA_BASE}/activation/sms/${smspvaOrderId}`, {
          headers: { apikey: apiKey },
          cache: "no-store",
        });
        const checkRaw = await checkRes.json();
        const checkData = checkRaw?.data ?? checkRaw;

        if (checkData.sms || checkRaw.statusCode === 200) {
          const rawCode = checkData.sms ?? checkData.text ?? checkData.message;
          const smsStr = typeof rawCode === "string" ? rawCode : (rawCode?.text ?? rawCode?.code ?? rawCode?.message ?? JSON.stringify(rawCode) ?? "");
          const match = smsStr.match(/\b\d{4,8}\b/);
          const otp = match ? match[0] : smsStr;

          await supabaseAdmin
            .from("orders")
            .update({ data: { ...order.data, status: "received", code: otp } })
            .eq("id", order.id)
            .eq("data->>status", "waiting");

          continue; // Code arrived — don't refund
        }
      } catch (e) {
        console.error(`Cron cleanup: SMSPVA check error for ${order.id}`, e);
      }

      // Ban the number on SMSPVA
      await fetch(`${SMSPVA_BASE}/activation/blocknumber/${smspvaOrderId}`, {
        method: "PUT",
        headers: { apikey: apiKey },
        cache: "no-store",
      }).catch(() => {});
    }

    // Atomic claim — only refund if we flip waiting -> expired ourselves
    const { data: claimed } = await supabaseAdmin
      .from("orders")
      .update({ data: { ...order.data, status: "expired" } })
      .eq("id", order.id)
      .eq("data->>status", "waiting")
      .select("id");

    if (!claimed || claimed.length === 0) continue; // Already claimed by another process

    // Credit the refund
    await supabaseAdmin.rpc("credit_balance", { user_id: userId, amount: price });

    // Record the transaction (ignore duplicate key — means it was already recorded)
    const txnId = "TXN-REF-" + order.id.slice(4);
    await supabaseAdmin
      .from("transactions")
      .upsert({
        id: txnId,
        user_id: userId,
        data: {
          id: txnId,
          t: "refund",
          label: "Refund · timeout",
          amt: +price,
          ref: order.id,
          when: new Date().toLocaleString("en-NG"),
        },
        created_at: new Date().toISOString(),
      }, { ignoreDuplicates: true });

    await supabaseAdmin.from("orders").delete().eq("id", order.id);

    refundCount++;
    refundedAmount += price;
    console.log(`Cron cleanup: refunded ${price} to user ${userId} for order ${order.id}`);
  }

  return Response.json({ ok: true, refundCount, refundedAmount });
}
