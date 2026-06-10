import { getAuthenticatedUser } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const { amount } = body;
  if (typeof amount !== "number" || amount < 500) {
    return Response.json({ error: "Minimum top-up is ₦500" }, { status: 400 });
  }

  // Generate unique reference — SDK handles order creation internally
  const reference = "SMSV-" + Date.now().toString(36).toUpperCase() + "-" + authUser.userId.slice(0, 6).toUpperCase();
  return Response.json({ reference });
}
