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
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { amount, email } = body;

  if (typeof amount !== "number" || amount < 500) {
    return Response.json({ error: "Minimum top-up is ₦500" }, { status: 400 });
  }

  const tx_ref = "SMSV-" + Date.now().toString(36).toUpperCase() + "-" + authUser.userId.slice(0, 6).toUpperCase();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref,
      amount,
      currency: "NGN",
      redirect_url: `${baseUrl}/payment/verify`,
      customer: { email, user_id: authUser.userId },
      customizations: {
        title: "SMSVital Wallet Top-up",
        description: `Add ₦${amount.toLocaleString("en-NG")} to your wallet`,
        logo: `${baseUrl}/favicon.ico`,
      },
      meta: { user_id: authUser.userId, amount_ngn: amount },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    return Response.json({ error: data.message ?? "Payment initiation failed" }, { status: 502 });
  }

  return Response.json({ payment_link: data.data.link, tx_ref });
}
