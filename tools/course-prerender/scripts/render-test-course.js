/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { generateCourseHtml } = require('../lib/render');

async function run() {
  const courseCode = process.env.TEST_COURSE_CODE || 'UC-BPT-107';
  const html = await generateCourseHtml(courseCode, {
    courseApiUrl: process.env.COURSE_API_URL,
    courseTemplateUrl: process.env.COURSE_TEMPLATE_URL,
    siteBaseUrl: process.env.SITE_BASE_URL,
  });

  const outDir = path.join(__dirname, '..', 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${courseCode}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Rendered ${courseCode} -> ${outPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
