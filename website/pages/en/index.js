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
      <a href={docUrl(details.docName)} className='col-12 col-md-6 col-lg-4 mb-4 mb-lg-5'>
        <div className="highlightPanel">
          <div className="d-flex flex-row align-items-center mb-2">
            <span className="icon" role="img" aria-label="icon">{details.icon}</span>
            <h3>{details.title}</h3>
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
          <div className="row justify-content-center">
            <div className="col col-lg-68 text-center">
              <h1 className="m-0 font-montserrat">
                Welcome to the Elrond docs!<br/>Choose your path you must. <img src="https://emoji.slack-edge.com/TA53T6X71/yoda/6dababa51d56febe.png" style={{marginBottom: "-7px",}}/>
              </h1>
            </div>
          </div>
          <div className="row justify-content-center pt-5">
            <Features siteConfig={siteConfig}/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Index;
