import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) return Response.json({ balance: null, error: "No API key" });

  try {
    const res = await fetch("https://api.smspva.com/activation/balance", {
      headers: { apikey: apiKey },
      cache: "no-store",
    });
    const data = await res.json();
    const balance = data?.data?.balance ?? null;
    return Response.json({ balance });
  } catch {
    return Response.json({ balance: null, error: "Failed to fetch" });
  }
}
