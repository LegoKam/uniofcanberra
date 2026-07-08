import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeSearch(nav) {
  const search = nav.querySelector('.nav-search');
  const toggle = nav.querySelector('.nav-search-toggle');
  if (search) search.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}

function toggleMenu(nav, expanded) {
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const backdrop = nav.closest('.nav-wrapper')?.querySelector('.nav-backdrop');
  if (backdrop) backdrop.classList.toggle('visible', expanded && !isDesktop.matches);
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  const hamburger = nav.querySelector('.nav-hamburger button');
  if (hamburger) {
    hamburger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  }
}

function decorateUtility(nav) {
  const navUtility = nav.querySelector('.nav-utility');
  if (!navUtility) return;

  const uls = [...navUtility.querySelectorAll(':scope > ul, :scope > .default-content-wrapper > ul')];
  if (uls[0]) uls[0].classList.add('nav-utility-meta');
  if (uls[1]) uls[1].classList.add('nav-utility-quick');

  const safeItem = navUtility.querySelector('.nav-utility-meta a[href*="safe-community"]')
    ?.closest('li');
  if (safeItem) {
    const highlight = document.createElement('div');
    highlight.className = 'nav-utility-highlight';
    highlight.append(safeItem.cloneNode(true));
    nav.append(highlight);
  }
}

function decorateSections(nav) {
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  navSections.querySelectorAll('a').forEach((link) => {
    const chevron = document.createElement('span');
    chevron.className = 'nav-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    link.append(chevron);
  });
}

/**
 * loads and decorates the header (University of Canberra)
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
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

  decorateUtility(nav);
  decorateSections(nav);

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

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

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    toggleMenu(nav, !expanded);
    if (!expanded) closeSearch(nav);
  });

  const navActions = document.createElement('div');
  navActions.className = 'nav-actions';
  if (navTools) navActions.append(navTools);
  navActions.append(hamburger);

  if (navBrand) {
    navBrand.after(navActions);
  } else {
    nav.append(navActions);
  }

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'nav-mobile-menu';
  const navSections = nav.querySelector('.nav-sections');
  const quickUl = nav.querySelector('.nav-utility-quick');
  if (navSections) mobileMenu.append(navSections);
  if (quickUl) mobileMenu.append(quickUl.cloneNode(true));
  const highlight = nav.querySelector('.nav-utility-highlight');
  if (highlight) mobileMenu.append(highlight);
  nav.append(mobileMenu);

  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closeSearch(nav);
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeSearch(nav);
      toggleMenu(nav, false);
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.addEventListener('click', () => toggleMenu(nav, false));
  navWrapper.append(backdrop, nav);
  block.append(navWrapper);
}
