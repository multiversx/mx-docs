/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl, highlightPanels } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const Panel = ({ details }) => (
      <a
        href={docUrl(details.docName)}
        className="col-12 col-md-6 col-lg-4 mb-4 mb-lg-5"
      >
        <div className="highlightPanel">
          <div className="d-flex flex-row align-items-center mb-2">
            <span className="icon" role="img" aria-label="icon">
              {details.icon}
            </span>
            <h3>{details.title}</h3>
          </div>
          <p>{details.content}</p>
        </div>
      </a>
    );

    const Features = () =>
      highlightPanels.map((panelDetails) => <Panel details={panelDetails} />);

    return (
      <div className="mainContainer landing-page">
        <meta property="og:image" content="/img/share.jpg" />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col text-center title-container mt-5 mt-lg-0">
              <h1 className="m-0 font-montserrat">
                Welcome to the Elrond docs!
                <br />
              </h1>
              <h3 className="m-0 font-montserrat">
                Choose your path you must.
              </h3>
            </div>
          </div>
          <div className="row justify-content-center pt-5">
            <Features siteConfig={siteConfig} />
          </div>
        </div>
      </div>
    );
  }
}

Index.description =
  "A highly scalable, fast and secure blockchain platform for distributed apps, enterprise use cases and the new internet economy.";

module.exports = Index;
