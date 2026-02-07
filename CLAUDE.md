# notionproxy

Notion-based personal website (taeho.io) running on Cloudflare Pages with Next.js 15.

## Tech Stack

- **Framework**: Next.js 15.1 (Pages Router, experimental-edge runtime)
- **Rendering**: react-notion-x (Notion unofficial API)
- **HTTP**: Native `fetch()` (replaced ky)
- **Deployment**: Cloudflare Pages
- **Package Manager**: Yarn 1.22.22 (pinned via `packageManager` field)
- **Node.js**: >= 18

## Build & Deploy

```bash
# Local dev
yarn dev

# Next.js build
yarn build

# Cloudflare Pages build (used in CI/CD)
npx @cloudflare/next-on-pages@1
```

Cloudflare Pages build command: `npx @cloudflare/next-on-pages@1`
Build output directory: `.vercel/output/static`

## Key Configuration

- `wrangler.toml` - Cloudflare Pages config. `nodejs_compat` flag is required.
- `next.config.js` - Build-time env for thumbnail page IDs. Edge runtime is per-page (`experimental-edge`).
- `packageManager` in `package.json` - Pins Yarn 1.22.22. Cloudflare auto-detects Yarn 4 without this.

## Project Structure

- `lib/notion-client/notion-api.ts` - Custom Notion API client (unofficial API v3, uses native fetch)
- `lib/notionproxy.ts` - Site config (root page ID, GA tracking)
- `pages/index.tsx` - Homepage (SSR, edge runtime)
- `pages/pages/[pageId].tsx` - Dynamic Notion page route

## Known Issues

- Notion API can silently change response formats. See `normalizeRecordMap()` in `notion-api.ts`.
- Pages Router still requires `experimental-edge` runtime config (not `edge`).
- `publicRuntimeConfig` doesn't work in Next.js 15 edge runtime; use `env` in next.config.js instead.
