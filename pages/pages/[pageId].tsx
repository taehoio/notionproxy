import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NotionAPI } from '../../lib/notion-client';
import { NotionRenderer } from 'react-notion-x';
import Link from 'next/link';
import Image from 'next/image';

import {
  addGoogleAnalyticsScript,
  gaTraceId,
  getPageInfo,
  resolveBitlyLinks,
} from '../../lib/notionproxy';
import UtterancesComments from '../../components/UtterancesComments';

import dynamic from 'next/dynamic';
const Code = dynamic(
  () =>
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
  { ssr: false },
);
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection,
  ),
);

const notion = new NotionAPI();

export const getServerSideProps = async (context) => {
  try {
    const pageId = context.params.pageId as string;
    const recordMap = await notion.getPage(pageId);
    await resolveBitlyLinks(recordMap);
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

  const pageIdsThatHaveThumbnail: string[] = JSON.parse(
    process.env.PAGE_IDS_THAT_HAVE_THUMBNAIL || '[]',
  );
  const hasThumbnail: boolean = pageIdsThatHaveThumbnail.includes(
    pageId as string,
  );
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
      <Head children={childrenOfHead} />

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(path: string) => '/pages/' + path}
        isImageZoomable={true}
        components={{
          Collection,
          Code,
          nextLink: Link,
          nextImage: Image,
        }}
      />

      <UtterancesComments
        repo="taehoio/notionproxy-utterances"
        issueTerm="pathname"
        theme="github-dark"
      />
    </>
  );
}

export const config = {
  runtime: 'experimental-edge',
};
