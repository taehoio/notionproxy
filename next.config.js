// @ts-check
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pageIdsThatHaveThumnail = [];

fs.readdirSync('./public/images/thumbnails/pages/').forEach((filename) => {
  pageIdsThatHaveThumnail.push(filename.split('.')[0]);
});

module.exports = withBundleAnalyzer({
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/pages/6ca2dd5e-2214-4873-8ffa-d634d8ebbb53',
      },
    ];
  },
  env: {},
  serverRuntimeConfig: {
    pageIdsThatHaveThumnail,
  },
  publicRuntimeConfig: {
    pageIdsThatHaveThumnail,
  },
});
