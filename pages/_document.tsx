import * as React from 'react';
import getConfig from 'next/config';
import Document, { Html, Head, Main, NextScript } from 'next/document';

const gaTraceId = getConfig().publicRuntimeConfig.gaTraceId;

export default class MyDocument extends Document {
  addGoogleAnalyticsScript() {
    return {
      __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaTraceId}');
        `,
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaTraceId}`}
          ></script>
          <script dangerouslySetInnerHTML={this.addGoogleAnalyticsScript()} />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Manual graceful shutdowns
if (process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM: ', 'cleaning up');
    process.exit(0);
  });
  process.on('SIGINT', () => {
    console.log('Received SIGINT: ', 'cleaning up');
    process.exit(0);
  });
}
