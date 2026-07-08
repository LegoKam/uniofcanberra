/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 312
(module) {

class TtlCache {
  constructor(ttlMs = 120000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expires: Date.now() + this.ttlMs,
    });
  }
}

module.exports = {
  TtlCache,
};


/***/ },

/***/ 425
(module, __unused_webpack_exports, __webpack_require__) {

const { fetchCourses } = __webpack_require__(359);

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


/***/ },

/***/ 359
(module) {

const COURSE_API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSay4Xe-pjISF73XwDlALajDy3HyBaDPmMgMtrv9SBzyiVOPAr_I3gfJUK34Cdit9qI-ry-HxnsO0lgWdl9iV2Zorq9_jFY6Ge4xuGJey5U2Hzf4RKs6IDCCBWLkJh_QKp1_hLSm8TUyqUHTB2e8XSboRRgHGziIDxJbvnjq2Qlolj5N21rtReIsVdnY2zvjjglK_lP2I1EyWnQArb57aJopRivV8Si8MsRubiGTXJwy35obswdKYT3sEbCI-8J5ttZs60Q42-3vegJhde6Ma5vmR89ig&lib=McI758pGcVz3y2ie2K0qCakWpqKg1bUk2';
const COURSE_TEMPLATE_URL = 'https://main--uniofcanberra--legokam.aem.page/courses/default';
const COURSE_CACHE_TTL_MS = 5 * 60 * 1000;

let coursesCache = null;
let coursesCacheTime = 0;

function getStudyLevel(courseName = '') {
  const name = courseName.toLowerCase();
  if (name.includes('master') || name.includes('graduate certificate') || name.includes('graduate diploma')) {
    return 'Graduate';
  }
  if (name.includes('bachelor') || name.includes('diploma')) {
    return 'Undergraduate';
  }
  return 'Other';
}

function getCreditPoints(duration = '') {
  const match = duration.match(/(\d+)\s*Credit Points/i);
  return match ? match[1] : '';
}

function getDuration(duration = '') {
  const match = duration.match(/^([^/]+)/);
  return match ? match[1].trim() : duration;
}

function parseDelimitedText(text = '') {
  if (!text) return [];
  return text
    .split(/;(?=\s*[a-z])/i)
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function normalizeCourse(raw) {
  const duration = raw['Duration & Credit Points'] || '';
  return {
    code: (raw['Course Code'] || '').toUpperCase(),
    name: raw['Course Name'] || '',
    faculty: raw.Faculty || '',
    description: raw['Course Description'] || '',
    learningOutcomes: raw['Learning Outcomes'] || '',
    careerPathways: raw['Career Pathways'] || '',
    duration,
    durationLabel: getDuration(duration),
    creditPoints: getCreditPoints(duration),
    delivery: raw['Delivery Mode'] || '',
    heroImageUrl: raw['Hero Image URL'] || '',
    promoVideoUrl: raw['Promo Video URL'] || '',
    studyLevel: getStudyLevel(raw['Course Name'] || ''),
    learningOutcomeItems: parseDelimitedText(raw['Learning Outcomes'] || ''),
    careerPathwayItems: parseDelimitedText(raw['Career Pathways'] || ''),
  };
}

function stripOverlaySuffix(segment = '') {
  return segment.replace(/\.(html?|plain)$/i, '');
}

function extractCourseCode(pathname, format = '/courses/{courseCode}') {
  const directMatch = pathname.match(/\/courses\/([^/?#]+)/i);
  if (directMatch?.[1]) {
    return stripOverlaySuffix(decodeURIComponent(directMatch[1])).toUpperCase();
  }

  const pathParts = pathname.split('/').filter(Boolean);
  const formatParts = format.split('/').filter(Boolean);
  if (pathParts.length !== formatParts.length) return '';

  const keyPart = formatParts.find((part) => /^\{.+\}$/.test(part));
  if (!keyPart) return '';
  const keyIndex = formatParts.indexOf(keyPart);

  for (let i = 0; i < formatParts.length; i += 1) {
    if (i === keyIndex) continue;
    if (formatParts[i] !== pathParts[i]) return '';
  }

  return stripOverlaySuffix(decodeURIComponent(pathParts[keyIndex] || '')).toUpperCase();
}

async function fetchCourses(courseApiUrl = COURSE_API_URL) {
  const now = Date.now();
  if (coursesCache && (now - coursesCacheTime) < COURSE_CACHE_TTL_MS) {
    return coursesCache;
  }

  const response = await fetch(courseApiUrl);
  if (!response.ok) {
    const error = new Error(`Failed to fetch course feed: ${response.status}`);
    error.statusCode = 502;
    throw error;
  }
  const payload = await response.json();
  coursesCache = payload.map(normalizeCourse);
  coursesCacheTime = now;
  return coursesCache;
}

function replaceBlockWithToken(plainHtml, blockClass, token) {
  const marker = `class="${blockClass}"`;
  const markerIdx = plainHtml.indexOf(marker);
  if (markerIdx === -1) return plainHtml;

  const divStart = plainHtml.lastIndexOf('<div', markerIdx);
  if (divStart === -1) return plainHtml;

  let depth = 0;
  let i = divStart;
  while (i < plainHtml.length) {
    if (plainHtml.startsWith('<div', i)) {
      depth += 1;
      i += 4;
      continue;
    }
    if (plainHtml.startsWith('</div>', i)) {
      depth -= 1;
      i += 6;
      if (depth === 0) {
        return `${plainHtml.slice(0, divStart)}${token}${plainHtml.slice(i)}`;
      }
      continue;
    }
    i += 1;
  }

  return plainHtml;
}

async function prepareBaseTemplate(url, blocks = ['course-details', 'course-catalog']) {
  const plainHtml = await fetch(`${url.replace(/\/$/, '')}.plain.html`).then((resp) => {
    if (!resp.ok) {
      const error = new Error(`Failed to fetch template: ${resp.status}`);
      error.statusCode = 502;
      throw error;
    }
    return resp.text();
  });

  const partialToken = '__COURSE_DETAILS_PARTIAL__';
  let result = plainHtml;
  let replaced = false;

  blocks.forEach((blockClass) => {
    if (replaced) return;
    const next = replaceBlockWithToken(result, blockClass, partialToken);
    if (next !== result) {
      result = next;
      replaced = true;
    }
  });

  if (!replaced) {
    result = `${result}${partialToken}`;
  }

  return result.replace(partialToken, '{{> course-details }}');
}

module.exports = {
  COURSE_API_URL,
  COURSE_TEMPLATE_URL,
  extractCourseCode,
  fetchCourses,
  prepareBaseTemplate,
};


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/* Adobe I/O Runtime action: publish all courses (scheduled or manual) */
const { publishAllCourses, CACHE_CONTROL } = __webpack_require__(425);
const { TtlCache } = __webpack_require__(312);

const syncCache = new TtlCache(Number(process.env.PUBLISH_CACHE_TTL_MS || 120000));

async function main(params = {}) {
  try {
    const cached = syncCache.get('all');
    if (cached) {
      return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': CACHE_CONTROL,
        },
        body: JSON.stringify({ ...cached, cached: true }),
      };
    }

    const results = await publishAllCourses(params);
    const summary = {
      published: results.filter((item) => item.status === 'published').length,
      failed: results.filter((item) => item.status === 'failed').length,
      total: results.length,
      results,
      syncedAt: new Date().toISOString(),
    };

    syncCache.set('all', summary);

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': CACHE_CONTROL,
      },
      body: JSON.stringify(summary),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: error.message || 'Sync failed' }),
    };
  }
}

exports.main = main;

})();

module.exports = __webpack_exports__;
/******/ })()
;