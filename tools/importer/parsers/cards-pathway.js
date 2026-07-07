/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pathway. Base block: cards (no images variant).
 * Source: https://www.canberra.edu.au/ (div.container.my-5 .pathway-items)
 * Structure (from library-description.txt, "Cards (no images)"): 1 column.
 *   First row = block name. Each subsequent row = one card, single cell =
 *   heading (linked) + description. No images.
 */
export default function parse(element, { document }) {
  // Each card is a .pathway-item; fall back to direct children if class differs.
  let items = Array.from(element.querySelectorAll(':scope > .pathway-item, :scope .pathway-item'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll(':scope > div'));
  }

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const heading = item.querySelector('h1, h2, h3, h4, h5, h6');
    const description = item.querySelector('p');

    const cardCell = [];
    if (heading) cardCell.push(heading);
    if (description) cardCell.push(description);

    // 1-column block: one row per card, single cell holds heading + description
    if (cardCell.length > 0) {
      cells.push([cardCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pathway', cells });
  element.replaceWith(block);
}
