// @ts-check
'use strict';

function setUpGoogleCloudProfiler() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@google-cloud/profiler').start({
    serviceContext: {
      service: 'notionproxy',
    },
  });
}

if (process.env.SHOULD_PROFILE) {
  setUpGoogleCloudProfiler();
}
