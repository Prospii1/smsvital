const SMSPVA_BASE = 'https://api.smspva.com';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { orderId } = await params;

  const res = await fetch(`${SMSPVA_BASE}/activation/sms/${orderId}`, {
    headers: { apikey: apiKey },
    cache: 'no-store',
  });

  const data = await res.json();

  if (data.statusCode === 200 || data.sms) {
    return Response.json(data, { status: 200 });
  }

  return Response.json({ waiting: true }, { status: 202 });
}
