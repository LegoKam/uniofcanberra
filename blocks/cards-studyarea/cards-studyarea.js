import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildSearchForm(container) {
  const form = document.createElement('form');
  form.className = 'cards-studyarea-search-form';
  form.action = '/courses/';
  form.method = 'get';

  const label = document.createElement('label');
  label.className = 'cards-studyarea-sr-only';
  label.setAttribute('for', 'cards-studyarea-search');
  label.textContent = 'Search courses';

  const input = document.createElement('input');
  input.id = 'cards-studyarea-search';
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Find your course';

  const button = document.createElement('button');
  button.type = 'submit';
  button.innerHTML = '<span class="cards-studyarea-sr-only">Search</span>';

  form.append(label, input, button);
  container.replaceChildren(form);
}

function isSearchCell(div) {
  return div.textContent.trim() === ':input';
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    const isHeader = index === 0 && li.querySelector('h2');
    if (isHeader) {
      li.className = 'cards-studyarea-header';
      [...li.children].forEach((div) => {
        if (div.querySelector('h2')) div.className = 'cards-studyarea-heading';
        else if (isSearchCell(div)) {
          div.className = 'cards-studyarea-search';
          buildSearchForm(div);
        }
      });
    } else {
      li.className = 'cards-studyarea-tile';
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-studyarea-card-image';
        } else {
          div.className = 'cards-studyarea-card-body';
        }
      });
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (img.src.includes('.svg')) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '150' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
