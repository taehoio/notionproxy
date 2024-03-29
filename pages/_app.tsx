import React from 'react';

import '../styles/globals.css';

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';

// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-tomorrow.css';

// used for rendering equations (optional)
import 'katex/dist/katex.min.css';

import '../styles/notion-custom.css';

import '../styles/utterances.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
