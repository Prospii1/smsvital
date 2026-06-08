import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey || secretKey.includes("your-secret-key")) {
    return Response.json({ error: "Payment not configured" }, { status: 503 });
  }

  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.tx_ref) return Response.json({ error: "Missing tx_ref" }, { status: 400 });

  const { tx_ref } = body;

  // Verify with Flutterwave
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await res.json();

  if (!res.ok || data.status !== "success") {
    return Response.json({ error: "Verification failed" }, { status: 402 });
  }

  const tx = data.data;

  // Confirm payment is complete, currency is NGN, and it's for this user
  if (tx.status !== "successful") {
    return Response.json({ error: "Payment not successful", status: tx.status }, { status: 402 });
  }
  if (tx.currency !== "NGN") {
    return Response.json({ error: "Invalid currency" }, { status: 400 });
  }
  if (tx.meta?.user_id && tx.meta.user_id !== authUser.userId) {
    return Response.json({ error: "Payment does not belong to this account" }, { status: 403 });
  }

  const amountNgn = tx.amount as number;

  // Idempotency — check if this tx_ref was already credited
  const { data: existing } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("id", `FLW-${tx.id}`)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: "Payment already credited" }, { status: 409 });
  }

  // Credit balance atomically
  const { data: newBalance, error: creditError } = await supabaseAdmin
    .rpc("credit_balance", { user_id: authUser.userId, amount: amountNgn });

  if (creditError) {
    return Response.json({ error: "Failed to credit balance" }, { status: 500 });
  }

  // Record transaction
  const txnRecord = {
    id: `FLW-${tx.id}`,
    t: "topup",
    label: "Wallet top-up",
    amt: amountNgn,
    ref: `Flutterwave · ${tx.payment_type ?? "card"}`,
    when: new Date().toLocaleString("en-NG"),
  };

  await supabaseAdmin
    .from("transactions")
    .insert({ id: txnRecord.id, user_id: authUser.userId, data: txnRecord, created_at: new Date().toISOString() });

  return Response.json({ ok: true, newBalance, txn: txnRecord });
}
