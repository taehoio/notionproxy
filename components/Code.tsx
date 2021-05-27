import React from 'react';
import { highlight, languages } from 'prismjs';

import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-http';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-protobuf';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';

export const Code: React.FC<{ code: string; language: string }> = ({
  code,
  language = 'javascript',
}) => {
  const languageL = language.toLowerCase();
  const prismLanguage = languages[languageL] || languages.javascript;
  const html = highlight(code, prismLanguage, language);

  return (
    <pre className={`notion-code language-${languageL}`}>
      <code
        className={`language-${languageL}`}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </pre>
  );
};
