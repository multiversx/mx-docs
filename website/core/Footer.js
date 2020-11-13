/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  render() {
    return (
      <footer className="footer d-flex flex-column align-items-center justify-content-center text-muted">
      <div className="footer-inner">
        <a
          {...{
            target: '_blank',
          }}
          className="d-flex align-items-center"
          href="https://elrond.com/"
        >
          Made with ❤️ by the Elrond team.
        </a>
      </div>
    </footer>
    );
  }
}

module.exports = Footer;