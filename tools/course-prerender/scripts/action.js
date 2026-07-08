/* Adobe I/O Runtime action entrypoint */
const { extractCourseCode } = require('../lib/utils');
const { generateCourseHtml } = require('../lib/render');
const { CACHE_CONTROL } = require('../lib/publish');
const { TtlCache } = require('../lib/cache');

const htmlCache = new TtlCache(Number(process.env.PUBLISH_CACHE_TTL_MS || 120000));

async function main(params = {}) {
  try {
    const requestPath = params.path || params.__ow_path || '/';
    const courseCode = extractCourseCode(requestPath, process.env.COURSE_URL_FORMAT || '/courses/{courseCode}');

    if (!courseCode) {
      return {
        statusCode: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        body: 'Not found',
      };
    }

    const cachedHtml = htmlCache.get(courseCode);
    if (cachedHtml) {
      return {
        statusCode: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': CACHE_CONTROL,
        },
        body: cachedHtml,
      };
    }

    const html = await generateCourseHtml(courseCode, {
      courseApiUrl: process.env.COURSE_API_URL,
      courseTemplateUrl: process.env.COURSE_TEMPLATE_URL,
      siteBaseUrl: process.env.SITE_BASE_URL,
    });

    htmlCache.set(courseCode, html);

    return {
      statusCode: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': CACHE_CONTROL,
      },
      body: html,
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: error.statusCode === 404 ? 'Course not found' : `Rendering error: ${error.message || 'unknown'}`,
    };
  }
}

exports.main = main;
