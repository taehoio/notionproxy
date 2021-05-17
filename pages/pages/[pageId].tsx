import React from 'react';
import Head from 'next/head';

import { getPageTitle, getAllPagesInSpace, getBlockTitle } from 'notion-utils';
import { ExtendedRecordMap } from 'notion-types';
import { NotionAPI } from 'notion-client';
import { NotionRenderer } from 'react-notion-x';

const isDevelopmentEnv =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

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
  const rootNotionPageId = '6ca2dd5e221448738ffad634d8ebbb53';
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
  imageUrl: string;
}

function getPageInfo(recordMap: ExtendedRecordMap): PageInfo {
  const title = getPageTitle(recordMap);
  let description = '';
  let imageUrl = '';

  console.log(recordMap);
  for (const k in recordMap.block) {
    const v = recordMap.block[k];
    const block = v.value;

    if (isTextType(block)) {
      const blockTitle = getBlockTitle(block, recordMap);
      console.log(blockTitle);
      if (blockTitle) {
        description += blockTitle + ' \n';
      }
    }

    if (isImageType(block)) {
      if (!imageUrl) {
        imageUrl = block?.properties?.source?.flat()[0];
      }
    }
  }

  return {
    title,
    description,
    imageUrl,
  };
}

function isTextType(block: { type: string }) {
  const textTypes: string[] = ['sub_header', 'quote', 'text'];
  if (textTypes.includes(block.type)) {
    return true;
  }
  return false;
}

function isImageType(block: { type: string }) {
  const imageTypes: string[] = ['image'];
  if (imageTypes.includes(block.type)) {
    return true;
  }
  return false;
}

export default function NotionPage({ recordMap }) {
  if (!recordMap) {
    return null;
  }

  const pageInfo = getPageInfo(recordMap);
  console.log(pageInfo);

  return (
    <>
      <Head>
        <meta name="author" content="Taeho Kim" />
        <meta name="description" content={pageInfo.description} />
        <meta property="og:title" content={pageInfo.title} />
        <meta property="og:description" content={pageInfo.description} />
        <meta property="og:image" content={pageInfo.imageUrl} />
        <title>{pageInfo.title}</title>
      </Head>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(path) => '/pages/' + path}
      />
    </>
  );
}
