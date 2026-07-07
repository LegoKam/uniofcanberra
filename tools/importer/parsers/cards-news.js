/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base block: cards (image variant).
 * Source: https://www.canberra.edu.au/ (section .tab-content .news-item-card)
 * Structure (from library-description.txt, "Cards"): 2 columns.
 *   First row = block name. Each subsequent row = one news card:
 *   cell 1 = thumbnail image, cell 2 = heading (linked) + excerpt + date.
 */
export default function parse(element, { document }) {
  // The parser may receive either a single .news-item-card or a container.
  let items;
  if (element.matches && element.matches('.news-item-card')) {
    items = [element];
  } else {
    items = Array.from(element.querySelectorAll('.news-item-card'));
  }

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('.news-item-image img, .news-item-image picture, img, picture');
    const heading = item.querySelector('.news-item-summary h1, .news-item-summary h2, .news-item-summary h3, .news-item-summary h4, h1, h2, h3, h4, h5, h6');
    const excerpt = item.querySelector('.news-item-summary p, p');
    const dateEl = item.querySelector('.news-item-date');

    const imageCell = img || '';

    const textCell = [];
    if (heading) textCell.push(heading);
    if (excerpt) textCell.push(excerpt);
    if (dateEl) {
      // Wrap the date text in a paragraph so it survives as its own line.
      const dateText = dateEl.textContent.trim();
      if (dateText) {
        const p = document.createElement('p');
        p.textContent = dateText;
        textCell.push(p);
      }
    }

    // Only emit a card that has an image or text content
    if (imageCell || textCell.length > 0) {
      cells.push([imageCell, textCell.length > 0 ? textCell : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
