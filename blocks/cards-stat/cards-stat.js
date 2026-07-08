import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildStat(statRow) {
  const stat = document.createElement('div');
  stat.className = 'cards-stat-stat';
  moveInstrumentation(statRow, stat);
  while (statRow.firstElementChild) stat.append(statRow.firstElementChild);
  [...stat.children].forEach((div) => {
    if (div.children.length === 1 && div.querySelector('picture')) {
      div.className = 'cards-stat-card-image';
    } else {
      div.className = 'cards-stat-card-body';
    }
  });
  return stat;
}

export default function decorate(block) {
  const rows = [...block.children];
  const ul = document.createElement('ul');

  rows.forEach((row, index) => {
    if (index === 0) {
      const heroContent = document.createElement('li');
      heroContent.className = 'cards-stat-hero-content';
      const hero = document.createElement('li');
      hero.className = 'cards-stat-hero';
      moveInstrumentation(row, hero);

      const cells = [...row.children];
      if (cells[0]) {
        cells[0].className = 'cards-stat-hero-image';
        hero.append(cells[0]);
      }
      if (cells[1]) {
        while (cells[1].firstElementChild) heroContent.append(cells[1].firstElementChild);
      }

      ul.append(heroContent, hero);
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

  ul.querySelectorAll('.cards-stat-hero-image picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  ul.querySelectorAll('.cards-stat-stat picture > img').forEach((img) => {
    if (img.src.includes('.svg')) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
