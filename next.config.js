'use strict'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/pages/6ca2dd5e221448738ffad634d8ebbb53',
      }
    ]
  }
})
