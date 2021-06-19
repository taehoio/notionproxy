import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';

const notion = new NotionAPI();

function getPageCoverImageUrl(
  pageId: string,
  recordMap: ExtendedRecordMap,
): string | null {
  let pageCover: string | null = null;

  for (const k in recordMap.block) {
    const v = recordMap.block[k];
    const block = v.value;

    if (block?.type === 'page') {
      pageCover = block?.format?.page_cover;

      break;
    }
  }

  if (!pageCover) {
    return null;
  }

  return `https://www.notion.so/image/${encodeURIComponent(pageCover)}?table=block&id=${pageId}`;
}

export default async function handler(req, resp) {
  const { pageId } = req.query;
  let recordMap = null;

  try {
    recordMap = await notion.getPage(pageId);
  } catch (e) {
    return resp.status(404).json({ message: 'notion page not found' });
  }

  const pageCoverImageUrl = getPageCoverImageUrl(pageId, recordMap);

  if (!pageCoverImageUrl) {
    return resp.status(404).json({ message: 'image not found' });
  }

  const pageCoverImageResp = await fetch(pageCoverImageUrl);

  const contentTypeHeaderKey = 'content-type';
  const contentTypeHeaderValue =
    pageCoverImageResp.headers.get(contentTypeHeaderKey);

  return resp
    .status(pageCoverImageResp.status)
    .setHeader(contentTypeHeaderKey, contentTypeHeaderValue)
    .send(pageCoverImageResp.body);
}
