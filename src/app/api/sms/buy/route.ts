import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getMarkup, toNgn, fetchSmspvaPrice } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

const SMSPVA_BASE = "https://api.smspva.com";
const PRICE_TOLERANCE = 50; // NGN — allow ±50 to handle markup changes between catalog refresh and purchase

export async function POST(request: Request) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`buy:${authUser.userId}`, 20, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { country, service, expectedPrice } = body;

  if (!country || typeof country !== "string" || !/^[A-Z]{2}$/.test(country)) {
    return Response.json({ error: "Invalid country code" }, { status: 400 });
  }
  if (!service || typeof service !== "string" || !/^opt\d+$/.test(service)) {
    return Response.json({ error: "Invalid service code" }, { status: 400 });
  }
  if (typeof expectedPrice !== "number" || expectedPrice <= 0) {
    return Response.json({ error: "Invalid price" }, { status: 400 });
  }

  // Fetch real supplier price server-side and apply markup
  const markup = await getMarkup();
  const supplierUsd = await fetchSmspvaPrice(apiKey, service, country);

  let realPrice: number;
  if (supplierUsd !== null) {
    realPrice = toNgn(supplierUsd, markup);
  } else {
    // Supplier price unavailable — trust catalog cache entry within tolerance
    realPrice = expectedPrice;
  }

  // Reject if client sent a significantly different price (prevents manipulation)
  if (Math.abs(realPrice - expectedPrice) > PRICE_TOLERANCE) {
    return Response.json(
      { error: "Price mismatch — please refresh and try again", statusCode: 409 },
      { status: 409 }
    );
  }

  // Atomic deduct — raises exception if balance insufficient
  const { data: newBalance, error: deductError } = await supabaseAdmin
    .rpc("deduct_balance", { user_id: authUser.userId, amount: realPrice });

  if (deductError) {
    const isInsufficient = deductError.message?.includes("insufficient_balance");
    return Response.json(
      { error: isInsufficient ? "Insufficient balance — please top up your wallet" : "Balance error", statusCode: isInsufficient ? 402 : 500 },
      { status: isInsufficient ? 402 : 500 }
    );
  }

  // Call SMSPVA to get the number
  const smspvaRes = await fetch(`${SMSPVA_BASE}/activation/number/${country}/${service}`, {
    headers: { apikey: apiKey },
    cache: "no-store",
  });
  const smspvaData = await smspvaRes.json();
  console.log("SMSPVA buy response:", JSON.stringify(smspvaData));

  if (!smspvaRes.ok || smspvaData.error) {
    // Refund — SMSPVA failed after we already deducted
    await supabaseAdmin.rpc("credit_balance", { user_id: authUser.userId, amount: realPrice });
    return Response.json(
      { error: smspvaData.error || "Failed to get number", statusCode: smspvaData.statusCode ?? smspvaRes.status },
      { status: 400 }
    );
  }

  // Build order and transaction records
  const orderId = "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  const txnId   = "TXN-" + orderId.slice(4);
  // SMSPVA new API returns `number` and `id`; old API used `phoneNumber` and `orderId`
  const rawNum  = String(smspvaData.number ?? smspvaData.phoneNumber ?? "");
  const number  = rawNum ? (rawNum.startsWith("+") ? rawNum : "+" + rawNum) : "";
  const smspvaOrderId = smspvaData.id ?? smspvaData.orderId ?? null;
  const now     = new Date().toISOString();

  if (!number || !smspvaOrderId) {
    // Got a response but missing critical fields — refund and abort
    console.error("SMSPVA response missing number or orderId:", JSON.stringify(smspvaData));
    await supabaseAdmin.rpc("credit_balance", { user_id: authUser.userId, amount: realPrice });
    return Response.json({ error: "No number available — you have been refunded", statusCode: 501 }, { status: 400 });
  }

  const order = {
    id: orderId,
    svc: service,
    cc: country.toLowerCase(),
    number,
    code: null,
    price: realPrice,
    status: "waiting",
    age: "just now",
    smspvaOrderId,
    expires: smspvaData.orderExpireIn ?? smspvaData.expireIn ?? 600,
  };

  const txn = {
    id: txnId,
    t: "purchase",
    label: `SMS number · ${service} · ${country}`,
    amt: -realPrice,
    ref: orderId,
    when: "Just now",
  };

  // Write order + transaction to DB
  const [orderResult, txnResult] = await Promise.allSettled([
    supabaseAdmin.from("orders").insert({ id: orderId, user_id: authUser.userId, data: order, created_at: now }),
    supabaseAdmin.from("transactions").insert({ id: txnId, user_id: authUser.userId, data: txn, created_at: now }),
  ]);

  if (orderResult.status === "rejected" || (orderResult.status === "fulfilled" && orderResult.value.error)) {
    const err = orderResult.status === "rejected" ? orderResult.reason : orderResult.value.error;
    console.error("Failed to save order to DB:", err);
    // Refund and return error — user should not lose money without an order record
    await supabaseAdmin.rpc("credit_balance", { user_id: authUser.userId, amount: realPrice });
    return Response.json({ error: "Order could not be saved — you have been refunded", statusCode: 500 }, { status: 500 });
  }

  if (txnResult.status === "rejected" || (txnResult.status === "fulfilled" && txnResult.value.error)) {
    const err = txnResult.status === "rejected" ? txnResult.reason : txnResult.value.error;
    console.error("Failed to save transaction to DB:", err);
    // Non-fatal — order saved, just log the missing transaction
  }

  return Response.json({ newBalance, orderId, order, txn });
}
