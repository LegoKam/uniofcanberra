const DEFAULT_ENSURE_URL = 'https://31876-958orangelandfowl.adobeioruntime.net/api/v1/web/course-byom/ensure';
const CACHE_KEY_PREFIX = 'course-publish:';
const CACHE_TTL_MS = 120000;

export function getCourseEnsureUrl() {
  return document.querySelector('meta[name="course-ensure-url"]')?.content?.trim() || DEFAULT_ENSURE_URL;
}

function isRecentlyEnsured(courseCode) {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${courseCode.toLowerCase()}`);
    if (!raw) return false;
    return (Date.now() - Number(raw)) < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

function markEnsured(courseCode) {
  try {
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${courseCode.toLowerCase()}`, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

export async function ensureCoursePublished(courseCode) {
  const normalized = String(courseCode || '').toLowerCase();
  if (!normalized || normalized === 'default') return null;
  if (isRecentlyEnsured(normalized)) {
    return { skipped: true, courseCode: normalized };
  }

  const base = getCourseEnsureUrl().replace(/\/$/, '');
  const response = await fetch(`${base}?courseCode=${encodeURIComponent(normalized)}`, {
    method: 'POST',
    mode: 'cors',
  });

  if (!response.ok) return null;
  const payload = await response.json();
  markEnsured(normalized);
  return payload;
}

export function extractCourseCodeFromPath(pathname = window.location.pathname) {
  const match = pathname.match(/\/courses\/([^/?#]+)/i);
  if (!match?.[1]) return '';
  return match[1].replace(/\.html?$/i, '').toLowerCase();
}

export async function warmPublishCourses(courseCodes = []) {
  const unique = [...new Set(
    courseCodes
      .map((code) => String(code).toLowerCase())
      .filter((code) => code && code !== 'default'),
  )];

  await Promise.allSettled(unique.map((code) => ensureCoursePublished(code)));
}

export async function handleCourse404AutoPublish() {
  const courseCode = extractCourseCodeFromPath();
  if (!courseCode || courseCode === 'default') return false;

  const result = await ensureCoursePublished(courseCode);
  if (result?.url) {
    window.location.replace(result.url);
    return true;
  }
  if (result?.skipped) {
    window.location.reload();
    return true;
  }
  return false;
}
