/* Adobe I/O Runtime action: publish all courses (scheduled or manual) */
const { publishAllCourses, CACHE_CONTROL } = require('../lib/publish');
const { TtlCache } = require('../lib/cache');

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
