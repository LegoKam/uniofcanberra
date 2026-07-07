import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function classifyCells(li, imageClass, bodyClass) {
  [...li.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector('picture')) {
      div.className = imageClass;
    } else {
      div.className = bodyClass;
    }
  });
}

function buildStat(statRow) {
  const stat = document.createElement('div');
  stat.className = 'cards-stat-stat';
  moveInstrumentation(statRow, stat);
  while (statRow.firstElementChild) stat.append(statRow.firstElementChild);
  classifyCells(stat, 'cards-stat-card-image', 'cards-stat-card-body');
  return stat;
}

export default function decorate(block) {
  const rows = [...block.children];
  const ul = document.createElement('ul');

  rows.forEach((row, index) => {
    if (index === 0) {
      const hero = document.createElement('li');
      hero.className = 'cards-stat-hero';
      moveInstrumentation(row, hero);
      while (row.firstElementChild) hero.append(row.firstElementChild);
      classifyCells(hero, 'cards-stat-hero-image', 'cards-stat-hero-content');
      ul.append(hero);
      return;
    }

    if (index === 1) {
      const stats = document.createElement('li');
      stats.className = 'cards-stat-stats';
      ul.append(stats);
      stats.append(buildStat(row));
      return;
    }

    const stats = ul.querySelector('.cards-stat-stats');
    if (stats) stats.append(buildStat(row));
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
