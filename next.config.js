// @ts-check
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const pageIdsThatHaveThumnail = [];

fs.readdirSync('./public/images/thumbnails/pages/').forEach((filename) => {
  pageIdsThatHaveThumnail.push(filename.split('.')[0]);
});

const nextConfig = {
  env: {
    PAGE_IDS_THAT_HAVE_THUMBNAIL: JSON.stringify(pageIdsThatHaveThumnail),
  },
};

module.exports = nextConfig;

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  module.exports = withBundleAnalyzer(nextConfig);
}
