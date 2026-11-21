# TITANS COD Shopify Theme

A Shopify Online Store 2.0 theme for cash-on-delivery (COD) stores in Mexico. It is mobile-first and built from theme blocks. It works with COD form apps such as EasySell and Releasit and keeps a native Shopify purchase fallback.

All default storefront copy is Mexican Spanish. The Theme Editor labels are in English.

## What's included

| Area | Contents |
| --- | --- |
| Layouts | `theme.liquid`, `password.liquid` |
| Global | Announcement bar, header (dropdown menus, mobile drawer menu, search modal), footer, cart drawer, six color schemes, full typography, button, card and policy page settings |
| Product page | `main-product` section built from 30+ theme blocks: title, subtitle/highlights, price, rating (real data only), stock status, details drawer, offer stack, variant picker (buttons, dropdown, cards, swatches), quantity, delivery estimate, buy buttons (native or COD app mode), COD notices, guarantee, testimonial, video strip, tabs, accordion, trust badges, payment methods, sticky buy bar |
| Long-form sections | Anchor navigation, editorial hero, content cards, comparison table, image with text, before/after, timeline, steps (incl. "COD: How it works" preset), FAQ (with FAQPage structured data), final CTA, scrolling text, testimonials, video reels, icon grid (benefits / what's included / trust bar presets), rich text / disclaimer, featured product, product recommendations, custom Liquid |
| Templates | Home, product (+ `cod-landing`, `cod-minimal`, `cod-video`, `cod-offer`), collection (filters, sorting, pagination), list collections, cart, search, page, `page.contact`, `page.about`, blog, article, 404, password, gift card |
| Locales | `en.default.json`, `es.json` |

## Quick start

```bash
# Preview against a development store (requires Shopify CLI and store access)
shopify theme dev --store your-dev-store.myshopify.com

# Lint
shopify theme check
```

Never run `shopify theme push --live` or `--allow-live` against a store's published theme. Push to an unpublished theme and preview it first (see [docs/GITHUB-SYNC.md](docs/GITHUB-SYNC.md)).

## Documentation

- [Installation](docs/INSTALLATION.md)
- [Theme Editor guide](docs/THEME-EDITOR-GUIDE.md)
- [Product templates](docs/TEMPLATES.md)
- [Metafields](docs/METAFIELDS.md)
- [COD apps: EasySell and Releasit](docs/COD-APPS.md)
- [GitHub ↔ Shopify sync and branching](docs/GITHUB-SYNC.md)
- [QA report](docs/QA-REPORT.md)
- [Launch checklist](docs/CHECKLIST.md)
- [Design spec](docs/DESIGN-SPEC.md)

## Integrity rules built into the theme

- Ratings and review counts only render from real review data (`reviews.rating` / `reviews.rating_count` metafields written by a reviews app).
- Discount labels and savings are calculated from the real price and compare-at price. The theme never invents a discount.
- Stock messages use real inventory. The low-stock message is off by default (threshold 0).
- Countdowns only show when the merchant sets an end date, and they hide when it passes.
- Testimonial blocks render nothing until a real quote is entered.
- Money is always formatted with the store currency settings. No currency symbol is hardcoded.
- The theme never sends WhatsApp messages. COD notices only explain the process, and confirmation messages come from your COD app or order workflow.

## Repository layout

```
assets/     CSS and JavaScript (no build step)
blocks/     Theme blocks (product blocks and general-purpose blocks)
config/     settings_schema.json, settings_data.json
layout/     theme.liquid, password.liquid
locales/    en.default.json, es.json
sections/   Sections and section groups (header-group.json, footer-group.json)
snippets/   Shared snippets
templates/  JSON templates and gift_card.liquid
docs/       Documentation (ignored by Shopify, see .shopifyignore)
scripts/    Maintenance scripts (ignored by Shopify)
```

`scripts/expand-icon-options.py` expands the `__ICON_OPTIONS__` placeholder in schemas into the full icon list. Run it after adding a block or section that uses the placeholder.
