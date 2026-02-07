import { ExtendedRecordMap } from 'notion-types';
import { getPageTitle, getBlockTitle } from 'notion-utils';

export const gaTraceId = 'G-HDWXJVK15N';
export const rootNotionPageId = '6ca2dd5e-2214-4873-8ffa-d634d8ebbb53';

interface PageInfo {
  title: string;
  description: string;
  pageIcon: string;
  titleWithIcon: string;
}

function isEmoji(s: undefined | string): boolean {
  if (!s) {
    return false;
  }
  // https://css-tricks.com/weekly-platform-news-emoji-string-length-issues-with-rounded-buttons-bundled-exchanges/
  return s.length > 0 && s.length <= 7;
}

function isTextType(block: { type: string }) {
  const textTypes: string[] = ['sub_header', 'quote', 'text'];
  if (textTypes.includes(block?.type)) {
    return true;
  }
  return false;
}

export function getPageInfo(recordMap: ExtendedRecordMap): PageInfo {
  const title = getPageTitle(recordMap);

  const descriptionLengthThreshold = 190;
  let description = '';
  let pageIcon = '';

  let isFirstPage = true;

  for (const k in recordMap.block) {
    if (description.length > descriptionLengthThreshold) {
      break;
    }

    const v = recordMap.block[k];
    const block = v.value;

    if (block?.type === 'page' && isFirstPage) {
      isFirstPage = false;

      if (isEmoji(block?.format?.page_icon)) {
        pageIcon = block?.format?.page_icon;
      }
    }

    if (isTextType(block)) {
      const blockTitle = getBlockTitle(block, recordMap);
      if (blockTitle) {
        description += blockTitle;
        if (blockTitle[blockTitle.length - 1] !== '.') {
          description += '.';
        }
        description += ' ';
      }
    }
  }

  return {
    title,
    description,
    pageIcon,
    titleWithIcon: pageIcon ? `${pageIcon} ${title}` : title,
  };
}

function isBitlyUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'bit.ly' || hostname.endsWith('.bit.ly');
  } catch {
    return false;
  }
}

function collectBitlyUrlsFromDecorations(
  decorations: any[][],
  urls: Set<string>,
): void {
  for (const decoration of decorations) {
    if (!Array.isArray(decoration) || decoration.length < 2) continue;
    const subDecorations = decoration[1];
    if (!Array.isArray(subDecorations)) continue;
    for (const sub of subDecorations) {
      if (Array.isArray(sub) && sub[0] === 'a' && isBitlyUrl(sub[1])) {
        urls.add(sub[1]);
      }
    }
  }
}

function replaceBitlyUrlsInDecorations(
  decorations: any[][],
  resolvedMap: Map<string, string>,
): void {
  for (const decoration of decorations) {
    if (!Array.isArray(decoration) || decoration.length < 2) continue;
    const subDecorations = decoration[1];
    if (!Array.isArray(subDecorations)) continue;
    for (const sub of subDecorations) {
      if (Array.isArray(sub) && sub[0] === 'a' && resolvedMap.has(sub[1])) {
        sub[1] = resolvedMap.get(sub[1]) ?? sub[1];
      }
    }
  }
}

async function resolveRedirect(url: string): Promise<string> {
  let currentUrl = url;
  const maxRedirects = 10;
  for (let i = 0; i < maxRedirects; i++) {
    const response = await fetch(currentUrl, {
      method: 'HEAD',
      redirect: 'manual',
    });
    const location = response.headers.get('location');
    if (!location || response.status < 300 || response.status >= 400) {
      return currentUrl;
    }
    currentUrl = new URL(location, currentUrl).href;
  }
  return currentUrl;
}

/**
 * Traverses a Notion recordMap and replaces all bit.ly short links
 * with their resolved destination URLs.
 */
export async function resolveBitlyLinks(
  recordMap: ExtendedRecordMap,
): Promise<void> {
  const bitlyUrls = new Set<string>();

  for (const blockId in recordMap.block) {
    const block = recordMap.block[blockId]?.value;
    if (!block) continue;

    if (block.properties) {
      for (const propKey in block.properties) {
        const prop = block.properties[propKey];
        if (Array.isArray(prop)) {
          collectBitlyUrlsFromDecorations(prop, bitlyUrls);
        }
      }
    }

    const format = block.format as Record<string, any> | undefined;
    if (format) {
      if (isBitlyUrl(format.bookmark_link)) {
        bitlyUrls.add(format.bookmark_link);
      }
      if (isBitlyUrl(format.display_source)) {
        bitlyUrls.add(format.display_source);
      }
    }
  }

  if (bitlyUrls.size === 0) return;

  const resolvedMap = new Map<string, string>();
  await Promise.all(
    Array.from(bitlyUrls).map(async (url) => {
      try {
        const resolved = await resolveRedirect(url);
        if (resolved && resolved !== url) {
          resolvedMap.set(url, resolved);
        }
      } catch {
        // If resolution fails, keep the original URL
      }
    }),
  );

  if (resolvedMap.size === 0) return;

  for (const blockId in recordMap.block) {
    const block = recordMap.block[blockId]?.value;
    if (!block) continue;

    if (block.properties) {
      for (const propKey in block.properties) {
        const prop = block.properties[propKey];
        if (Array.isArray(prop)) {
          replaceBitlyUrlsInDecorations(prop, resolvedMap);
        }
      }
    }

    const format = block.format as Record<string, any> | undefined;
    if (format) {
      if (resolvedMap.has(format.bookmark_link)) {
        format.bookmark_link = resolvedMap.get(format.bookmark_link);
      }
      if (resolvedMap.has(format.display_source)) {
        format.display_source = resolvedMap.get(format.display_source);
      }
    }
  }
}

export function addGoogleAnalyticsScript(gaTraceId: string) {
  return {
    __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${gaTraceId}');
      `,
  };
}
