import { getAuthenticatedUser } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SMSPVA_BASE = "https://api.smspva.com";

export async function GET(
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

  const smspvaOrderId = order.data?.smspvaOrderId;
  if (!smspvaOrderId) return Response.json({ waiting: true }, { status: 202 });

  const res = await fetch(`${SMSPVA_BASE}/activation/sms/${smspvaOrderId}`, {
    headers: { apikey: apiKey },
    cache: "no-store",
  });

  const raw = await res.json();
  // SMSPVA wraps response in `data` field
  const data = raw?.data ?? raw;

  if (data.sms || raw.statusCode === 200) {
    return Response.json({ sms: data.sms ?? data.text ?? data.message }, { status: 200 });
  }

  return Response.json({ waiting: true }, { status: 202 });
}
