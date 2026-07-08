/* eslint-disable no-console */

async function run() {
  const org = process.env.AEM_ORG || 'LegoKam';
  const site = process.env.AEM_SITE || 'uniofcanberra';
  const ref = process.env.AEM_REF || 'main';
  const token = process.env.AEM_ADMIN_API_AUTH_TOKEN || process.env.HLX_ADMIN_TOKEN;
  const courseCode = process.env.TEST_COURSE_CODE || 'UC-BPT-107';

  if (!token) {
    throw new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
  }

  const previewUrl = `https://admin.hlx.page/preview/${org}/${site}/${ref}/courses/${courseCode}`;
  const previewResp = await fetch(previewUrl, {
    method: 'POST',
    headers: {
      authorization: `token ${token}`,
    },
  });

  if (!previewResp.ok) {
    const body = await previewResp.text();
    throw new Error(`Preview publish failed (${previewResp.status}): ${body}`);
  }

  const liveUrl = `https://${ref}--${site}--${org}.aem.page/courses/${courseCode}`;
  console.log(`Preview publish succeeded for /courses/${courseCode}`);
  console.log(`Check URL: ${liveUrl}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
