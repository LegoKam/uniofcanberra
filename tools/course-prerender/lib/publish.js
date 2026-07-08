const { fetchCourses } = require('./utils');

const CACHE_CONTROL = 'public, max-age=120, stale-while-revalidate=60';

function getPublishConfig(overrides = {}) {
  const rawToken = overrides.token
    || overrides.AEM_ADMIN_API_AUTH_TOKEN
    || process.env.AEM_ADMIN_API_AUTH_TOKEN
    || process.env.HLX_ADMIN_TOKEN;
  const token = (rawToken || '').replace(/^(Bearer|token)\s+/i, '').trim();

  return {
    org: overrides.org || overrides.AEM_ORG || process.env.AEM_ORG || 'legokam',
    site: overrides.site || overrides.AEM_SITE || process.env.AEM_SITE || 'uniofcanberra',
    ref: overrides.ref || overrides.AEM_REF || process.env.AEM_REF || 'main',
    token,
  };
}

function getAuthHeaders(token) {
  return {
    authorization: `token ${token}`,
    'x-auth-token': token,
  };
}

async function publishCourse(courseCode, options = {}) {
  const { org, site, ref, token } = getPublishConfig(options);

  if (!token) {
    const error = new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
    error.statusCode = 500;
    throw error;
  }

  const normalizedCode = String(courseCode || '').toUpperCase();
  if (!normalizedCode) {
    const error = new Error('Missing course code');
    error.statusCode = 400;
    throw error;
  }

  const previewUrl = `https://admin.hlx.page/preview/${org}/${site}/${ref}/courses/${normalizedCode}`;
  const previewResp = await fetch(previewUrl, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!previewResp.ok) {
    const body = await previewResp.text();
    const error = new Error(`Preview publish failed (${previewResp.status}): ${body}`);
    error.statusCode = previewResp.status;
    throw error;
  }

  const result = await previewResp.json();
  const webPath = result?.webPath || `/courses/${normalizedCode.toLowerCase()}`;
  const previewUrlOut = result?.preview?.url
    || `https://${ref}--${site}--${org}.aem.page${webPath}`;

  return {
    courseCode: normalizedCode,
    webPath,
    previewUrl: previewUrlOut,
    raw: result,
  };
}

async function publishAllCourses(options = {}) {
  const courses = await fetchCourses(options.courseApiUrl);
  const results = [];

  for (const course of courses) {
    try {
      const published = await publishCourse(course.code, options);
      results.push({ courseCode: course.code, status: 'published', ...published });
    } catch (error) {
      results.push({
        courseCode: course.code,
        status: 'failed',
        error: error.message,
      });
    }
  }

  return results;
}

module.exports = {
  CACHE_CONTROL,
  getPublishConfig,
  publishCourse,
  publishAllCourses,
};
