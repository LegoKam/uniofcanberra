I'll explore the project structure to understand what's there before drafting a plan.Let me look for a page-templates file and examine the existing content and blocks.No page-templates.json exists yet. Let me examine the content files to understand the page structure.This is a fresh AEM boilerplate migration project for "uniofcanberra" — the content directory only has default boilerplate pages, and no page-templates.json or scraped source pages exist yet. To draft a useful plan, I need to know what you want analyzed.# University of Canberra — Migration Scope & Template Analysis Plan

## Goal
Analyze the University of Canberra website (`https://www.canberra.edu.au`) to discover its page-template structure, catalog the blocks it needs, and identify reusable content patterns — producing a full migration scope report to drive the AEM Edge Delivery Services migration for the `uniofcanberra` site.

## Context (what exists today)
- This repo is a fresh AEM boilerplate fork configured for the `uniofcanberra` site (`.migration/project.json`, `migration-work/profile.json`).
- Blocks present: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget` (all boilerplate defaults).
- `content/` holds only default boilerplate pages (`index`, `nav`, `footer`) — no real UC content yet.
- No `page-templates.json`, no scraped source pages, no import infrastructure exist yet.
- Source website to analyze: **https://www.canberra.edu.au**

## Approach
Run a full site-scope analysis: discover URLs across the site, sample representative pages, group them into templates by structural similarity, inventory the blocks each template needs (mapping DOM sections to existing/new block variants), and summarize migration effort in a scope report.

## Checklist
- [ ] Confirm crawl entry point and depth for `https://www.canberra.edu.au` (sitemap vs. crawl)
- [ ] Discover the full URL inventory for the site (via sitemap or crawling)
- [ ] Select a representative sample of pages spanning likely page types (home, landing, course/program, article/news, contact, listing, etc.)
- [ ] Scrape sampled pages (content, metadata, images, cleaned HTML) into migration artifacts
- [ ] Analyze each sampled page's section/sequence structure
- [ ] Group structurally-similar pages into page templates and name each template
- [ ] Produce/update `page-templates.json` with template names, member URLs, and descriptions
- [ ] Inventory required blocks per template; map DOM sections to existing blocks vs. new variants
- [ ] Identify reusable cross-template patterns (hero, cards, columns, nav, footer, listings, CTAs)
- [ ] Flag gaps where boilerplate blocks don't cover UC's patterns (new blocks/variants needed)
- [ ] Compile a migration scope report (template count, block reuse %, new-block effort, risks)
- [ ] Review findings with you and decide next migration steps

## Deliverables
- URL inventory for the site
- Scraped page artifacts (JSON, screenshots, cleaned HTML) for sampled pages
- `page-templates.json` — discovered templates with member URLs and descriptions
- Block inventory + per-template block mapping (reuse vs. new)
- Reusable-pattern summary
- Migration scope / effort report

## Notes
- This is an analysis-only plan — no blocks or content are modified. It produces artifacts and a report to inform the actual migration.
- Executing this analysis (URL discovery, scraping, artifact generation) requires **Execute mode**; plan mode cannot perform those steps.

Once you approve, switch to Execute mode and I'll begin with URL discovery and page sampling.
