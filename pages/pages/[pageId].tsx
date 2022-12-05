import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { getPageTitle, getAllPagesInSpace, getBlockTitle } from 'notion-utils';
import { ExtendedRecordMap } from 'notion-types';
import { NotionAPI } from 'notion-client';
import { NotionRenderer } from 'react-notion-x';
import Image from 'next/image';
import Link from 'next/link';

import dynamic from 'next/dynamic';
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    await Promise.all([
      import('prismjs/components/prism-bash'),
      import('prismjs/components/prism-css'),
      import('prismjs/components/prism-docker'),
      import('prismjs/components/prism-go'),
      import('prismjs/components/prism-http'),
      import('prismjs/components/prism-java'),
      import('prismjs/components/prism-javascript'),
      import('prismjs/components/prism-json'),
      import('prismjs/components/prism-jsx'),
      import('prismjs/components/prism-makefile'),
      import('prismjs/components/prism-markdown'),
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-protobuf'),
      import('prismjs/components/prism-python'),
      import('prismjs/components/prism-sql'),
      import('prismjs/components/prism-tsx'),
      import('prismjs/components/prism-typescript'),
      import('prismjs/components/prism-yaml'),
    ]);
    return m.Code as any;
  }),
);
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection,
  ),
);

import UtterancesComments from '../../components/UtterancesComments';

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
  if (process.env.NODE_ENV !== 'production') {
    return {
      paths: [],
      fallback: true,
    };
  }

  const { publicRuntimeConfig } = getConfig();

  // This crawls all public pages starting from the given root page in order
  // for next.js to pre-generate all pages via static site generation (SSG).
  // This is a useful optimization but not necessary; you could just as easily
  // set paths to an empty array to not pre-generate any pages at build time.
  const pages = await getAllPagesInSpace(
    publicRuntimeConfig.rootNotionPageId,
    publicRuntimeConfig.rootNotionSpaceId,
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

function getPageInfo(recordMap: ExtendedRecordMap): PageInfo {
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

function isTextType(block: { type: string }) {
  const textTypes: string[] = ['sub_header', 'quote', 'text'];
  if (textTypes.includes(block?.type)) {
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
    </>
  );

  return (
    <>
      <Head children={childrenOfHead} />

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(path: string) => '/pages/' + path}
        isImageZoomable={true}
        previewImages={true}
        components={{
          nextImage: Image,
          nextLink: Link,
          Collection,
          Code,
        }}
      />

      {pageId !== publicRuntimeConfig.rootNotionPageId && (
        <UtterancesComments
          repo="taehoio/notionproxy-utterances"
          issueTerm="pathname"
          theme="github-dark"
        />
      )}
    </>
  );
}
