/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-campaign. Base block: hero.
 * Source: https://www.canberra.edu.au/ (body > section.hero-section)
 * Structure (from library-description.txt): 1 column.
 *   Row 2 = background image (optional)
 *   Row 3 = heading + subheading paragraph + CTA link
 */
export default function parse(element, { document }) {
  // Background image: the hero picture/img (not the CTA, not inline text)
  const bgImage = element.querySelector('picture, img');

  // Heading: main hero title
  const heading = element.querySelector('h1, h2, [id*="heading"], [class*="hero"] h1');

  // Intro paragraph
  const paragraph = element.querySelector('p.lead, p.hero-paragraph, .hero-text p, p');

  // CTA link(s)
  const ctaLinks = Array.from(element.querySelectorAll('a.btn, a.btn-apply, .hero-text a, a[href]'))
    // de-dup while preserving order
    .filter((a, i, arr) => arr.indexOf(a) === i);

  // Empty-block guard
  if (!heading && !paragraph && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: heading + subheading + CTA(s) — all in one cell (1-column block)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (paragraph) contentCell.push(paragraph);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-campaign', cells });
  element.replaceWith(block);
}
