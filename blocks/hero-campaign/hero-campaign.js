import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const picture = block.querySelector(':scope > div:first-child picture');
  if (!picture) {
    block.classList.add('hero-campaign-no-image');
    return;
  }

  const img = picture.querySelector('img');
  const optimizedPic = createOptimizedPicture(
    img.src,
    img.alt,
    true,
    [{ media: '(min-width: 900px)', width: '2000' }, { width: '750' }],
  );
  const optimizedImg = optimizedPic.querySelector('img');
  optimizedImg.setAttribute('fetchpriority', 'high');
  picture.replaceWith(optimizedPic);
}
