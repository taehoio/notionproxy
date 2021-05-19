// @ts-check
'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
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
});
