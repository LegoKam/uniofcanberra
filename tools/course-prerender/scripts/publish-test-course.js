/* eslint-disable no-console */

const { publishCourse } = require('../lib/publish');

async function run() {
  const rawToken = process.env.AEM_ADMIN_API_AUTH_TOKEN || process.env.HLX_ADMIN_TOKEN;
  const courseCode = process.env.TEST_COURSE_CODE || 'UC-BPT-107';
  const token = (rawToken || '').replace(/^(Bearer|token)\s+/i, '').trim();

  if (!rawToken || !token) {
    throw new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
  }

  console.log(`Publishing preview for /courses/${courseCode.toLowerCase()}`);
  const published = await publishCourse(courseCode);
  console.log(`Preview publish succeeded for ${published.webPath}`);
  console.log(`Check URL: ${published.previewUrl}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
