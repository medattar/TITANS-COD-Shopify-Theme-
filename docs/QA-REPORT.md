# QA report

Date: 2026-11-21 · Branch: `develop`

This report separates what was **verified** from what is **not verified yet**. No Shopify store was connected during development, so nothing here was checked on a live storefront.

## Verified

| Check | Result | How |
| --- | --- | --- |
| Shopify Theme Check (`theme-check:recommended`, all checks including translations) | **0 errors, 0 warnings** | `shopify theme check` (Theme Check bundled with Shopify CLI 5.0.2) |
| JSON templates and section groups against the section and block schemas (block types, setting ids, select values, ranges, booleans, block order) | **No mismatches** | Custom validator script (not committed) |
| JavaScript syntax (`theme.js`, `product.js`, `facets.js`) | **Pass** | `node --check` |
| Locale coverage: every `'key' \| t` used in Liquid exists in `en.default.json` and `es.json` | **Pass** (139 keys) | Theme Check `TranslationKeyExists` |
| Secrets scan of tracked files | **None found** | `git ls-files` plus a grep for tokens and keys |
| Manual code review (logic, accessibility, COD compatibility, integrity rules) | **21 findings, all fixed** | See below |

## Code review findings and fixes

| Severity | Finding | Fix |
| --- | --- | --- |
| Critical | On non-product pages, a featured product's variant re-render fetched the page path, where `?variant=` is ignored. The default variant's markup came back while the selected variant was in the form. | It now re-renders against the product URL. |
| High | The sticky anchor nav could not stick, because its section wrapper was only as tall as the nav. | The section wrapper is now sticky (`.section-anchor-nav:has(.anchor-nav--sticky)`). |
| High | Gallery thumbnails had `role="listitem"` on `<button>`, which overrode the button role. | Role removed. The gallery now has `role="region"`, and the track is focusable for arrow-key navigation. |
| Medium | The price filter broke with comma-decimal currency formats. | Values are now `cents / 100`, with `step="any"`. |
| Medium | Filter values were not escaped in attributes. | Now `\| escape`. |
| Medium | Filter responses could arrive out of order. | `AbortController` cancels stale requests. |
| Medium | Cart quantity edits shared one debounce, and quick removals could target the wrong line. | Debounce is now per line, changes are keyed by line item key, and requests run in a queue. |
| Medium | Keyboard focus was lost after cart re-renders. | Focus is restored to the same control, or to the drawer close button if the line is gone. |
| Medium | Card quick add bypassed COD app mode. | In app mode, quick add becomes a product link. |
| Medium | In app mode, pressing Enter added to the native cart, and `product.js` could load twice. | Implicit submits are blocked in app mode, and the script has a single-load guard. |
| Medium | Anchor nav links weren't converted with `handle`, so they didn't match section ids. | Now uses `\| handle`. |
| Medium | Comparison values could land in the wrong column when a middle column was blank, and yes/no matching was case-sensitive. | Each cell maps to its own column, and matching is case-insensitive. |
| Medium | Autoplay videos had no pause control, and with reduced motion they were a dead player. | Added a pause/play toggle, and reduced motion shows native controls. |
| Low | An unavailable option combination left the old price and an active express checkout. | The prices are dimmed and express checkout is disabled. |
| Low | The cart page re-render wiped unsaved notes and express checkout buttons. | Only the line items and totals re-render now. |
| Low | Line item properties weren't escaped. | Escaped. |
| Low | The countdown end time depended on the visitor's timezone. | It now uses the store's UTC offset. |
| Low | `aria-label` was set on an element with no role (cart count badge). | Replaced with visually hidden text. |
| Low | Testimonial `figcaption` wasn't a direct child of its `figure`. | Changed to `div` markup. |
| Low | Sale prices had no screen-reader context. | Added visually hidden "Precio de oferta" and "Precio regular" labels. |
| Low | Swatch filter layout was missing, and the marquee had no keyboard pause. | Added swatch grid CSS and a pause on `:focus-within`. |

## Not verified yet (needs a development store)

| Item | Why it's not verified | How to verify |
| --- | --- | --- |
| Rendering of every template and section on a real storefront | No store connected | `shopify theme dev --store <dev-store>` and click through using [CHECKLIST.md](CHECKLIST.md) |
| Theme Editor behavior (presets, static product header, nested blocks, dynamic sources) | No store connected | Open the Theme Editor on an unpublished theme |
| EasySell integration | App not installed | Follow [COD-APPS.md](COD-APPS.md) on a development store |
| Releasit integration | App not installed | Same as above |
| Cart drawer, cart page, filters, recommendations and the Section Rendering API calls | Need a live store | Run the storefront tests in the checklist |
| Lighthouse, Core Web Vitals (LCP, CLS, INP) | **Not measured.** No scores are reported or claimed. | Run Lighthouse (mobile) on the preview URL with real content and images |
| Cross-browser and device testing | Not run | iOS Safari, Android Chrome, desktop Chrome, Safari and Firefox |
| Screen-reader testing | Not run | VoiceOver and NVDA spot checks |
| Visual comparison with the reference design | Not run on a storefront | Compare side by side once previewed |

## Performance measures built in (not a measurement)

- No framework and no build step. Total JS is about 12 KB gzipped (`theme.js` about 7 KB, plus `product.js` about 4 KB only on product pages and `facets.js` about 1 KB only on collection and search pages). All of it is `defer`.
- Render-blocking CSS is limited to `base.css` (about 11 KB gzipped). Section CSS (`section-main-product`, `section-longform`, `section-pages`, `section-hero`) only loads where it's used.
- The first-section hero image and the first product image load eagerly with `fetchpriority="high"`. Everything else lazy loads, with `srcset` and `sizes`.
- Media has explicit dimensions or aspect ratios to prevent layout shift.
- Videos load `preload="none"` and only play while visible. External videos are deferred until clicked.
- Fonts come from the Shopify font library with `preload` for body and display fonts and `font-display: swap`.
- Recommendations load lazily when they come close to the viewport.
