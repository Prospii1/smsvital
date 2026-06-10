import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/admin-guard";

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

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { amount, email } = body;
  if (typeof amount !== "number" || amount < 500) {
    return Response.json({ error: "Minimum top-up is ₦500" }, { status: 400 });
  }

  const reference = "SMSV-" + Date.now().toString(36).toUpperCase() + "-" + authUser.userId.slice(0, 6).toUpperCase();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const payload = {
    customer: {
      firstname: "Smsvital",
      lastname: "User",
      mobile: "00000000000",
      email: email || "user@smsvital.com",
      country: "NG",
    },
    order: {
      amount,
      reference,
      description: `Smsvital wallet top-up`,
      currency: "NGN",
    },
    payment: {
      RedirectUrl: `${baseUrl}/payment/verify`,
    },
    meta: {
      ipAddress: "127.0.0.1",
      user_id: authUser.userId,
    },
  };

  let encrypted: string;
  try {
    encrypted = encryptPayload(payload, encryptionKey);
  } catch (e) {
    console.error("Encryption error:", e);
    return Response.json({ error: "Encryption failed" }, { status: 500 });
  }

  const res = await fetch("https://payment-api-service.transactpay.ai/payment/order/create", {
    method: "POST",
    headers: {
      "api-key": publicKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ data: encrypted }),
  });

  const data = await res.json();
  console.log("TransactPay create order response:", JSON.stringify(data));

  if (!res.ok || (data.status !== "success" && data.statusCode !== "01")) {
    console.error("TransactPay order create failed:", JSON.stringify(data));
    return Response.json({ error: data.message ?? "Order creation failed" }, { status: 502 });
  }

  // Return reference — SDK uses this to look up the pre-created order
  return Response.json({ reference });
}
