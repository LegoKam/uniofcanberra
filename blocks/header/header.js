import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeSearch(nav) {
  const search = nav.querySelector('.nav-search');
  if (search) search.classList.remove('open');
}

function toggleMenu(nav, expanded) {
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  const hamburger = nav.parentElement.querySelector('.nav-hamburger button');
  if (hamburger) {
    hamburger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  }
}

/**
 * loads and decorates the header (University of Canberra)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['utility', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: strip the auto-button treatment off the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

  // Tools: turn the "Search" text into a search toggle + input
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.innerHTML = `
      <button type="button" class="nav-search-toggle" aria-label="Search" aria-expanded="false">
        <span class="nav-search-icon"></span>
      </button>
      <div class="nav-search" role="search">
        <input type="search" aria-label="Search" placeholder="What would you like to find?">
        <button type="button" class="nav-search-submit" aria-label="Submit search"></button>
      </div>`;
    const toggle = navTools.querySelector('.nav-search-toggle');
    const search = navTools.querySelector('.nav-search');
    toggle.addEventListener('click', () => {
      const open = search.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) search.querySelector('input').focus();
    });
  }

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    toggleMenu(nav, !expanded);
  });

  nav.setAttribute('aria-expanded', 'false');

  // Reset menu/search state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closeSearch(nav);
  });

  // Close search on Escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeSearch(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(hamburger, nav);
  block.append(navWrapper);
}
