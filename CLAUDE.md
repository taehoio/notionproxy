# notionproxy

Notion-based personal website (taeho.io) running on Cloudflare Pages with Next.js 12.

## Tech Stack

- **Framework**: Next.js 12 (experimental edge runtime)
- **Rendering**: react-notion-x (Notion unofficial API)
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
- `next.config.js` - Edge runtime (`experimental-edge`), ISR cache disabled.
- `packageManager` in `package.json` - Pins Yarn 1.22.22. Cloudflare auto-detects Yarn 4 without this.

## Project Structure

- `lib/notion-client/notion-api.ts` - Custom Notion API client (unofficial API v3)
- `lib/notionproxy.ts` - Site config (root page ID, GA tracking)
- `pages/index.tsx` - Homepage (SSR, edge runtime)
- `pages/pages/[pageId].tsx` - Dynamic Notion page route
- `server-preload.js` - Dev/start preload (not used in edge runtime)

## Known Issues

- Notion API can silently change response formats. See `normalizeRecordMap()` in `notion-api.ts`.
- `@cloudflare/next-on-pages@pre-v1` is deprecated. Must use v1+.
- Google Cloud deps (profiler/trace-agent) were removed - incompatible with edge runtime.
