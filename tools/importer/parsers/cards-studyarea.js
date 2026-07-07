/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-studyarea. Base block: cards (image variant).
 * Source: https://www.canberra.edu.au/ (section.courses-section .course-category)
 * Structure (from library-description.txt, "Cards"): 2 columns.
 *   First row = block name. Each subsequent row = one card:
 *   cell 1 = icon image, cell 2 = linked label.
 */
export default function parse(element, { document }) {
  // Collect the study-area cards. The parser may receive either the container
  // (section/row) holding multiple .course-category items, or a single
  // .course-category element — handle both.
  let items = Array.from(element.querySelectorAll('.course-category'));
  if (items.length === 0) {
    if (element.matches && element.matches('.course-category')) {
      items = [element];
    } else {
      items = Array.from(element.querySelectorAll(':scope > div'));
    }
  }

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    const img = item.querySelector('img, picture');

    // Icon cell (first column)
    const iconCell = img || '';

    // Label cell (second column): prefer the link (carries href + label text)
    let labelCell = '';
    if (link) {
      // Clone the link and strip out any nested image so the label cell is
      // just the linked text, keeping the icon in the first cell only.
      const labelLink = link.cloneNode(true);
      labelLink.querySelectorAll('img, picture, br').forEach((n) => n.remove());
      const text = labelLink.textContent.trim();
      if (text) {
        labelLink.textContent = text;
        labelCell = labelLink;
      }
    }

    // Only emit a card that has at least an icon or a label
    if (iconCell || labelCell) {
      cells.push([iconCell, labelCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-studyarea', cells });
  element.replaceWith(block);
}
