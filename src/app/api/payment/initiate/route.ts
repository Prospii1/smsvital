import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`initiate:${authUser.userId}`, 5, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { amount } = body;
  if (typeof amount !== "number" || amount < 500) {
    return Response.json({ error: "Minimum top-up is ₦500" }, { status: 400 });
  }

  // Generate unique reference — SDK handles order creation internally
  const reference = "SMSV-" + Date.now().toString(36).toUpperCase() + "-" + authUser.userId.slice(0, 6).toUpperCase();

  // Bind this reference to the user and the expected amount so verify can
  // validate ownership + amount and guard against double-credit.
  const { error: insertError } = await supabaseAdmin
    .from("payments")
    .insert({
      reference,
      user_id: authUser.userId,
      amount_expected: amount,
      status: "pending",
    });

  if (insertError) {
    console.error("Failed to create payment record:", insertError);
    return Response.json({ error: "Could not start payment" }, { status: 500 });
  }

  return Response.json({ reference });
}
