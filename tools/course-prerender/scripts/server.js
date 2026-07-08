/* eslint-disable no-console */
const express = require('express');
const { extractCourseCode } = require('../lib/utils');
const { generateCourseHtml } = require('../lib/render');

const app = express();
const port = Number(process.env.PORT || 8787);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get('*', async (req, res) => {
  try {
    const courseCode = extractCourseCode(req.path, process.env.COURSE_URL_FORMAT || '/courses/{courseCode}');
    if (!courseCode) {
      res.status(404).send('Not found');
      return;
    }

    const html = await generateCourseHtml(courseCode, {
      courseApiUrl: process.env.COURSE_API_URL,
      courseTemplateUrl: process.env.COURSE_TEMPLATE_URL,
      siteBaseUrl: process.env.SITE_BASE_URL,
    });

    res.status(200).type('text/html').send(html);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) console.error(error);
    res.status(status).send(status === 404 ? 'Course not found' : 'Rendering error');
  }
});

app.listen(port, () => {
  console.log(`Course prerender service listening on ${port}`);
});
