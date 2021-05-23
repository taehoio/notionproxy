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

function setUpGoogleCloudTracing() {
  require('@google-cloud/trace-agent').start();
}

if (process.env.SHOULD_PROFILE) {
  setUpGoogleCloudProfiler();
}

if (process.env.SHOULD_TRACE) {
  setUpGoogleCloudTracing();
}
