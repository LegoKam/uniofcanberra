/* eslint-disable no-console */

async function run() {
  const org = process.env.AEM_ORG || 'LegoKam';
  const site = process.env.AEM_SITE || 'uniofcanberra';
  const token = process.env.AEM_ADMIN_API_AUTH_TOKEN || process.env.HLX_ADMIN_TOKEN;
  const overlayUrl = process.env.OVERLAY_URL;
  const suffix = process.env.OVERLAY_SUFFIX || '.html';

  if (!token) {
    throw new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
  }
  if (!overlayUrl) {
    throw new Error('Missing OVERLAY_URL (public BYOM endpoint)');
  }

  const configUrl = `https://admin.hlx.page/config/${org}/sites/${site}.json`;
  const existingResp = await fetch(configUrl, {
    headers: {
      authorization: `token ${token}`,
    },
  });

  if (!existingResp.ok) {
    throw new Error(`Failed to fetch current config (${existingResp.status})`);
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
      authorization: `token ${token}`,
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
