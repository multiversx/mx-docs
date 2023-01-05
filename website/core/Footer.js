/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

export default function CustomFooter() {
  {
    /* Since there's no React runtime shipped to clients, the event handlers would not work, hence we have to do this */
  }
  const menuDropdown = `
		var dropdown = document.getElementById("app-switcher-dropdown");
		if (dropdown) {
			var dropdownIcon = dropdown.querySelector(".app-switcher-icon");
			var dropdownMenu = dropdown.querySelector(".app-switcher-dropdown");
			if (dropdownIcon && dropdownIcon) {
				dropdownIcon.onclick = function(event) {
					if (dropdownMenu.classList.contains("show")) {
						dropdownMenu.classList.remove("show");
						dropdownIcon.classList.remove("active");
					} else {
						dropdownMenu.classList.add("show");
						dropdownIcon.classList.add("active");
					}
				}
				window.onclick = function(event) {
					if (event.target !== dropdownIcon) {
						dropdownMenu.classList.remove("show");
						dropdownIcon.classList.remove("active");
					}
				}
			}
		}
		var goBackButton = document.getElementById("go-back");
		if (goBackButton) {
			goBackButton.onclick = function(event) {
				if (document.referrer.indexOf(window.location.host) !== -1) {
					history.back(-1);
				} else {
					window.location.pathname = "/";
				}
			}
		}
		var pagename = document.getElementById("pagename");
		if (pagename && window.location) {
			pagename.innerHTML = window.location.pathname;
		}
	`;

  return (
    <footer className="footer d-flex flex-column align-items-center justify-content-center text-muted">
      <div className="footer-inner">
        <a href="/" className="d-flex align-items-center footer-text">
          Made with
          <svg
            aria-hidden="true"
            focusable="false"
            data-icon="heart"
            className="svg-inline--fa fa-heart fa-w-16 text-danger mx-1"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"
            ></path>
          </svg>
          by the MultiversX (previously Elrond) team.
        </a>
      </div>
      {/* App switcher icon and dropdown had to be placed here so we can have the functionality on all pages, since we don't have the possibility to edit the navigation menu*/}
      <div id="app-links">
        <a
          href="https://github.com/ElrondNetwork"
          target="_blank"
          rel="noopener noreferrer"
          className="app-menu-entry d-flex align-items-center"
          aria-label="Github"
        >
          <svg
            className="app-icon"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              id="Path"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12,0C5.4,0,0,5.4,0,12c0,5.3,3.4,9.8,8.2,11.4C8.8,23.5,9,23.1,9,22.8c0-0.3,0-1.2,0-2.2
								c-3,0.6-3.8-0.7-4-1.4c-0.1-0.3-0.7-1.4-1.2-1.7c-0.4-0.2-1-0.8,0-0.8c0.9,0,1.6,0.9,1.8,1.2c1.1,1.8,2.8,1.3,3.5,1
								c0.1-0.8,0.4-1.3,0.8-1.6c-2.7-0.3-5.5-1.3-5.5-5.9C4.4,10,4.8,9,5.6,8.1C5.5,7.8,5.1,6.6,5.7,5c0,0,1-0.3,3.3,1.2
								c1-0.3,2-0.4,3-0.4s2,0.1,3,0.4C17.3,4.6,18.3,5,18.3,5c0.7,1.6,0.2,2.9,0.1,3.2c0.8,0.8,1.2,1.9,1.2,3.2c0,4.6-2.8,5.6-5.5,5.9
								c0.4,0.4,0.8,1.1,0.8,2.2c0,1.6,0,2.9,0,3.3c0,0.3,0.2,0.7,0.8,0.6C20.6,21.8,24,17.3,24,12C24,5.4,18.6,0,12,0z"
            ></path>
          </svg>
          <span className="pl-1 menu-text">Github</span>
        </a>
        <a
          href="https://t.me/ElrondNetwork"
          target="_blank"
          rel="noopener noreferrer"
          className="app-menu-entry d-flex align-items-center"
          aria-label="Chat"
        >
          <svg
            className="app-icon"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 22 19"
          >
            <path
              fillRule="evenodd"
              d="M.461 8.894l4.9 1.829 1.897 6.1c.121.39.6.535.917.275l2.73-2.226a.815.815 0 0 1 .994-.028l4.927 3.577c.34.247.82.06.905-.35L21.34.712a.578.578 0 0 0-.774-.656L.456 7.813a.578.578 0 0 0 .005 1.08zm6.492.855l9.577-5.898c.172-.106.349.127.201.264l-7.904 7.347a1.64 1.64 0 0 0-.508.98l-.269 1.995c-.035.267-.41.293-.483.036L6.53 10.834a.964.964 0 0 1 .422-1.085z"
            ></path>
          </svg>
          <span className="pl-1 menu-text">Chat</span>
        </a>
        <div
          id="app-switcher-dropdown"
          className="app-menu-entry d-flex align-items-center"
        >
          <svg
            className="app-icon app-switcher-icon"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            aria-label="Menu"
          >
            <path d="M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z"></path>
          </svg>
          <nav className="app-switcher-dropdown dropdown-menu dropdown-menu-right">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://multiversx.com/"
              className="dropdown-item"
            >
              Main site
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wallet.elrond.com/"
              className="dropdown-item"
            >
              Wallet
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://explorer.elrond.com/"
              className="dropdown-item"
            >
              Explorer
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://bridge.elrond.com/"
              className="dropdown-item"
            >
              Bridge
            </a>
            <a href="/" className="dropdown-item active">
              Docs
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://growth.elrond.com/"
              className="dropdown-item"
            >
              Growth
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://maiar.com/"
              className="dropdown-item"
            >
              Maiar
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://xexchange.com/"
              className="dropdown-item"
            >
              xExchange
            </a>
          </nav>
        </div>
      </div>

      {/* Since there's no React runtime shipped to clients, the event handlers would not work, hence we have to do this */}
      <script dangerouslySetInnerHTML={{ __html: menuDropdown }} />
    </footer>
  );
}

module.exports = CustomFooter;
