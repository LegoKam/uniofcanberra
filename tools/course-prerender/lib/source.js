const { TtlCache } = require('./cache');

const authoredPageCache = new TtlCache(Number(process.env.PUBLISH_CACHE_TTL_MS || 120000));

function extractImsToken(rawToken = '') {
  const token = String(rawToken).replace(/^(Bearer|token)\s+/i, '').trim();
  if (!token) return '';

  const parts = token.split('.');
  if (parts.length !== 3) return token;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.imsToken || token;
  } catch {
    return token;
  }
}

function getSourceConfig(options = {}) {
  return {
    org: options.org || options.AEM_ORG || process.env.AEM_ORG || 'legokam',
    site: options.site || options.AEM_SITE || process.env.AEM_SITE || 'uniofcanberra',
    token: extractImsToken(
      options.token
      || options.AEM_ADMIN_API_AUTH_TOKEN
      || process.env.AEM_ADMIN_API_AUTH_TOKEN
      || process.env.HLX_ADMIN_TOKEN,
    ),
  };
}

async function hasAuthoredCoursePage(courseCode, options = {}) {
  const code = String(courseCode || '').toLowerCase();
  if (!code || code === 'default') return false;

  const cached = authoredPageCache.get(code);
  if (cached !== null) return cached;

  const { org, site, token } = getSourceConfig(options);
  if (!token) {
    return false;
  }

  const sourceUrl = `https://admin.da.live/source/${org}/${site}/courses/${code}.html`;
  const response = await fetch(sourceUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const exists = response.status === 200;
  authoredPageCache.set(code, exists);
  return exists;
}

module.exports = {
  extractImsToken,
  hasAuthoredCoursePage,
};
