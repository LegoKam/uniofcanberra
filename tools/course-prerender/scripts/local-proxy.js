/* eslint-disable no-console */
const express = require('express');

const app = express();

const PROXY_PORT = Number(process.env.PROXY_PORT || 3001);
const EDS_ORIGIN = process.env.EDS_ORIGIN || 'http://localhost:3000';
const BYOM_ORIGIN = process.env.BYOM_ORIGIN || 'https://31876-958orangelandfowl.adobeioruntime.net/api/v1/web/course-byom/prerender';

function copyHeaders(response, target) {
  response.headers.forEach((value, key) => {
    // Let Express handle transfer/content-length for safety.
    if (key.toLowerCase() === 'transfer-encoding') return;
    if (key.toLowerCase() === 'content-length') return;
    target.setHeader(key, value);
  });
}

async function proxyRequest(targetBase, req, res, appendPath = true) {
  const targetUrl = appendPath
    ? new URL(req.originalUrl, targetBase)
    : new URL(`${targetBase.replace(/\/$/, '')}${req.originalUrl}`);
  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        accept: req.headers.accept || '*/*',
      },
    });

    copyHeaders(upstream, res);
    res.status(upstream.status);

    const body = Buffer.from(await upstream.arrayBuffer());
    res.send(body);
  } catch (error) {
    res.status(502).send(`Proxy upstream error for ${targetUrl}: ${error.message}`);
  }
}

// Route dynamic course paths to BYOM.
app.get('/courses/:courseCode', async (req, res) => {
  await proxyRequest(BYOM_ORIGIN, req, res, false);
});

// Let template page still come from local EDS source.
app.get('/courses/default*', async (req, res) => {
  await proxyRequest(EDS_ORIGIN, req, res);
});

// Everything else passes through local EDS dev server.
app.use(async (req, res) => {
  await proxyRequest(EDS_ORIGIN, req, res);
});

app.listen(PROXY_PORT, () => {
  console.log(`Local proxy listening on http://localhost:${PROXY_PORT}`);
  console.log(`- /courses/* -> ${BYOM_ORIGIN}`);
  console.log(`- everything else -> ${EDS_ORIGIN}`);
});
