/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl, highlightPanels} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const Panel = ({details}) => (
      <a href={docUrl(details.docName)} className='col-12 col-sm-6 col-sm-4 mb-4'>
        <div className="highlightPanel">
          <div className="d-flex flex-row align-items-center mb-1">
            <img src={`${baseUrl}img/logos/${details.image}`}/>
            <h2>{details.title}</h2>
          </div>
          <p>{details.content}</p>
        </div>
      </a>
    );

    const Features = () => (
      highlightPanels.map((panelDetails) => <Panel details={panelDetails}/>)
    );

    return (
      <div className="mainContainer">
        <div className="container">
          <div className="row">
            <Features siteConfig={siteConfig}/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Index;
