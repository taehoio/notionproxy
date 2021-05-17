import * as React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

import { gaTraceId } from '../const';

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
