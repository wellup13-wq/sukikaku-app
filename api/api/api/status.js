function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function POST(request) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    return json({ ok: false, error: 'Missing TIKTOK_ACCESS_TOKEN' }, 500);
  }

  const body = await request.json();
  const { publish_id } = body;
  if (!publish_id) {
    return json({ ok: false, error: 'publish_id is required' }, 400);
  }

  const resp = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ publish_id }),
  });

  const data = await resp.json();
  return json({ ok: resp.ok, upstream_status: resp.status, data }, resp.ok ? 200 : 502);
}
