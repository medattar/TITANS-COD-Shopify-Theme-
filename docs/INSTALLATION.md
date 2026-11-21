# Installation

There are three ways to install the theme. Each one adds it as an **unpublished** theme, so your live store stays unchanged until you click **Publish**.

## Option A: upload the ZIP

1. Download `titans-cod-theme.zip` (built from the `main` branch, see "Building the ZIP" below).
2. In Shopify admin, go to **Online Store → Themes → Add theme → Upload zip file**.
3. Select the ZIP. The theme appears in the theme library as unpublished.
4. Click **Customize** to open the Theme Editor and preview it.

## Option B: GitHub integration (recommended for ongoing work)

1. In Shopify admin, go to **Online Store → Themes → Add theme → Connect from GitHub**.
2. Authorize GitHub and pick `medattar/TITANS-COD-Shopify-Theme-`.
3. Choose the **`develop`** branch for a staging theme, or `main` for the production candidate.
4. Shopify creates an unpublished theme that stays synced with that branch in both directions. Theme Editor changes are committed back to the branch.

See [GITHUB-SYNC.md](GITHUB-SYNC.md) for the branching strategy.

## Option C: Shopify CLI

```bash
shopify theme dev --store your-dev-store.myshopify.com      # local preview with hot reload
shopify theme push --unpublished --store your-store.myshopify.com   # creates a new unpublished theme
```

Do not use `--live` or `--allow-live`.

## Building the ZIP

From the repository root:

```bash
zip -r titans-cod-theme.zip assets blocks config layout locales sections snippets templates
```

Only the theme folders go in the ZIP. Docs and scripts are left out.

## After installing

1. **Theme settings → Logo and favicon**: upload a logo and an inverse logo for dark headers or footers.
2. **Theme settings → Colors**: adjust the six color schemes. Scheme 4 is the brand scheme used by the announcement bar, hero and editorial sections.
3. **Theme settings → Purchase and COD**: pick the purchase mode (see [COD-APPS.md](COD-APPS.md)).
4. **Theme settings → Social media**: add a WhatsApp link (`https://wa.me/52…`). The footer and contact page use it.
5. **Navigation**: the header uses `main-menu` and the footer uses `main-menu` and `footer`.
6. **Products**: assign a product template under **Product → Theme template** (see [TEMPLATES.md](TEMPLATES.md)), and fill in the metafields (see [METAFIELDS.md](METAFIELDS.md)).
7. **Policies**: add your refund, shipping, privacy and terms policies in **Settings → Policies**. The policy pages pick up the styles from **Theme settings → Legal and policy pages**.
8. Replace every placeholder text marked with brackets, "Escribe aquí…", "Describe aquí…" or "Reemplaza…" with real information before publishing.
