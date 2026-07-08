# Course BYOM Prerender (Lightweight)

Lightweight prerender service for course detail pages, modeled after the template-merge pattern used in [`adobe-rnd/aem-commerce-prerender`](https://github.com/adobe-rnd/aem-commerce-prerender).

## What it does

- Accepts requests like `/courses/UC-BPT-107`
- Fetches course data from the Google Apps Script feed
- Fetches `/courses/default.plain.html` and injects prerendered course markup into the first matching block (`.course-details` or `.course-catalog`)
- Returns full HTML suitable for EDS BYOM overlay

## Setup

```bash
cd tools/course-prerender
npm install
```

## Run locally

```bash
npm start
```

Default local endpoint:

- `http://localhost:8787/courses/UC-BPT-107`

For Adobe App Builder Runtime, use `scripts/action.js` as your action entrypoint (it returns `text/html` for `/courses/{code}` paths).

## Environment variables

- `PORT` (default `8787`)
- `COURSE_API_URL` (defaults to the provided Apps Script endpoint)
- `COURSE_TEMPLATE_URL` (default `https://main--uniofcanberra--legokam.aem.page/courses/default`)
- `COURSE_URL_FORMAT` (default `/courses/{courseCode}`)
- `SITE_BASE_URL` (default `https://main--uniofcanberra--legokam.aem.page`)
- `AEM_ADMIN_API_AUTH_TOKEN` (required for Admin API scripts)
- `HLX_ADMIN_TOKEN` (alternative to `AEM_ADMIN_API_AUTH_TOKEN`)
- `AEM_ORG` (default `LegoKam`)
- `AEM_SITE` (default `uniofcanberra`)
- `AEM_REF` (default `main`)
- `OVERLAY_URL` (required for overlay configuration)
- `OVERLAY_SUFFIX` (default `.html`)
- `TEST_COURSE_CODE` (default `UC-BPT-107`)

## Render a local test output

```bash
npm run render:test
```

Writes `tools/course-prerender/out/UC-BPT-107.html`.

## Configure overlay in AEM Admin

`OVERLAY_URL` must point to a publicly reachable BYOM endpoint.

```bash
OVERLAY_URL="https://<your-public-byo-endpoint>" npm run configure:overlay
```

## Publish a test course via overlay

```bash
TEST_COURSE_CODE=UC-BPT-107 npm run publish:test
```

This triggers:

- `POST https://admin.hlx.page/preview/{org}/{site}/{ref}/courses/{courseCode}`

## Notes

- This repo does not deploy the service by itself; deploy this service to your non-Vercel runtime (for example Adobe App Builder Runtime) and set `OVERLAY_URL` to that public endpoint.
- For best authoring flow, set `/courses/default` to include a `course-details` block so the template replacement target is explicit.
