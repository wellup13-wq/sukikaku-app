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
  const {
    title,
    video_url,
    privacy_level = 'SELF_ONLY',
    disable_comment = false,
    disable_duet = false,
    disable_stitch = false,
    video_cover_timestamp_ms = 1000
  } = body;

  if (!title || !video_url) {
    return json({ ok: false, error: 'title and video_url are required' }, 400);
  }

  const resp = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level,
        disable_comment,
        disable_duet,
        disable_stitch,
        video_cover_timestamp_ms,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url,
      },
    }),
  });

  const data = await resp.json();
  return json({ ok: resp.ok, upstream_status: resp.status, data }, resp.ok ? 200 : 502);
}
