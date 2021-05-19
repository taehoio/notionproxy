// @ts-check
'use strict';

const isProductionEnv = process.env.NODE_ENV === 'production';

function setUpGoogleCloudProfiler() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@google-cloud/profiler').start({
    serviceContext: {
      service: 'notionproxy',
    },
  });
}

if (isProductionEnv) {
  setUpGoogleCloudProfiler();
}
