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
cp .env.example .env
```

## Run locally

```bash
npm start
```

Default local endpoint:

- `http://localhost:8787/courses/UC-BPT-107`

## Local proxy for `localhost` testing

If you want a single local URL that behaves like production overlay routing:

- `/courses/*` -> BYOM action
- everything else -> your local EDS server (`localhost:3000`)

Run in a second terminal:

```bash
npm run start:proxy
```

Then browse:

- `http://localhost:3001/courses/UC-BCY-102`

Optional overrides:

```bash
PROXY_PORT=3001 EDS_ORIGIN=http://localhost:3000 BYOM_ORIGIN=https://<your-action-url> npm run start:proxy
```

For Adobe App Builder Runtime, `scripts/action.js` is configured as the web action entrypoint (returns `text/html` for `/courses/{code}` paths).

## Environment variables

- `PORT` (default `8787`)
- `COURSE_API_URL` (defaults to the provided Apps Script endpoint)
- `COURSE_TEMPLATE_URL` (default `https://main--uniofcanberra--legokam.aem.page/courses/default`)
- `COURSE_URL_FORMAT` (default `/courses/{courseCode}`)
- `SITE_BASE_URL` (default `https://main--uniofcanberra--legokam.aem.page`)
- `AEM_ADMIN_API_AUTH_TOKEN` (required for Admin API scripts)
- `HLX_ADMIN_TOKEN` (alternative to `AEM_ADMIN_API_AUTH_TOKEN`)
- `AEM_ORG` (default `legokam`)
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

## Deploy to Adobe App Builder (no Vercel)

This scaffold includes `app.config.yaml` in the same style as `aem-commerce-prerender`:

- package: `course-byom`
- web action: `prerender`
- action file: `scripts/action.js`

From this folder:

```bash
aio app use <your-downloaded-app-builder-project.json>
export AIO_RUNTIME_NAMESPACE="<your-runtime-namespace>"
npm run appbuilder:deploy
```

If deploy reports `missing Adobe I/O Runtime namespace`, your workspace is selected but runtime namespace is not set in shell; export `AIO_RUNTIME_NAMESPACE` and run deploy again.

After deploy, get your public action URL and set it as:

```bash
OVERLAY_URL="https://<namespace>.adobeioruntime.net/api/v1/web/course-byom/prerender"
```

## Configure overlay in AEM Admin

`OVERLAY_URL` must point to a publicly reachable BYOM endpoint.

```bash
OVERLAY_URL="https://<your-public-byo-endpoint>" npm run configure:overlay
```

## Publish a test course via overlay

```bash
TEST_COURSE_CODE=UC-BPT-107 npm run publish:test
```

Publish all courses from the feed:

```bash
npm run publish:all
```

This triggers:

- `POST https://admin.hlx.page/preview/{org}/{site}/{ref}/courses/{courseCode}`

## Auto-publish and CDN cache (2 minutes)

After deploy, three App Builder actions are available:

| Action | URL suffix | Purpose |
|--------|------------|---------|
| `prerender` | `/prerender/courses/{code}.html` | BYOM HTML generation (cached 2 min in runtime) |
| `ensure` | `/ensure?courseCode={code}` | Publish one course to preview if missing |
| `sync-courses` | `/sync-courses` | Publish all courses (runs every 2 min via schedule) |

Site-side auto-publish:

- `404.html` calls `ensure` when a `/courses/{code}` page is missing, then reloads
- `course-catalog` warm-publishes all courses in the background when the catalog loads
- Browser session cache avoids duplicate ensure calls within 2 minutes

Deploy with admin token so `ensure` and `sync-courses` can publish:

```bash
# .env must include AEM_ADMIN_API_AUTH_TOKEN
aio app deploy
npm run publish:all
```

Update `head.html` meta `course-ensure-url` if your runtime namespace changes.

Cache behavior:

- App Builder prerender/ensure responses: `Cache-Control: public, max-age=120`
- Preview CDN (`.aem.page`): EDS defaults to ~60s for HTML ([network profile](https://www.aem.live/docs/network-profile))
- Production CDN (`.aem.live`): EDS defaults to 2 hours after live publish

## Notes

- This scaffold is App Builder-ready and intentionally avoids Vercel.
- The Admin API scripts require a valid `AEM_ADMIN_API_AUTH_TOKEN`.
- For best authoring flow, set `/courses/default` to include a `course-details` block so the template replacement target is explicit.
