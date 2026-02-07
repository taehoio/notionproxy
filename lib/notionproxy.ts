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
