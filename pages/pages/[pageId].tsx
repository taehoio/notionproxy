import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { getPageTitle, getAllPagesInSpace, getBlockTitle } from 'notion-utils';
import { ExtendedRecordMap } from 'notion-types';
import { NotionAPI } from 'notion-client';
import { NotionRenderer } from 'react-notion-x';

import { isDevelopmentEnv } from '../../const';

const notion = new NotionAPI();

export const getStaticProps = async (context) => {
  const pageId = context.params.pageId as string;
  const recordMap = await notion.getPage(pageId);

  return {
    props: {
      recordMap,
    },
    revalidate: 10,
  };
};

export async function getStaticPaths() {
  if (isDevelopmentEnv) {
    return {
      paths: [],
      fallback: true,
    };
  }

  // 'Hello, I'm Taeho.' notion page id.
  const rootNotionPageId = '6ca2dd5e-2214-4873-8ffa-d634d8ebbb53';
  // 'taehoio' notion space id.
  const rootNotionSpaceId = 'f2b37586-33c0-4236-bab4-a87c12f0d6e9';

  // This crawls all public pages starting from the given root page in order
  // for next.js to pre-generate all pages via static site generation (SSG).
  // This is a useful optimization but not necessary; you could just as easily
  // set paths to an empty array to not pre-generate any pages at build time.
  const pages = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    notion.getPage.bind(notion),
    {
      traverseCollections: false,
    },
  );

  const paths = Object.keys(pages).map((pageId) => `/pages/${pageId}`);

  return {
    paths,
    fallback: true,
  };
}

interface PageInfo {
  title: string;
  description: string;
}

function getPageInfo(recordMap: ExtendedRecordMap): PageInfo {
  const title = getPageTitle(recordMap);
  let description = '';

  for (const k in recordMap.block) {
    const v = recordMap.block[k];
    const block = v.value;

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
  };
}

function isTextType(block: { type: string }) {
  const textTypes: string[] = ['sub_header', 'quote', 'text'];
  if (textTypes.includes(block.type)) {
    return true;
  }
  return false;
}

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
      <meta property="og:title" content={pageInfo.title} />
      <meta property="og:description" content={pageInfo.description} />
      {hasThumbnail ? <meta property="og:image" content={imageUrl} /> : null}
      <meta
        name="twitter:card"
        content={hasThumbnail ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:title" content={pageInfo.title} />
      <meta name="twitter:description" content={pageInfo.description} />
      {hasThumbnail ? (
        <meta property="twitter:image" content={imageUrl} />
      ) : null}
      <title>{pageInfo.title}</title>
    </>
  );

  return (
    <>
      <Head children={childrenOfHead} />

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(path) => '/pages/' + path}
      />
    </>
  );
}
