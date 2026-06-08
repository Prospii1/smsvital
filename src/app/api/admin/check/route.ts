import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  return Response.json({ ok: true });
}
