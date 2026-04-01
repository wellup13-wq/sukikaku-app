function html(body) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>TikTok Callback</title></head><body style="font-family:sans-serif;padding:24px;line-height:1.6">${body}</body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function readCookie(cookieHeader, key) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map(v => v.trim());
  const found = parts.find(v => v.startsWith(key + '='));
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  const expectedState = readCookie(request.headers.get('cookie'), 'tiktok_oauth_state');

  if (error) {
    return html(`<h1>TikTok認証エラー</h1><p>${error}</p><pre>${errorDescription || ''}</pre>`);
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return html('<h1>認証に失敗しました</h1><p>code/state の検証に失敗しました。</p>');
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return html('<h1>設定不足</h1><p>TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET / TIKTOK_REDIRECT_URI を設定してください。</p>');
  }

  const tokenResp = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResp.json();

  return html(`
    <h1>TikTok認証コールバック完了</h1>
    <p>この段階ではトークンを表示確認するだけです。後で保存処理を追加します。</p>
    <pre style="white-space:pre-wrap;background:#f6f6f6;padding:16px;border-radius:8px;overflow:auto">${JSON.stringify(tokenData, null, 2)}</pre>
  `);
}
