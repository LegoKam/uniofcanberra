/* eslint-disable no-console */

async function run() {
  const org = process.env.AEM_ORG || 'LegoKam';
  const site = process.env.AEM_SITE || 'uniofcanberra';
  const rawToken = process.env.AEM_ADMIN_API_AUTH_TOKEN || process.env.HLX_ADMIN_TOKEN;
  const overlayUrl = process.env.OVERLAY_URL;
  const suffix = process.env.OVERLAY_SUFFIX || '.html';
  const token = (rawToken || '').replace(/^(Bearer|token)\s+/i, '').trim();

  if (!rawToken || !token) {
    throw new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
  }
  if (!overlayUrl) {
    throw new Error('Missing OVERLAY_URL (public BYOM endpoint)');
  }

  const configUrl = `https://admin.hlx.page/config/${org}/sites/${site}.json`;
  const authHeaders = {
    authorization: `token ${token}`,
    'x-auth-token': token,
  };

  console.log(`Configuring overlay for ${org}/${site}`);
  console.log(`Overlay URL: ${overlayUrl}`);

  const existingResp = await fetch(configUrl, {
    headers: authHeaders,
  });

  if (!existingResp.ok) {
    const body = await existingResp.text();
    if (existingResp.status === 403) {
      throw new Error(`Failed to fetch current config (403): token does not have access to ${org}/${site}. Use a Helix admin token for this org. Response: ${body}`);
    }
    throw new Error(`Failed to fetch current config (${existingResp.status}): ${body}`);
  }

  const existingConfig = await existingResp.json();
  const nextConfig = {
    ...existingConfig,
    content: {
      ...existingConfig.content,
      overlay: {
        url: overlayUrl,
        type: 'markup',
        suffix,
      },
    },
  };

  const updateResp = await fetch(configUrl, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify(nextConfig),
  });

  if (!updateResp.ok) {
    const body = await updateResp.text();
    throw new Error(`Failed to update config (${updateResp.status}): ${body}`);
  }

  console.log('Overlay configured successfully.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
