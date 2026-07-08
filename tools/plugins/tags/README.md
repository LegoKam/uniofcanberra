# Tags Plugin

Multi-select, searchable tag picker for Adobe Document Authoring (DA), based on [aem-sandbox/examples/tools/plugins/tags](https://github.com/aem-sandbox/examples/tree/main/tools/plugins/tags).

## Tag data source

Tags are loaded from the DA sheet at `/docs/library/tagging.json`:

- Live: https://main--uniofcanberra--legokam.aem.live/docs/library/tagging.json

Expected format:

```json
{
  "data": [
    { "key": "faculty_of_health", "value": "Faculty of Health" }
  ],
  "limit": 100
}
```

## Register in DA

1. Open https://da.live/config#/legokam/uniofcanberra
2. Open the **library** tab (create it if missing)
3. Add headers: `title`, `path`, `icon`, `experience`
4. Add this row:

| title | path | icon | experience |
| ----- | ---- | ---- | ----------- |
| Tags | https://main--uniofcanberra--legokam.aem.live/tools/plugins/tags/tags.html | https://main--uniofcanberra--legokam.aem.live/tools/plugins/tags/classification.svg | dialog |

5. Save the config sheet (paper plane icon)

## Local development

After `aem up`, test the plugin shell at:

`http://localhost:3000/tools/plugins/tags/tags.html`

To test inside DA against localhost, add a library row with `ref` set to `local`:

| title | path | experience | ref |
| ----- | ---- | ---------- | --- |
| Tags (local) | http://localhost:3000/tools/plugins/tags/tags.html | dialog | local |

Then edit with: `https://da.live/edit?ref=local#/legokam/uniofcanberra/index`

## Usage

1. Open a page in DA
2. Open **Library** from the edit menu
3. Choose **Tags**
4. Search and select tags
5. Click **Add Selected** — comma-separated tag keys are inserted into the document
