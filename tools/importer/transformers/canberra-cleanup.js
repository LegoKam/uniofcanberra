/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: University of Canberra (canberra.edu.au) site-wide cleanup.
 *
 * Removes non-authorable global chrome and tracking so the import contains
 * only page-level authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html for
 * the homepage. Do not guess selectors.
 *
 *   line 4     <header class="page-header">        -> global header (handled separately)
 *   line 11    a.ucweb-common-header-skipnav       -> skip-navigation link (inside header)
 *   line 433   <div id="skip-navigation">          -> skip-nav anchor target (inside header)
 *   line 439   <div id="style_2378656">            -> empty style placeholder
 *   line 847   <div id="script_2378678">           -> empty script placeholder
 *   line 849   <footer class="page-footer">        -> global footer (handled separately)
 *   line 1055  iframe pixel.everesttech.net        -> analytics tracking iframe
 *   line 1057  iframe #destination_publishing_...  -> Adobe demdex ID-sync iframe
 *   line 1059  img pixel.everesttech.net/t         -> analytics tracking pixel
 *   line 1060  img cm.everesttech.net/cm           -> analytics tracking pixel
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Empty layout placeholder nodes carry no authorable content and can
    // interfere with section boundaries. Remove before block parsing.
    // Verified in cleaned.html: #style_2378656 (line 439), #script_2378678 (line 847).
    WebImporter.DOMUtils.remove(element, [
      '#style_2378656',
      '#script_2378678',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome (header/footer handled by separate migration) and
    // analytics/tracking artifacts. Verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      'header.page-header',
      'footer.page-footer',
      '#skip-navigation',
      'a.ucweb-common-header-skipnav',
      'iframe',
      'img[src*="everesttech.net"]',
      'img[src*="demdex.net"]',
      'link',
      'noscript',
    ]);
  }
}
