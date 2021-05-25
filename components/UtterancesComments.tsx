// utterances comments
// https://www.vincentntang.com/installing-gatsbyjs-blog-comments/

import React, { Component } from 'react';

interface UtterancesProps {
  repo: string;
  issueTerm: string;
  theme: string;
}

export default class UtterancesComments extends Component<UtterancesProps> {
  commentBox: React.RefObject<HTMLDivElement>;

  constructor(props: UtterancesProps | Readonly<UtterancesProps>) {
    super(props);
    this.commentBox = React.createRef(); // Creates a reference to inject the <script> element
  }

  componentDidMount() {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute('repo', this.props.repo);
    scriptEl.setAttribute('issue-term', this.props.issueTerm);
    scriptEl.setAttribute('theme', this.props.theme);
    this.commentBox.current.appendChild(scriptEl);
  }

  render() {
    return (
      <div className="comment-box-wrapper container">
        <div ref={this.commentBox} className="comment-box" />
      </div>
    );
  }
}
