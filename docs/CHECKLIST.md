# Launch checklist

Work through this on an **unpublished** theme, using its preview link, before you publish.

## Content and integrity

- [ ] Every placeholder is replaced or removed. Search for "Escribe aquí", "Describe aquí", "Reemplaza", "Beneficio uno", "Alternativa A", "Producto de ejemplo" and "[".
- [ ] Testimonials are real customer quotes, used with permission. "Verified" labels only appear on verified purchases.
- [ ] Comparison rows are accurate and fair to the alternatives.
- [ ] Before/after images and result claims are real and come with any required disclaimer.
- [ ] Countdowns use a real end date for a real promotion.
- [ ] Compare-at prices reflect real previous prices.
- [ ] Delivery estimate days and cutoff hour match your carrier and operations.
- [ ] Policies (refund, shipping, privacy, terms) are published and linked in the footer.

## COD

- [ ] Purchase mode is set (native or COD app) and only one purchase button appears per product.
- [ ] The COD app block or embed is enabled and placed (see [COD-APPS.md](COD-APPS.md)).
- [ ] A test COD order on mobile and desktop records the correct variant, quantity and price.
- [ ] Changing the variant updates the price, image and button, and the COD form picks up the new variant.
- [ ] Your WhatsApp confirmation flow (app or team) works. The theme does not send messages.
- [ ] The WhatsApp link (Theme settings → Social media) opens the right number.

## Storefront

- [ ] Header menus, mobile menu, search, cart drawer (add, change quantity, remove) and cart page work.
- [ ] Collection filtering, sorting and pagination work, with Search & Discovery filters configured.
- [ ] Product templates are assigned to the right products.
- [ ] Anchor navigation links scroll to existing sections.
- [ ] Sticky buy bar appears after scrolling past the buy buttons on mobile.
- [ ] The 404 page, search with no results, empty cart and password page all look right.
- [ ] Contact form submissions arrive in the store email.
- [ ] Newsletter signups appear under Customers with the `newsletter` tag.

## Quality

- [ ] `shopify theme check` reports no errors.
- [ ] Lighthouse (mobile) on home, a product and a collection, run on the preview URL with real content. Targets: Performance ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.
- [ ] Images are uploaded at least 1600px wide (hero 2400px), and every image has alt text.
- [ ] Keyboard-only pass: skip link, menus, drawers (Escape closes), variant picker, accordion, tabs and forms.
- [ ] Screen reader spot check: product title, price changes, cart count.
- [ ] Tested on iOS Safari, Android Chrome, desktop Chrome, Safari and Firefox.

## Publish

- [ ] `develop` is merged into `main`, and the `main` theme preview has been re-checked.
- [ ] Publish manually from **Online Store → Themes**.
- [ ] Place one real COD order after publishing and check it.
