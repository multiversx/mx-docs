/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: "Docs", // Title for your website.
  tagline: "Welcome to Elrond",
  url: "https://docs.elrond.com", // Your website URL
  baseUrl: "/", // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: "docs",
  organizationName: "Elrond Network",
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],

  headerLinks: [
    { search: true },
    { href: "/", label: "" },
  ],

  headerLinks: [
    { search: true },
    { href: "/docs/developers/tutorials/crowdfunding-p1", label: "Develop" },
    { href: "/docs/validators/system-requirements", label: "Validate" },
    { href: "/docs/integrators/observing-squad", label: "Integrate" },
    { href: "/docs/technology/architecture-overview", label: "Learn" },  
  ],

  /* path to images for header/footer */
  headerIcon: "img/logos/logo.svg",
  footerIcon: "img/logos/elrond.svg",
  favicon: "img/favicon/favicon-32x32.png",

  /* Colors for website */
  colors: {
    primaryColor: "#000",
    secondaryColor: "#000",
  },

  /* Custom fonts for website */

  fonts: {
    myFont: ["Montserrat", "sans-serif"],
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Elrond Network. All rights reserved.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: "atom-one-dark",
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [],

  stylesheets: [
    "https://fonts.googleapis.com/css?family=Montserrat:400,600&display=swap",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.css",
  ],

  markdownPlugins: [
    // Highlight admonitions.
    require("remarkable-admonitions")({ icon: "svg-inline" }),
  ],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  cleanUrl: true,
  docsSideNavCollapsible: true,

  algolia: {
    apiKey: "12345678",
    indexName: "test",
  },

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  highlightPanels: [
    {
      title: "Brief Intro to Elrond",
      content:
        "Meet the blockchain that can offer true internet-scale performance.",
      docName: "welcome/welcome-to-elrond",
      icon: "💡",
    },
    {
      title: "Start Building",
      content:
        "Build your decentralized application in minutes.",
      docName: "developers/tutorials/crowdfunding-p1",
      icon: "🛠️",
    },
    {
      title: "Run a Validator Node",
      content: "Validate transactions, secure the network, and earn rewards.",
      docName: "validators/system-requirements",
      icon: "🖥",
    },
    {
      title: "Integrate a Platform",
      content: "Follow our guide to integrate exchanges, wallets, and other platforms.",
      docName: "integrators/observing-squad",
      icon: "🏛",
    },
    {
      title: "Manage a Wallet",
      content: "Create a wallet to send, receive and store Elrond tokens.",
      docName: "wallet/web-wallet",
      icon: "📱",
    },
    {
      title: "Create a Token",
      content: "Issue your own ESDT token, Elrond's improved equivalent of ERC-20.",
      docName: "developers/esdt-tokens",
      icon: "🔰",
    },
    {
      title: "Learn How Elrond Works",
      content:
        "Explore Adaptive state sharding, Secure Proof of Stake, and the Arwen VM.",
      docName: "technology/architecture-overview",
      icon: "🔬",
    },
    ],
};

module.exports = siteConfig;
