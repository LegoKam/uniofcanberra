import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Normalizes authored quote content into a single blockquote element.
 * @param {Element} block The quote block element
 */
export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const source = row.firstElementChild;
  if (!source) return;

  const blockquote = document.createElement('blockquote');
  moveInstrumentation(source, blockquote);

  while (source.firstChild) {
    blockquote.append(source.firstChild);
  }

  if (!blockquote.querySelector('p')) {
    const text = blockquote.textContent.trim();
    blockquote.textContent = '';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    blockquote.append(paragraph);
  }

  block.replaceChildren(blockquote);
}
