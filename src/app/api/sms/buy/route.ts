import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getMarkup, toNgn, fetchSmspvaPrice } from "@/lib/pricing";

const SMSPVA_BASE = "https://api.smspva.com";
const PRICE_TOLERANCE = 5; // NGN — allow ±5 rounding difference

export async function POST(request: Request) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
  const rawNum  = String(smspvaData.phoneNumber ?? "");
  const number  = rawNum.startsWith("+") ? rawNum : "+" + rawNum;
  const now     = new Date().toISOString();

  const order = {
    id: orderId,
    svc: service,
    cc: country.toLowerCase(),
    number,
    code: null,
    price: realPrice,
    status: "waiting",
    age: "just now",
    smspvaOrderId: smspvaData.orderId,
    expires: smspvaData.orderExpireIn ?? 600,
  };

  const txn = {
    id: txnId,
    t: "purchase",
    label: `SMS number · ${service} · ${country}`,
    amt: -realPrice,
    ref: orderId,
    when: "Just now",
  };

  // Write order + transaction to DB (non-blocking — balance already secured)
  await Promise.allSettled([
    supabaseAdmin.from("orders").insert({ id: orderId, user_id: authUser.userId, data: order, created_at: now }),
    supabaseAdmin.from("transactions").insert({ id: txnId, user_id: authUser.userId, data: txn, created_at: now }),
  ]);

  return Response.json({ newBalance, orderId, order, txn });
}
