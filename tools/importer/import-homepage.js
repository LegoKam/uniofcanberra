/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCampaignParser from './parsers/hero-campaign.js';
import cardsPathwayParser from './parsers/cards-pathway.js';
import cardsStudyareaParser from './parsers/cards-studyarea.js';
import cardsStatParser from './parsers/cards-stat.js';
import cardsNewsParser from './parsers/cards-news.js';
import tabsNewsParser from './parsers/tabs-news.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/canberra-cleanup.js';
import sectionsTransformer from './transformers/canberra-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: "University of Canberra homepage: full-bleed hero with heading and CTA, a 'Choose your pathway' card grid, an 'Explore our courses' search + study-area card grid, a 'Why study at UC' selling-points feature, and a 'News and stories' tabbed listing.",
  urls: [
    'https://www.canberra.edu.au/',
  ],
  blocks: [
    { name: 'hero-campaign', instances: ['body > section.hero-section'] },
    { name: 'cards-pathway', instances: ['div.container.my-5 .pathway-items'] },
    { name: 'cards-studyarea', instances: ['section.courses-section .course-category'] },
    { name: 'cards-stat', instances: ['#selling_points_2378666 .selling-point'] },
    { name: 'tabs-news', instances: ['section .news-selector'] },
    { name: 'cards-news', instances: ['section .tab-content .news-item-card'] },
  ],
  sections: [
    { id: 'rc3', name: 'hero', selector: ['body > section.hero-section'], style: null, blocks: ['hero-campaign'], defaultContent: [] },
    { id: 'rc4', name: 'choose-your-pathway', selector: ['body > div.container.my-5'], style: null, blocks: ['cards-pathway'], defaultContent: ['div.container.my-5 .jumbo-heading'] },
    { id: 'rc5', name: 'explore-our-courses', selector: ['body > section.courses-section'], style: null, blocks: ['cards-studyarea'], defaultContent: ['section.courses-section .jumbo-heading', 'section.courses-section .course-search-bar'] },
    { id: 'rc6', name: 'why-study-at-uc', selector: ['#selling_points_2378666'], style: null, blocks: ['cards-stat'], defaultContent: ['#selling_points_2378666 .selling-point-main'] },
    { id: 'rc7', name: 'news-and-stories', selector: ['body > section:nth-of-type(3)'], style: 'dark-teal', blocks: ['tabs-news', 'cards-news'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-campaign': heroCampaignParser,
  'cards-pathway': cardsPathwayParser,
  'cards-studyarea': cardsStudyareaParser,
  'cards-stat': cardsStatParser,
  'cards-news': cardsNewsParser,
  'tabs-news': tabsNewsParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata (afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already detached by a prior parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Document path (run-bulk-import sanitizes this further)
    const path = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index';

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
