// @ts-check
'use strict';

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
  },
};

module.exports = nextConfig;

if (process.env.ANALYZE === 'true') {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });

  module.exports = withBundleAnalyzer(nextConfig);
}
