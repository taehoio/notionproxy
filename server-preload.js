// @ts-check
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */

const serviceName = 'notionProxy';

function setUpGoogleCloudProfiler() {
  require('@google-cloud/profiler').start({
    serviceContext: {
      service: serviceName,
    },
  });
}

function setUpGoogleCloudTracing() {
  const { OCAgentExporter } = require('@opencensus/exporter-ocagent');
  const exporter = new OCAgentExporter({
    serviceName: serviceName,
  });

  const tracing = require('@opencensus/nodejs');
  tracing.start({
    exporter: exporter,
    samplingRate: 1.0,
    logLevel: 1,
  });
}

if (process.env.SHOULD_PROFILE) {
  setUpGoogleCloudProfiler();
}

if (process.env.SHOULD_TRACE) {
  setUpGoogleCloudTracing();
}
