# Metafields

Product templates read per-product content from metafields, so one template can serve many products. Create the definitions under **Settings → Custom data → Products**.

| Namespace and key | Type | Used by | Notes |
| --- | --- | --- | --- |
| `custom.highlights` | List of single line text | Product subtitle block (source: metafield) | Short benefit lines under the title, each with the ✦ marker. |
| `custom.card_label` | Single line text | Product cards | Small label above the card title. Requires **Product cards → Show card label**. |
| `custom.included` | List of single line text | Product details drawer | "Qué incluye" list. |
| `custom.specifications` | Rich text, list of single line text, or multi-line text | Product details drawer | Rich text renders as formatted content, lists render as bullets, and plain text renders as a paragraph. |
| `reviews.rating` | Rating | Product rating block, product cards, Product structured data | Written by reviews apps (Judge.me, Loox, Shopify Product Reviews…). The theme never shows a rating without it. |
| `reviews.rating_count` | Integer | Same as above | Number of reviews. |

## Dynamic sources

Most text settings in product blocks accept dynamic sources. Click the database icon next to a setting in the Theme Editor and pick a metafield. Two examples:

- Badge text → `custom.badge` (create it as single line text) for a per-product eyebrow.
- Guarantee card text → a rich text metafield for per-product guarantee copy.

## Product content that comes from Shopify fields

- Title, description, media, variants, price and compare-at price come from the product itself.
- Savings and discount percentages are calculated from price and compare-at price.
- Stock status uses inventory tracking. Products that don't track inventory always show as available.
