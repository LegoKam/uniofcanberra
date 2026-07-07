/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stat. Base block: cards (image variant).
 * Source: https://www.canberra.edu.au/ (#selling_points_2378666 .selling-point)
 * Structure (from library-description.txt, "Cards"): 2 columns.
 *   First row = block name. Each subsequent row = one stat card:
 *   cell 1 = icon image, cell 2 = stat statement + attribution source.
 *
 * Note: the ".selling-point-main" element (feature image + highlight label) is
 * authored as default content, not part of this block, so it is skipped.
 */
export default function parse(element, { document }) {
  // The parser may receive either the container or a single .selling-point.
  let items;
  if (element.matches && element.matches('.selling-point')) {
    items = [element];
  } else {
    items = Array.from(element.querySelectorAll('.selling-point'));
  }

  // Skip the main/feature selling point — it is default content, not a stat card.
  items = items.filter((el) => !el.classList.contains('selling-point-main'));

  // Empty-block guard (e.g. only the main selling point matched)
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img, picture');
    const paragraphs = Array.from(item.querySelectorAll('p'));

    const iconCell = img || '';

    const textCell = [];
    paragraphs.forEach((p) => textCell.push(p));

    // Only emit cards that carry a stat statement or icon
    if (iconCell || textCell.length > 0) {
      cells.push([iconCell, textCell.length > 0 ? textCell : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stat', cells });
  element.replaceWith(block);
}
