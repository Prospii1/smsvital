const SMSPVA_BASE = 'https://api.smspva.com';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const apiKey = process.env.SMSPVA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { orderId } = await params;

  const res = await fetch(`${SMSPVA_BASE}/activation/cancelorder/${orderId}`, {
    method: 'PUT',
    headers: { apikey: apiKey },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : 400 });
}
