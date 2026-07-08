import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_NEWS_INDEX = '/news-index.json';
const DEFAULT_UNCOVER_INDEX = '/uncover-index.json';
const NEWS_LIMIT = 3;

function normalizeIndexItem(item) {
  return {
    path: item.path,
    title: item.Title || item.title || '',
    date: item['Publication Date'] || item.date || '',
    description: item.Description || item.description || '',
    image: item.Image || item.image || '',
  };
}

function parsePanelItems(panel) {
  const items = [];
  let current = null;
  let viewAll = null;

  [...panel.children].forEach((el) => {
    if (el.tagName === 'H4') {
      if (current) items.push(current);
      current = { heading: el, excerpt: null, date: null, image: null };
    } else if (el.tagName === 'P') {
      if (el.querySelector('picture')) {
        if (current) current.image = el;
      } else if (el.querySelector('a') && el.textContent.trim().toLowerCase().includes('view all')) {
        viewAll = el;
      } else if (current) {
        if (!current.excerpt) current.excerpt = el;
        else current.date = el;
      }
    }
  });

  if (current) items.push(current);
  return { items, viewAll };
}

function getViewAllHref(contentCell, fallback = '/news') {
  const link = [...contentCell.querySelectorAll('a')].find(
    (anchor) => anchor.textContent.trim().toLowerCase().includes('view all'),
  );
  return link?.getAttribute('href') || fallback;
}

function buildNewsCard(item) {
  const card = document.createElement('article');
  card.className = 'tabs-news-card';

  if (item.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'tabs-news-card-image';
    const picture = item.image.querySelector('picture');
    if (picture) imageDiv.append(picture);
    card.append(imageDiv);
    item.image.remove();
  }

  const body = document.createElement('div');
  body.className = 'tabs-news-card-body';

  if (item.date) {
    item.date.classList.add('tabs-news-card-date');
    body.append(item.date);
  }
  if (item.heading) body.append(item.heading);
  if (item.excerpt) {
    item.excerpt.classList.add('tabs-news-card-excerpt');
    body.append(item.excerpt);
  }

  card.append(body);
  return card;
}

function buildNewsCardFromData(item) {
  const data = normalizeIndexItem(item);
  const card = document.createElement('article');
  card.className = 'tabs-news-card';

  if (data.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'tabs-news-card-image';
    imageDiv.append(createOptimizedPicture(data.image, data.title, false, [{ width: '400' }]));
    card.append(imageDiv);
  }

  const body = document.createElement('div');
  body.className = 'tabs-news-card-body';

  const date = document.createElement('p');
  date.className = 'tabs-news-card-date';
  date.textContent = data.date;
  body.append(date);

  const heading = document.createElement('h4');
  const link = document.createElement('a');
  link.href = data.path || '#';
  link.textContent = data.title;
  heading.append(link);
  body.append(heading);

  if (data.description) {
    const excerpt = document.createElement('p');
    excerpt.className = 'tabs-news-card-excerpt';
    excerpt.textContent = data.description;
    body.append(excerpt);
  }

  card.append(body);
  return card;
}

function appendViewAll(wrapper, href) {
  const viewAll = document.createElement('p');
  viewAll.className = 'tabs-news-view-all';
  const link = document.createElement('a');
  link.href = href;
  link.textContent = 'View all';
  viewAll.append(link);
  wrapper.append(viewAll);
}

function buildPanel(panel) {
  const { items, viewAll } = parsePanelItems(panel);
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-news-cards';

  items.forEach((item) => wrapper.append(buildNewsCard(item)));

  if (viewAll) {
    viewAll.className = 'tabs-news-view-all';
    wrapper.append(viewAll);
  }

  panel.replaceChildren(wrapper);
}

async function buildNewsPanel(panel, viewAllHref, indexUrl, feedLabel = 'news') {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-news-cards';

  try {
    const response = await fetch(indexUrl);
    if (!response.ok) throw new Error(`Failed to load ${feedLabel} (${response.status})`);

    const payload = await response.json();
    const items = (payload.data || []).slice(0, NEWS_LIMIT);
    items.forEach((item) => wrapper.append(buildNewsCardFromData(item)));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`tabs-news failed to load ${feedLabel} feed`, error);
    const message = document.createElement('p');
    message.className = 'tabs-news-error';
    message.textContent = `Unable to load ${feedLabel}. Please try again later.`;
    wrapper.append(message);
  }

  appendViewAll(wrapper, viewAllHref);
  panel.replaceChildren(wrapper);
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-news-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children];
  const newsIndexLink = block.querySelector('a[href$="news-index.json"]');
  const newsIndexUrl = newsIndexLink?.href || DEFAULT_NEWS_INDEX;
  const uncoverIndexLink = block.querySelector('a[href$="uncover-index.json"]');
  const uncoverIndexUrl = uncoverIndexLink?.href || DEFAULT_UNCOVER_INDEX;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const tabLabel = row.firstElementChild;
    const contentCell = row.children[1];
    const id = toClassName(tabLabel.textContent);

    const button = document.createElement('button');
    button.className = 'tabs-news-tab';
    button.id = `tab-${id}`;
    button.textContent = tabLabel.textContent.trim();
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel, idx) => {
        panel.setAttribute('aria-hidden', idx !== i ? 'true' : 'false');
      });
      tablist.querySelectorAll('button').forEach((btn, idx) => {
        btn.setAttribute('aria-selected', idx === i ? 'true' : 'false');
      });
    });
    tablist.append(button);

    row.className = 'tabs-news-panel';
    row.id = `tabpanel-${id}`;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', `tab-${id}`);
    row.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    row.replaceChildren();

    if (contentCell) {
      const tabName = tabLabel.textContent.trim().toLowerCase();
      if (tabName === 'news') {
        const viewAllHref = getViewAllHref(contentCell);
        // eslint-disable-next-line no-await-in-loop
        await buildNewsPanel(row, viewAllHref, newsIndexUrl, 'news');
      } else if (tabName === 'uncover') {
        const viewAllHref = getViewAllHref(contentCell, '/uncover');
        // eslint-disable-next-line no-await-in-loop
        await buildNewsPanel(row, viewAllHref, uncoverIndexUrl, 'UnCover');
      } else {
        while (contentCell.firstChild) row.append(contentCell.firstChild);
        buildPanel(row);
      }
    }
  }

  block.prepend(tablist);

  block.querySelectorAll('picture > img').forEach((img) => {
    if (img.src.includes('.svg')) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
