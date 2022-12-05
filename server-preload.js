// @ts-check
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

const serviceName = 'notionproxy';

function setUpGoogleCloudProfiler() {
  require('@google-cloud/profiler').start({
    serviceContext: {
      service: serviceName,
    },
  });
}

function setUpGoogleCloudTrace() {
  require('@google-cloud/trace-agent').start();
}

if (process.env.SHOULD_PROFILE) {
  setUpGoogleCloudProfiler();
}

if (process.env.SHOULD_TRACE) {
  setUpGoogleCloudTrace();
}

// Avoid 'Error: socket hang up' on CloudRun
// https://github.com/request/request/issues/2047#issuecomment-532753784
const https = require('https');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
https.globalAgent = new HttpsAgent({
  freeSocketTimeout: 4000,
});
