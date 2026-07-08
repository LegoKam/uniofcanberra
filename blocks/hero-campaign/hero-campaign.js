export default function decorate(block) {
  const picture = block.querySelector(':scope > div:first-child picture');
  if (!picture) {
    block.classList.add('hero-campaign-no-image');
    return;
  }

  const img = picture.querySelector('img');
  if (!img) return;

  // Keep the authored image request discoverable from initial HTML.
  img.setAttribute('loading', 'eager');
  img.setAttribute('fetchpriority', 'high');
}
