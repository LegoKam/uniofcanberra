/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-campaign.js
  function parse(element, { document }) {
    const bgImage = element.querySelector("picture, img");
    const heading = element.querySelector('h1, h2, [id*="heading"], [class*="hero"] h1');
    const paragraph = element.querySelector("p.lead, p.hero-paragraph, .hero-text p, p");
    const ctaLinks = Array.from(element.querySelectorAll("a.btn, a.btn-apply, .hero-text a, a[href]")).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !paragraph && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (paragraph) contentCell.push(paragraph);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-campaign", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pathway.js
  function parse2(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > .pathway-item, :scope .pathway-item"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(":scope > div"));
    }
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const heading = item.querySelector("h1, h2, h3, h4, h5, h6");
      const description = item.querySelector("p");
      const cardCell = [];
      if (heading) cardCell.push(heading);
      if (description) cardCell.push(description);
      if (cardCell.length > 0) {
        cells.push([cardCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-pathway", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-studyarea.js
  function parse3(element, { document }) {
    let items = Array.from(element.querySelectorAll(".course-category"));
    if (items.length === 0) {
      if (element.matches && element.matches(".course-category")) {
        items = [element];
      } else {
        items = Array.from(element.querySelectorAll(":scope > div"));
      }
    }
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a[href]");
      const img = item.querySelector("img, picture");
      const iconCell = img || "";
      let labelCell = "";
      if (link) {
        const labelLink = link.cloneNode(true);
        labelLink.querySelectorAll("img, picture, br").forEach((n) => n.remove());
        const text = labelLink.textContent.trim();
        if (text) {
          labelLink.textContent = text;
          labelCell = labelLink;
        }
      }
      if (iconCell || labelCell) {
        cells.push([iconCell, labelCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-studyarea", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-stat.js
  function parse4(element, { document }) {
    let items;
    if (element.matches && element.matches(".selling-point")) {
      items = [element];
    } else {
      items = Array.from(element.querySelectorAll(".selling-point"));
    }
    items = items.filter((el) => !el.classList.contains("selling-point-main"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img, picture");
      const paragraphs = Array.from(item.querySelectorAll("p"));
      const iconCell = img || "";
      const textCell = [];
      paragraphs.forEach((p) => textCell.push(p));
      if (iconCell || textCell.length > 0) {
        cells.push([iconCell, textCell.length > 0 ? textCell : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-stat", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse5(element, { document }) {
    let items;
    if (element.matches && element.matches(".news-item-card")) {
      items = [element];
    } else {
      items = Array.from(element.querySelectorAll(".news-item-card"));
    }
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".news-item-image img, .news-item-image picture, img, picture");
      const heading = item.querySelector(".news-item-summary h1, .news-item-summary h2, .news-item-summary h3, .news-item-summary h4, h1, h2, h3, h4, h5, h6");
      const excerpt = item.querySelector(".news-item-summary p, p");
      const dateEl = item.querySelector(".news-item-date");
      const imageCell = img || "";
      const textCell = [];
      if (heading) textCell.push(heading);
      if (excerpt) textCell.push(excerpt);
      if (dateEl) {
        const dateText = dateEl.textContent.trim();
        if (dateText) {
          const p = document.createElement("p");
          p.textContent = dateText;
          textCell.push(p);
        }
      }
      if (imageCell || textCell.length > 0) {
        cells.push([imageCell, textCell.length > 0 ? textCell : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-news.js
  function parse6(element, { document }) {
    let tabLinks = Array.from(element.querySelectorAll('.nav-link, a[href^="#"], li a'));
    tabLinks = tabLinks.filter((a, i, arr) => arr.indexOf(a) === i);
    if (tabLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const root = element.ownerDocument || document;
    const findPane = (href) => {
      if (!href || !href.startsWith("#") || href.length < 2) return null;
      const id = href.slice(1);
      return root.getElementById(id) || root.querySelector(`.tab-pane#${CSS.escape(id)}`);
    };
    const cells = [];
    tabLinks.forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      const labelCell = label;
      let contentCell = "";
      const pane = findPane(link.getAttribute("href"));
      if (pane) {
        const paneClone = pane.cloneNode(true);
        paneClone.querySelectorAll(".sr-only").forEach((n) => n.remove());
        const contentEls = Array.from(paneClone.childNodes).filter((n) => {
          if (n.nodeType === 3) return n.textContent.trim().length > 0;
          return n.nodeType === 1;
        });
        if (contentEls.length > 0) contentCell = contentEls;
      }
      cells.push([labelCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/canberra-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#style_2378656",
        "#script_2378678"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.page-header",
        "footer.page-footer",
        "#skip-navigation",
        "a.ucweb-common-header-skipnav",
        "iframe",
        'img[src*="everesttech.net"]',
        'img[src*="demdex.net"]',
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/canberra-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findSectionElement(element, selectors) {
    if (!selectors || !selectors.length) return null;
    for (let i = 0; i < selectors.length; i += 1) {
      let el = null;
      try {
        el = element.querySelector(selectors[i]);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && template.sections;
      if (!sections || sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
          }
        }
        if (i > 0 && sectionEl.parentNode) {
          const hr = doc.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "University of Canberra homepage: full-bleed hero with heading and CTA, a 'Choose your pathway' card grid, an 'Explore our courses' search + study-area card grid, a 'Why study at UC' selling-points feature, and a 'News and stories' tabbed listing.",
    urls: [
      "https://www.canberra.edu.au/"
    ],
    blocks: [
      { name: "hero-campaign", instances: ["body > section.hero-section"] },
      { name: "cards-pathway", instances: ["div.container.my-5 .pathway-items"] },
      { name: "cards-studyarea", instances: ["section.courses-section .course-category"] },
      { name: "cards-stat", instances: ["#selling_points_2378666 .selling-point"] },
      { name: "tabs-news", instances: ["section .news-selector"] },
      { name: "cards-news", instances: ["section .tab-content .news-item-card"] }
    ],
    sections: [
      { id: "rc3", name: "hero", selector: ["body > section.hero-section"], style: null, blocks: ["hero-campaign"], defaultContent: [] },
      { id: "rc4", name: "choose-your-pathway", selector: ["body > div.container.my-5"], style: null, blocks: ["cards-pathway"], defaultContent: ["div.container.my-5 .jumbo-heading"] },
      { id: "rc5", name: "explore-our-courses", selector: ["body > section.courses-section"], style: null, blocks: ["cards-studyarea"], defaultContent: ["section.courses-section .jumbo-heading", "section.courses-section .course-search-bar"] },
      { id: "rc6", name: "why-study-at-uc", selector: ["#selling_points_2378666"], style: null, blocks: ["cards-stat"], defaultContent: ["#selling_points_2378666 .selling-point-main"] },
      { id: "rc7", name: "news-and-stories", selector: ["body > section:nth-of-type(3)"], style: "dark-teal", blocks: ["tabs-news", "cards-news"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-campaign": parse,
    "cards-pathway": parse2,
    "cards-studyarea": parse3,
    "cards-stat": parse4,
    "cards-news": parse5,
    "tabs-news": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index";
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
