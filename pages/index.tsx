import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { NotionAPI } from '../lib/notion-client';
import { NotionRenderer } from 'react-notion-x';
import Link from 'next/link';
import Image from 'next/image';

import {
  addGoogleAnalyticsScript,
  gaTraceId,
  getPageInfo,
  rootNotionPageId,
} from '../lib/notionproxy';

import dynamic from 'next/dynamic';
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection,
  ),
);

const notion = new NotionAPI();

export const getServerSideProps = async () => {
  try {
    const recordMap = await notion.getPage(rootNotionPageId);
    return {
      props: {
        recordMap,
      },
    };
  } catch (err) {
    if (
      err.message?.startsWith('Notion page not found') ||
      err.message?.startsWith('invalid notion pageId')
    ) {
      return {
        notFound: true,
      };
    }
    throw err;
  }
};

export default function NotionPage({ recordMap }) {
  if (!recordMap) {
    return null;
  }

  const router = useRouter();
  const { pageId } = router.query;

  const { publicRuntimeConfig } = getConfig();
  const hasThumbnail: boolean =
    publicRuntimeConfig?.pageIdsThatHaveThumnail?.includes(pageId);
  const imageUrl = `https://taeho.io/images/thumbnails/pages/${pageId}.png`;

  const pageInfo = getPageInfo(recordMap);

  const childrenOfHead = (
    <>
      <title>{`${pageInfo.title} | TAEHO.IO`}</title>
      <meta property="og:title" content={pageInfo.titleWithIcon} />
      <meta property="og:description" content={pageInfo.description} />
      {hasThumbnail && <meta property="og:image" content={imageUrl} />}
      <meta
        name="twitter:card"
        content={hasThumbnail ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:title" content={pageInfo.titleWithIcon} />
      <meta name="twitter:description" content={pageInfo.description} />
      {hasThumbnail && <meta property="twitter:image" content={imageUrl} />}

      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTraceId}`}
      ></script>
      <script dangerouslySetInnerHTML={addGoogleAnalyticsScript(gaTraceId)} />
    </>
  );

  return (
    <>
      <Head>{childrenOfHead}</Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(path: string) => '/pages/' + path}
        isImageZoomable={true}
        components={{
          Collection,
          nextLink: Link,
          nextImage: Image,
        }}
      />
    </>
  );
}

export const config = {
  runtime: 'experimental-edge',
};
