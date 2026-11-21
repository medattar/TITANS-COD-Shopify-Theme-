# TITANS COD — Visual design specification

Source of truth: live inspection of beautysleepclub.com (homepage, product page
`/products/sleep-therapy-portable-red-light-device`, `/policies/refund-policy`) on
2026-11-21 via HTML/CSS extraction and browser screenshots at 1024px and 390px.

Only the *design system* (proportions, spacing, type scale, component geometry) is
reproduced. No source code, brand assets, copy or media from the reference are used.

## 1. Design language

Warm "soft neo-brutalist" retail style: cream paper background, near-black plum
ink, solid 2px ink outlines, hard offset shadows (no blur), pill buttons and
badges, one condensed display face for headlines, a serif for editorial H2s and
a geometric sans for everything else.

## 2. Tokens

| Token | Reference value | Theme setting |
| --- | --- | --- |
| Page background | `#FBF8F3` / `#FDF6F1` | Color scheme 1 → Background |
| Ink (text, borders, shadows) | `#1C1517` / `#2E0B12` | Scheme → Text / Border / Shadow |
| Muted text | `#4A3D40` | Scheme → Muted text |
| Primary accent (buttons, sale) | `#8A2A2B` (hover `#6E2122`) | Scheme → Button / Accent |
| Blush | `#F7CDD4` / `#F4BFBE` | Scheme → Highlight |
| Header / footer | `#551B25` with cream text | Color scheme 3 |
| Success dot | `#2FA36B` + 4px 20% halo | Scheme → Success |
| Page width | 1180px, gutters 16px mobile / 32px desktop | Layout → Page width / margins |
| Narrow reading width | 640–760px | Layout → Narrow width |
| Border | 2px solid ink (1.5px on cards) | Borders → Border width |
| Card radius | 18px (22px product cards, 24px hero/final CTA) | Borders → Card radius |
| Hard shadow | `6px 6px 0 ink` (cards 7–8px, hero media 12px) | Shadows → Offset |
| Pill radius | 999px | Buttons → Shape |

## 3. Typography

| Role | Face | Size (mobile → desktop) | Notes |
| --- | --- | --- | --- |
| Display / product H1 | Anton 400 | 36 → 60px, lh .96 | uppercase, ls .005em |
| Hero H1 (home) | Anton 400 | clamp(38px, 10vw, 84px), lh .92 | second line accent colour |
| Editorial H2 | DM Serif Display 400 | 36 → 66px, lh 1, ls -.015em | lower-case copy |
| H3 / card titles | DM Serif Display 400 | 22–28px | |
| Body | DM Sans 400 | 15 → 16–17px, lh 1.45–1.55 | |
| Lead | DM Sans 400 | 17 → 19px, muted | |
| Eyebrow | DM Sans 800 | 12px, ls .14em, uppercase, accent | `✦ 01 · Label ✦` |
| Nav links | DM Sans 800 | 12–12.5px, ls .1–.12em, uppercase | |
| Buttons | DM Sans 800 | 15–16px, ls .05em, uppercase | 16px/32px padding |

## 4. Components

- **Announcement bar** — plum/raspberry strip, 12.5px 800 uppercase, optional
  countdown chips (cream boxes) and blush pill.
- **Header** — 56px mobile / 64px desktop, plum background, centred logo. Desktop:
  left menu, centred logo, right menu + cart. Mobile: bordered 38×34 burger (left),
  logo, bordered cart (right), radius 9px. Cart count = blush bubble.
- **Mobile drawer** — 88vw (max 380px), cream, product shortcut cards (60px
  image, Anton title, small description), serif link list, footer pill.
- **Home hero** — inset rounded card (radius 24px) in raspberry with subtle radial
  highlights, centred blush tag pill, 2-line Anton headline (2nd line blush),
  sub copy, countdown tiles (cream, radius 12, Anton digits), cream pill CTA,
  ✓ trust list.
- **Product grid** — 2 cols mobile (gap 14px) / 4 cols desktop (gap 22px).
  Card: white, 1.5px ink border, radius 22px, square image with bottom border,
  discount pill bottom-right, title 15px/500, promo label 15px/700 accent,
  price 19px/700 + compare 13px struck, full-width accent pill button,
  underlined "See details" link.
- **Product hero** — grid `1.05fr / 1fr`, gap 56px, areas `gal head / gal buy`;
  sticky gallery (top 70px); main media 4:5, 2px border radius 18px; vertical
  thumbnail rail 19% wide, radius 10px, active = ink border. Mobile order:
  head → gallery → buy.
- **Offer stack** — white, 1.5px ink, radius 18px, 14/16px padding. Header label
  12.5px uppercase + discount pill. Rows: 22px check / text / value, 9px padding,
  1px blush divider; first row has 44px product image. "Today" strip: blush bg,
  radius 12, struck compare + 22–24px price + savings pill.
- **Add to cart** — full-width pill, accent fill, 2px ink border, hard shadow,
  uppercase 800 with struck compare price, second line "You save".
- **Guarantee card / testimonial card** — cream, 2px ink, radius 18, hard shadow,
  96px circular icon or 64px avatar.
- **Long-form sections** — 56px / 96px vertical padding, centred eyebrow + serif
  H2 + muted lead, alternating cream / blush backgrounds, cards with hard
  shadows, sticky anchor nav (uppercase 12.5px, active underline 3px accent).
- **Comparison table** — max 900px card, highlighted first column in blush with
  product image, 32px circular ✓ / ✕ marks.
- **Timeline** — dashed connector, 36px numbered dots, milestone pill, serif title.
- **FAQ** — stacked cards (2px, radius 16), 800 weight question, 30px circular
  `+` icon that fills ink when open.
- **Final CTA** — 1000px card, radius 24, 8px shadow, image + text split.
- **Marquee** — blush strip, 2px borders, 32–38px 800 text separated by ✦.
- **Footer** — plum, 3-column (brand 1.6fr), serif tagline 22px, social pills,
  uppercase blush column headings, bottom bar with hairline divider.
- **Policy pages** — 760px container, 48px/72px padding, serif title
  clamp(34px, 8vw, 52px), DM Sans body lh 1.65 in muted plum, `hr` dividers.

## 5. Responsive behaviour

Single breakpoint system: mobile-first, `min-width: 750px` (tablet) and
`min-width: 990px` (desktop, the reference switches at 900px). Mobile-specific
settings exist for headline sizes, paddings, columns and media.

## 6. Unverified / not reproduced

- Reference animations beyond marquee and accordion were not reproduced.
- Exact reference media (photos, videos, logo) is proprietary and not used.
- Judge.me review widgets are app-provided; the theme only renders real review
  data from the standard `reviews.rating` metafield.
