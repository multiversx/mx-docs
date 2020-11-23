/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

export default function CustomFooter() {
	{/* Since there's no React runtime shipped to clients, the event handlers would not work, hence we have to do this */}
	const menuDropdown = `
		var dropdown = document.getElementById("app-switcher-dropdown");
		if (dropdown) {
			var dropdownIcon = dropdown.querySelector(".switcher-icon");
			var dropdownMenu = dropdown.querySelector(".switcher-dropdown");
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
	`;

	return (
		<footer className="footer d-flex flex-column align-items-center justify-content-center text-muted">
			<div className="footer-inner">
				<a href="/" className="d-flex align-items-center footer-text">
					Made with 
					<svg aria-hidden="true" 
						 focusable="false" 
						 data-prefix="fas" 
						 data-icon="heart" 
						 className="svg-inline--fa fa-heart fa-w-16 text-danger mx-1"
						 role="img" 
						 xmlns="http://www.w3.org/2000/svg" 
						 viewBox="0 0 512 512"
					>
						<path fill="currentColor"
							  d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z">
						</path>
					</svg> 
					by the Elrond team.
				</a>
			</div>
			{/* App switcher icon and dropdown had to be placed here so we can have the functionality on all pages, since we don't have the possibility to edit the navigation menu*/}
			<div id="app-switcher-dropdown">
				<div className="switcher-icon">
					<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-labelledby="Menu">
						<path d="M149.333 56v80c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h101.333c13.255 0 24 10.745 24 24zm181.334 240v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm32-240v80c0 13.255 10.745 24 24 24H488c13.255 0 24-10.745 24-24V56c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24zm-32 80V56c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.256 0 24.001-10.745 24.001-24zm-205.334 56H24c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24zM0 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H24c-13.255 0-24 10.745-24 24zm386.667-56H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zm0 160H488c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H386.667c-13.255 0-24 10.745-24 24v80c0 13.255 10.745 24 24 24zM181.333 376v80c0 13.255 10.745 24 24 24h101.333c13.255 0 24-10.745 24-24v-80c0-13.255-10.745-24-24-24H205.333c-13.255 0-24 10.745-24 24z"></path>
					</svg>
				</div>
				<nav className="switcher-dropdown dropdown-menu dropdown-menu-right">
					<a target="_blank" rel="noopener noreferrer" href="https://elrond.com/" className="dropdown-item">Main site</a>
					<a target="_blank" rel="noopener noreferrer" href="https://wallet.elrond.com/" className="dropdown-item">Wallet</a>
					<a target="_blank" rel="noopener noreferrer" href="https://explorer.elrond.com/" className="dropdown-item">Explorer</a>
					<a target="_blank" rel="noopener noreferrer" href="https://bridge.elrond.com/" className="dropdown-item">Bridge</a>
					<a href="/" className="dropdown-item active">Docs</a>
				</nav>
			</div>

			{/* Since there's no React runtime shipped to clients, the event handlers would not work, hence we have to do this */}
			<script dangerouslySetInnerHTML={{ __html: menuDropdown}} />
		</footer>
	);
}

module.exports = CustomFooter;