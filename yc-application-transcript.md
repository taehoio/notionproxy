# Building taeho.io: Notion as a Real-Time Personal Website

## What I Built

**taeho.io** -- a personal website powered entirely by Notion, rendered in real-time on Cloudflare's edge network. Every page is server-side rendered from Notion's unofficial API v3 at request time, so editing a Notion page updates the live site instantly. No static generation, no rebuild step, no CMS.

**Live site**: https://taeho.io

**Stack**: Next.js 15 (Pages Router) + react-notion-x + Cloudflare Pages (edge SSR)

---

## Architecture

```
Notion workspace
    |
    v
Notion API v3 (unofficial /api/v3/loadPageChunk, queryCollection, etc.)
    |
    v
Custom NotionAPI client (lib/notion-client/notion-api.ts, 650 lines)
    |
    v
getServerSideProps on edge runtime (experimental-edge)
    |
    v
react-notion-x renderer -> Browser
```

The core is a custom `NotionAPI` class that talks directly to Notion's internal endpoints using native `fetch()`. It recursively fetches page blocks, eagerly loads all embedded collection (database) data with controlled concurrency, and signs file URLs -- all during SSR on Cloudflare's edge.

---

## Key Technical Decisions and Why

### 1. Unofficial API, not the official Notion API

The official Notion API doesn't expose the block-level data needed for faithful page rendering (toggle blocks, callouts, synced blocks, inline databases, etc.). The internal `/api/v3` endpoints return the full page tree that `react-notion-x` can render pixel-for-pixel. The tradeoff: Notion can change the response format without notice, and they did.

### 2. SSR on every request, no caching

Content freshness matters more than load time for a personal site. Every request hits Notion's API and renders server-side on the edge. This means edits in Notion appear on the live site within seconds. The concurrency-controlled parallel fetching (`pMap` with concurrency=3) keeps response times reasonable even for pages with multiple embedded databases.

### 3. Edge runtime on Cloudflare Pages, not Vercel

Cloudflare Pages gives global edge SSR without cold starts. But it required solving several compatibility issues (detailed below).

---

## Hardest Problems Solved

### Notion API format change (Feb 2026)

Notion silently changed how `queryCollection` returns data. The old format:
```json
{ "block": { "<id>": { "value": {...}, "role": "reader" } } }
```
became:
```json
{ "block": { "<id>": { "spaceId": "...", "value": { "value": {...}, "role": "reader" } } } }
```

The site started returning 500 errors. I wrote `normalizeRecordMap()` to detect the new format (check for `spaceId` at root + nested `value.value`) and unwrap it:

```typescript
function normalizeRecordMap<T extends Record<string, any>>(recordMap: T | undefined): T {
  if (!recordMap) return {} as T;
  const result: any = {};
  for (const [id, entry] of Object.entries(recordMap)) {
    if (entry?.spaceId && entry?.value?.value !== undefined) {
      result[id] = entry.value;  // unwrap new format
    } else {
      result[id] = entry;        // keep old format
    }
  }
  return result;
}
```

This handles both formats simultaneously, so the site won't break if Notion rolls back or has inconsistent responses.

### Next.js 12 -> 15 migration on edge runtime

Upgraded from Next.js 12 to 15.1. Three non-obvious breaks:

1. **ky HTTP client broke**: `ky@0.31` sets a read-only `Request.duplex` property that conflicts with Next.js 15's edge runtime. Replaced with native `fetch()` -- simpler and no dependency.

2. **`publicRuntimeConfig` stopped working**: Returns `undefined` in edge runtime. Moved all runtime config to build-time `env` injection in `next.config.js`.

3. **Prism.js undefined on edge**: The code syntax highlighter references `window`/`global` during SSR. Fixed with `dynamic(() => import(...), { ssr: false })` to load it client-side only.

### Cloudflare Pages build pipeline

Four separate issues to get builds working:

- **pprof native module**: `@google-cloud/profiler` included native binaries that can't compile for Cloudflare. Removed unused dependency.
- **async_hooks resolution**: Old `@cloudflare/next-on-pages@0.10.2` couldn't resolve Node.js built-ins. Upgraded to v1.
- **Yarn version mismatch**: Cloudflare auto-detected Yarn 4 from the environment. Pinned `"packageManager": "yarn@1.22.22"` in package.json.
- **Node.js API access**: Edge runtime doesn't include Node.js APIs by default. Added `nodejs_compat` flag to `wrangler.toml`.

Each of these caused opaque build failures that required reading Cloudflare build logs line by line.

---

## Project Evolution (git log)

```
# Early architecture decisions
91ce0b7 Use getServerSideProps instead of static generation
d043eb5 Remove ISR memory cache
4caf718 Support edge runtime (Cloudflare Workers)
5c9047c Use Playwright for integration tests

# Cloudflare + Next.js 15 migration (Feb 2026)
9972797 Set Node.js 18 for Cloudflare Pages build compatibility
880067e Fix 500 error caused by Notion queryCollection API response format change
92c10b5 Fix 500 error: handle Notion queryCollection API format change (#145)
ee78813 Remove server-preload.js, upgrade Next.js 12 -> 15.1 (#151)
6b6b5d4 Fix Prism undefined error on edge runtime by disabling SSR for Code (#156)
```

The project started as a static-generation Notion site, then evolved to SSR, then to edge SSR on Cloudflare. Each step was motivated by real limitations: ISR cache staleness, cold start latency, and content freshness.

---

## What I'd Build Next

- **Incremental block-level caching**: Cache individual Notion blocks at the edge with short TTLs. Only re-fetch blocks that changed. This would cut API calls by ~80% while keeping content fresh within minutes.
- **Search**: The NotionAPI client already has a `search()` method wired to Notion's `quick_find_public` endpoint. Surface it as a search bar.
- **RSS feed**: Generate from the root page's collection data at request time.

---

## How This Was Built

This transcript was generated with Claude Code analyzing the notionproxy codebase. The codebase itself was built iteratively over multiple sessions -- debugging Cloudflare build failures, reverse-engineering Notion API changes, and migrating major framework versions -- each time shipping fixes within hours of discovering breakage.

The entire site is ~1,200 lines of application code serving a live website from a Notion workspace on a global edge network.
