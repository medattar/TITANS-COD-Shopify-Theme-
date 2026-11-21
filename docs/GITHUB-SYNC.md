# GitHub ↔ Shopify sync and branching

Repository: `https://github.com/medattar/TITANS-COD-Shopify-Theme-`

## Branches

| Branch | Purpose | Connected Shopify theme |
| --- | --- | --- |
| `main` | Production candidate. Only receives reviewed merges from `develop`. | An unpublished "TITANS – main" theme. You publish it manually once it's verified. |
| `develop` | Integration branch for all theme work | An unpublished "TITANS – staging" theme |
| `feature/*` | Short-lived branches for larger changes | None, or a CLI preview with `shopify theme dev` |

Rules:

- Never force-push `main` or `develop`, and never rewrite shared history.
- Don't commit secrets. `.env*`, `.shopify/` and `config.yml` are git-ignored.
- Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`).

## Workflow

1. Work locally on `develop`, or on a `feature/*` branch that you merge into `develop`.
2. Preview with `shopify theme dev --store <dev-store>`.
3. Run `shopify theme check` and fix anything it reports.
4. Push. The GitHub-connected staging theme updates automatically.
5. QA the staging theme in its preview URL, using the [checklist](CHECKLIST.md).
6. Open a pull request from `develop` to `main` and merge it once QA passes.
7. In Shopify admin, preview the `main` theme and publish it manually. Nothing publishes automatically.

## Theme Editor changes

The GitHub integration commits Theme Editor changes (mostly `config/settings_data.json` and `templates/*.json`) back to the connected branch. Pull before you start local work, so you don't overwrite a merchant's edits:

```bash
git pull origin develop
```

If a merchant edits the live theme directly, pull those changes into the repo the same way, from the branch connected to that theme.

## CLI alternative

```bash
shopify theme pull --theme <theme-id> --store <store>   # bring editor changes down
shopify theme push --unpublished --store <store>        # creates a new unpublished theme
```

Do not pass `--live` or `--allow-live`.
