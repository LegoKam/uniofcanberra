/* Adobe I/O Runtime action: auto-publish a single course to preview */
const { extractCourseCode, fetchCourses } = require('../lib/utils');
const { publishCourse, CACHE_CONTROL } = require('../lib/publish');
const { TtlCache } = require('../lib/cache');

const publishCache = new TtlCache(Number(process.env.PUBLISH_CACHE_TTL_MS || 120000));

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': CACHE_CONTROL,
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(payload),
  };
}

function resolveCourseCode(params = {}) {
  if (params.courseCode) {
    return String(params.courseCode).toUpperCase();
  }

  const requestPath = params.path || params.__ow_path || '/';
  return extractCourseCode(requestPath, process.env.COURSE_URL_FORMAT || '/courses/{courseCode}');
}

async function main(params = {}) {
  try {
    const courseCode = resolveCourseCode(params);
    if (!courseCode || courseCode === 'DEFAULT') {
      return jsonResponse(400, { error: 'Missing or invalid course code' });
    }

    const cached = publishCache.get(courseCode);
    if (cached) {
      return jsonResponse(200, { ...cached, cached: true });
    }

    const courses = await fetchCourses(params.COURSE_API_URL || process.env.COURSE_API_URL);
    const course = courses.find((item) => item.code === courseCode);
    if (!course) {
      return jsonResponse(404, { error: `Course ${courseCode} not found in feed` });
    }

    const published = await publishCourse(courseCode, params);
    const payload = {
      published: true,
      cached: false,
      courseCode: published.courseCode,
      webPath: published.webPath,
      url: published.previewUrl,
      courseName: course.name,
    };

    publishCache.set(courseCode, payload);
    return jsonResponse(200, payload);
  } catch (error) {
    return jsonResponse(error.statusCode || 500, {
      error: error.message || 'Publish failed',
    });
  }
}

exports.main = main;
