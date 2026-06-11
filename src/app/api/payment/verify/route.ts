import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/admin-guard";
import { rateLimit } from "@/lib/rate-limit";

const SUCCESS_STATUSES = ["successful", "completed", "paid", "success"];

function xmlRsaKeyToPem(base64Xml: string): string {
  const xml = Buffer.from(base64Xml, "base64").toString("utf8");
  const modMatch = xml.match(/<Modulus>([\s\S]*?)<\/Modulus>/);
  const expMatch = xml.match(/<Exponent>([\s\S]*?)<\/Exponent>/);
  if (!modMatch || !expMatch) throw new Error("Invalid RSA XML key");

  const modulus = Buffer.from(modMatch[1].trim(), "base64");
  const exponent = Buffer.from(expMatch[1].trim(), "base64");

  function encodeLength(len: number): Buffer {
    if (len < 0x80) return Buffer.from([len]);
    if (len < 0x100) return Buffer.from([0x81, len]);
    return Buffer.from([0x82, (len >> 8) & 0xff, len & 0xff]);
  }
  function encodeTlv(tag: number, value: Buffer): Buffer {
    return Buffer.concat([Buffer.from([tag]), encodeLength(value.length), value]);
  }

  const mod = modulus[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), modulus]) : modulus;
  const exp = exponent[0] & 0x80 ? Buffer.concat([Buffer.from([0x00]), exponent]) : exponent;

  const pkcs1 = encodeTlv(0x30, Buffer.concat([encodeTlv(0x02, mod), encodeTlv(0x02, exp)]));
  const algorithmIdentifier = Buffer.from("300d06092a864886f70d0101010500", "hex");
  const spki = encodeTlv(0x30, Buffer.concat([algorithmIdentifier, encodeTlv(0x03, Buffer.concat([Buffer.from([0x00]), pkcs1]))]));

  const b64 = spki.toString("base64").match(/.{1,64}/g)!.join("\n");
  return `-----BEGIN PUBLIC KEY-----\n${b64}\n-----END PUBLIC KEY-----`;
}

function encryptPayload(data: object, encryptionKeyBase64: string): string {
  const pem = xmlRsaKeyToPem(encryptionKeyBase64);
  const encrypted = crypto.publicEncrypt(
    { key: pem, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(JSON.stringify(data))
  );
  return encrypted.toString("base64");
}

export async function POST(request: Request) {
  const publicKey = process.env.TRANSACTPAY_PUBLIC_KEY;
  const encryptionKey = process.env.TRANSACTPAY_ENCRYPTION_KEY;
  if (!publicKey || !encryptionKey) {
    return Response.json({ error: "Payment not configured" }, { status: 503 });
  }

  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`verify:${authUser.userId}`, 10, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.tx_ref) return Response.json({ error: "Missing reference" }, { status: 400 });

  const { tx_ref } = body;

  // Verify with TransactPay
  let encrypted: string;
  try {
    encrypted = encryptPayload({ reference: tx_ref }, encryptionKey);
  } catch (e) {
    console.error("Encryption error:", e);
    return Response.json({ error: "Encryption failed" }, { status: 500 });
  }

  const res = await fetch("https://payment-api-service.transactpay.ai/payment/order/status", {
    method: "POST",
    headers: {
      "api-key": publicKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ data: encrypted }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("TransactPay status check failed:", res.status, JSON.stringify(data));
    return Response.json({ error: "Verification failed" }, { status: 402 });
  }

  // data.data may be nested; handle both shapes
  const tx = data?.data ?? data;
  const txStatus = (tx?.status ?? tx?.paymentStatus ?? "").toLowerCase();

  // Explicit success allowlist — only proceed on known-good statuses.
  if (!SUCCESS_STATUSES.includes(txStatus)) {
    return Response.json({ error: "Payment not successful", status: tx?.status }, { status: 402 });
  }

  // Currency must be present and NGN.
  if (!tx?.currency || tx.currency !== "NGN") {
    return Response.json({ error: "Invalid currency" }, { status: 400 });
  }

  // Amount must be a positive number.
  const amountNgn = tx?.amount;
  if (typeof amountNgn !== "number" || !Number.isFinite(amountNgn) || amountNgn <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Load the payment record created at initiate-time and validate it.
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("reference, user_id, amount_expected, status")
    .eq("reference", tx_ref)
    .maybeSingle();

  if (!payment) {
    return Response.json({ error: "Unknown payment reference" }, { status: 404 });
  }
  if (payment.user_id !== authUser.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (payment.status === "completed") {
    return Response.json({ error: "Payment already credited" }, { status: 409 });
  }

  // Validate the paid amount matches what we expected (₦1 tolerance for rounding).
  if (Math.abs(Number(payment.amount_expected) - amountNgn) > 1) {
    return Response.json({ error: "Amount mismatch" }, { status: 402 });
  }

  // Atomically claim the payment: flip pending -> completed FIRST. If 0 rows
  // are returned, another request already processed it -> 409 (no double-credit).
  const { data: claimed } = await supabaseAdmin
    .from("payments")
    .update({ status: "completed" })
    .eq("reference", tx_ref)
    .eq("status", "pending")
    .select("reference");

  if (!claimed || claimed.length === 0) {
    return Response.json({ error: "Payment already credited" }, { status: 409 });
  }

  // Credit balance atomically (only reachable once we've claimed the payment).
  const { data: newBalance, error: creditError } = await supabaseAdmin
    .rpc("credit_balance", { user_id: authUser.userId, amount: amountNgn });

  if (creditError) {
    return Response.json({ error: "Failed to credit balance" }, { status: 500 });
  }

  // Record transaction
  const txnId = `TXP-${tx_ref}`;
  const txnRecord = {
    id: txnId,
    t: "topup",
    label: "Wallet top-up",
    amt: amountNgn,
    ref: `TransactPay · ${tx.paymentMethod ?? "card"}`,
    when: new Date().toLocaleString("en-NG"),
  };

  await supabaseAdmin
    .from("transactions")
    .insert({ id: txnRecord.id, user_id: authUser.userId, data: txnRecord, created_at: new Date().toISOString() });

  return Response.json({ ok: true, newBalance, txn: txnRecord });
}
