# Theme Editor guide

## Theme settings

| Group | What you control |
| --- | --- |
| Logo and favicon | Logo, inverse logo (for dark headers and footers), widths, favicon |
| Colors | Six color schemes. Each has background, gradient, surface and surface text (cards), highlight and highlight text (pills, highlighted columns), text, heading, muted, accent and on-accent, buttons, borders, shadow, price colors, badge and success. Also the page, drawer and policy page schemes. |
| Typography | Display, heading and body fonts; sizes per heading level for desktop and mobile; line height; letter spacing; uppercase options; eyebrow style |
| Text effects | Accent word style (`<em>` in headings: color, italic, highlight, underline, outline, gradient), reveal-on-scroll animations, hover effects |
| Layout | Page width, narrow width, margins, grid gaps |
| Borders and shadows | Border width, corner radius for cards, media and inputs, shadow style (hard offset, soft or none) |
| Buttons | Shape, radius, border, font, size, weight, case, padding, shadow, hover style |
| Badges | Shape, size, case, sale badge format |
| Product cards | Style, border, radius, color scheme, image ratio and fit, second image on hover, alignment, sizes, vendor, label, rating, badge, card action, button label |
| Icons | Stroke width, default size |
| Purchase and COD | Purchase mode (native or COD app), dynamic checkout buttons, sticky buy bar |
| Cart | Drawer or page, cart note, empty cart collection, trust text |
| Legal and policy pages | Color scheme, width, spacing, title font and sizes, body size, line height, dividers |
| Social media | Instagram, Facebook, TikTok, YouTube, WhatsApp, Pinterest, X |

## Highlighting words in headings

Wrap words in italics in any rich heading field. They then pick up the accent style set in **Theme settings → Text effects**. For example: "Duerme *mejor* cada noche".

## Sections and blocks

- **Sections** can be added to any JSON template with **Add section**. Each has its own color scheme, spacing (desktop and mobile), and usually an anchor ID.
- **Theme blocks** (product section, featured product, groups, tabs) can be nested. Use the **Group** block, with its Row and Card presets, to place blocks side by side or inside a styled card.
- **App blocks** can go in the product section, the featured product section, groups and the product header.
- **Hide on** (group block) shows a group only on mobile or only on desktop.

## Product section settings

- Layout: column ratio, gap, sticky gallery, mobile order (title first or gallery first).
- Media: thumbnail position (left rail, bottom row, or arrows only), rail width, mobile thumbnails, aspect ratio, fit, radius, border, shadow, video autoplay and loop.
- Sticky buy bar: on or off, desktop, image, button label.
- Variant behavior: update the URL on variant change.

## Placeholders and empty states

Blocks that need real data stay hidden until the data exists. These include the rating, the testimonial quote, the countdown date, and highlights from metafields. Some of them show a hint only inside the Theme Editor.
