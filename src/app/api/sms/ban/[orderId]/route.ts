import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractOtp } from "@/lib/extract-otp";

const SMSPVA_BASE = "https://api.smspva.com";

export async function DELETE(
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
    .select("user_id, data")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (order.user_id !== authUser.userId) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Prevent double refunds
  if (order.data?.status !== "waiting") {
    return Response.json({ error: "Order already processed or not eligible for refund" }, { status: 400 });
  }

  const smspvaOrderId = order.data?.smspvaOrderId;
  const price = order.data?.price ?? 0;

  // Double check if code came through from SMSPVA before refunding
  if (smspvaOrderId) {
    try {
      const checkRes = await fetch(`${SMSPVA_BASE}/activation/sms/${smspvaOrderId}`, {
        headers: { apikey: apiKey },
        cache: "no-store",
      });
      const checkRaw = await checkRes.json();
      const checkData = checkRaw?.data ?? checkRaw;
      if (checkData.sms || checkRaw.statusCode === 200) {
        const otp = extractOtp(checkData.sms ?? checkData.text ?? checkData.message);

        await supabaseAdmin
          .from("orders")
          .update({ data: { ...order.data, status: "received", code: otp } })
          .eq("id", orderId);

        return Response.json({ ok: true, status: "received", code: otp });
      }
    } catch (e) {
      console.error("SMSPVA check error:", e);
    }

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
    .eq("id", orderId);

  // Refund balance atomically
  const { data: newBalance } = await supabaseAdmin
    .rpc("credit_balance", { user_id: authUser.userId, amount: price });

  // Record refund transaction
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
    .insert({ id: txnId, user_id: authUser.userId, data: txn, created_at: new Date().toISOString() })
    .then(() => {});

  return Response.json({ ok: true, newBalance, txn });
}
