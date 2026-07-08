/* eslint-disable no-console */

const { publishAllCourses } = require('../lib/publish');

async function run() {
  const rawToken = process.env.AEM_ADMIN_API_AUTH_TOKEN || process.env.HLX_ADMIN_TOKEN;
  const token = (rawToken || '').replace(/^(Bearer|token)\s+/i, '').trim();

  if (!rawToken || !token) {
    throw new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
  }

  console.log('Live publishing all courses from feed...');
  const results = await publishAllCourses({ target: 'live' });
  const published = results.filter((item) => item.status === 'published');
  const failed = results.filter((item) => item.status === 'failed');

  published.forEach((item) => {
    const source = item.authoredSource ? 'authored DA page' : 'BYOM prerender';
    console.log(`✓ ${item.courseCode} (${source}) -> ${item.liveUrl}`);
  });

  failed.forEach((item) => {
    console.error(`✗ ${item.courseCode}: ${item.error}`);
  });

  console.log(`Done: ${published.length} live published, ${failed.length} failed, ${results.length} total`);
  if (failed.length > 0) process.exit(1);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
