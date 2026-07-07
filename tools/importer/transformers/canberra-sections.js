/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: University of Canberra section breaks and section metadata.
 *
 * Runs in afterTransform only. Reads payload.template.sections and, for each
 * section (processed in reverse so DOM insertions don't shift earlier lookups):
 *   - inserts an <hr> before the section element when it is not the first
 *     section (so consecutive sections get a break between them);
 *   - appends a "Section Metadata" block after the section element when the
 *     section defines a `style`.
 *
 * Section selectors come from tools/importer/page-templates.json (homepage),
 * which were themselves derived from the captured DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function findSectionElement(element, selectors) {
  if (!selectors || !selectors.length) return null;
  for (let i = 0; i < selectors.length; i += 1) {
    let el = null;
    try {
      el = element.querySelector(selectors[i]);
    } catch (e) {
      el = null;
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserting <hr>/metadata for a later section does
    // not disturb the DOM position lookups for earlier sections.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);
      if (!sectionEl) continue;

      // Section Metadata block after the section, when a style is defined.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        }
      }

      // Section break before every section except the first.
      if (i > 0 && sectionEl.parentNode) {
        const hr = doc.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
