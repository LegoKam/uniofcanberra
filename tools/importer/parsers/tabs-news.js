/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-news. Base block: tabs (Block Collection).
 * Source: https://www.canberra.edu.au/ (section .news-selector)
 * Structure (from library-description.txt, "Tabs"): 2 columns.
 *   First row = block name. Each subsequent row = one tab:
 *   cell 1 = tab label, cell 2 = tab content.
 *
 * The source element is the tab switcher (<ul.news-selector>) only; the tab
 * bodies (news card grids) live in sibling .tab-pane elements referenced by
 * each nav-link's href (e.g. #news-listing / #uncover-listing). Each tab's
 * content cell is populated from its matching tab-pane so labels stay paired
 * with their content. The nested card grids are authored separately by the
 * cards-news parser; here we capture the label + a reference to the pane.
 */
export default function parse(element, { document }) {
  // Collect the tab switcher links (each maps to one tab).
  let tabLinks = Array.from(element.querySelectorAll('.nav-link, a[href^="#"], li a'));
  // De-duplicate while preserving order.
  tabLinks = tabLinks.filter((a, i, arr) => arr.indexOf(a) === i);

  // Empty-block guard
  if (tabLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Locate the tab-content container so we can pair each label with its pane.
  const root = element.ownerDocument || document;
  const findPane = (href) => {
    if (!href || !href.startsWith('#') || href.length < 2) return null;
    const id = href.slice(1);
    return root.getElementById(id) || root.querySelector(`.tab-pane#${CSS.escape(id)}`);
  };

  const cells = [];

  tabLinks.forEach((link) => {
    const label = link.textContent.trim();
    if (!label) return;

    // Cell 1: tab label (plain text)
    const labelCell = label;

    // Cell 2: tab content. Prefer the referenced pane's content; otherwise
    // leave a placeholder cell so the tab row keeps two columns. The nested
    // news cards are authored separately (see cards-news); a "View all" link
    // inside the pane is preserved when present.
    let contentCell = '';
    const pane = findPane(link.getAttribute('href'));
    if (pane) {
      // Strip screen-reader-only headings so the content cell isn't noisy;
      // keep the meaningful content (card grid + View all link).
      const paneClone = pane.cloneNode(true);
      paneClone.querySelectorAll('.sr-only').forEach((n) => n.remove());
      const contentEls = Array.from(paneClone.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0;
        return n.nodeType === 1;
      });
      if (contentEls.length > 0) contentCell = contentEls;
    }

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-news', cells });
  element.replaceWith(block);
}
