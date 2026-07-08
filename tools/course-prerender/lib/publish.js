const { fetchCourses } = require('./utils');
const { hasAuthoredCoursePage } = require('./source');

const CACHE_CONTROL = 'public, max-age=120, stale-while-revalidate=60';
const PUBLISH_TARGETS = new Set(['preview', 'live', 'both']);

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

function getWebPath(courseCode, result) {
  return result?.webPath || `/courses/${String(courseCode).toLowerCase()}`;
}

function getEnvironmentUrl(target, config, webPath, result) {
  const { org, site, ref } = config;
  if (target === 'live') {
    return result?.live?.url || `https://${ref}--${site}--${org}.aem.live${webPath}`;
  }
  return result?.preview?.url || `https://${ref}--${site}--${org}.aem.page${webPath}`;
}

async function postAdminPublish(target, courseCode, config) {
  const { org, site, ref, token } = config;
  const normalizedCode = String(courseCode || '').toUpperCase();
  if (!normalizedCode) {
    const error = new Error('Missing course code');
    error.statusCode = 400;
    throw error;
  }

  const adminUrl = `https://admin.hlx.page/${target}/${org}/${site}/${ref}/courses/${normalizedCode}`;
  const response = await fetch(adminUrl, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`${target} publish failed (${response.status}): ${body}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

async function publishCourse(courseCode, options = {}) {
  const config = getPublishConfig(options);
  const target = options.target || 'preview';

  if (!config.token) {
    const error = new Error('Missing AEM_ADMIN_API_AUTH_TOKEN (or HLX_ADMIN_TOKEN)');
    error.statusCode = 500;
    throw error;
  }

  if (!PUBLISH_TARGETS.has(target)) {
    const error = new Error(`Invalid publish target "${target}". Use preview, live, or both.`);
    error.statusCode = 400;
    throw error;
  }

  const normalizedCode = String(courseCode || '').toUpperCase();
  const targets = target === 'both' ? ['preview', 'live'] : [target];
  const raw = {};
  let webPath = `/courses/${normalizedCode.toLowerCase()}`;
  let previewUrl;
  let liveUrl;

  for (const publishTarget of targets) {
    const result = await postAdminPublish(publishTarget, normalizedCode, config);
    raw[publishTarget] = result;
    webPath = getWebPath(normalizedCode, result);

    if (publishTarget === 'preview') {
      previewUrl = getEnvironmentUrl('preview', config, webPath, result);
    }
    if (publishTarget === 'live') {
      liveUrl = getEnvironmentUrl('live', config, webPath, result);
    }
  }

  return {
    courseCode: normalizedCode,
    target,
    webPath,
    previewUrl,
    liveUrl,
    raw,
  };
}

async function publishAllCourses(options = {}) {
  const courses = await fetchCourses(options.courseApiUrl);
  const results = [];

  for (const course of courses) {
    try {
      const authoredSource = await hasAuthoredCoursePage(course.code, options);
      const published = await publishCourse(course.code, options);
      results.push({
        courseCode: course.code,
        status: 'published',
        authoredSource,
        prerenderSkipped: authoredSource,
        ...published,
      });
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
