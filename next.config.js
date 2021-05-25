// @ts-check
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const pageIdsThatHaveThumnail = [];

fs.readdirSync('./public/images/thumbnails/pages/').forEach((filename) => {
  pageIdsThatHaveThumnail.push(filename.split('.')[0]);
});

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/pages/6ca2dd5e-2214-4873-8ffa-d634d8ebbb53',
      },
    ];
  },
  env: {},
  publicRuntimeConfig: {
    rootNotionPageId: '6ca2dd5e-2214-4873-8ffa-d634d8ebbb53',
    rootNotionSpaceId: 'f2b37586-33c0-4236-bab4-a87c12f0d6e9',
    gaTraceId: 'G-HDWXJVK15N',
    pageIdsThatHaveThumnail,
  },
};

module.exports = nextConfig;

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  module.exports = withBundleAnalyzer(nextConfig);
}
