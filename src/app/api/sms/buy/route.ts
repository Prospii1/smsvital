const SMSPVA_BASE = 'https://api.smspva.com';

export async function POST(request: Request) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { country, service } = await request.json();

  const res = await fetch(`${SMSPVA_BASE}/activation/number/${country}/${service}`, {
    headers: { apikey: apiKey },
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    return Response.json(
      { error: data.error || 'Failed to get number', statusCode: data.statusCode ?? res.status },
      { status: 400 }
    );
  }

  return Response.json(data);
}
