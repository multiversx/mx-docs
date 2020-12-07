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
  tagline: "The Internet Scale Blockchain",
  url: "https://docs.elrond.com", // Your website URL
  baseUrl: "/", // Base URL for your project */
  docsUrl: "",
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
    // { search: true },
    { href: "/developers/tutorials/crowdfunding-p1", label: "Develop" },
    { href: "/validators/system-requirements", label: "Validate" },
    { href: "/integrators/observing-squad", label: "Integrate" },
    { href: "/technology/architecture-overview", label: "Learn" },
  ],

  ogImage: "img/share.png",
  twitterImage: "img/share.png",

  gaTrackingId: "UA-143242606-1",

  /* path to images for header/footer */
  headerIcon: "img/logos/logo.svg",
  footerIcon: "img/logos/elrond.svg",
  favicon: "img/favicon/favicon-32x32.png",

  manifest: "manifest/manifest.json",

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
    "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css",
  ],

  markdownPlugins: [
    // Highlight admonitions.
    require("remarkable-admonitions")({ icon: "svg-inline" }),
    require("remarkable-katex"),
  ],

  // On page navigation for the current documentation page.
  onPageNav: "separate",
  cleanUrl: true,
  docsSideNavCollapsible: true,

  // algolia: {
  //   apiKey: "12345678",
  //   indexName: "test",
  // },

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  highlightPanels: [
    {
      title: "Discover Elrond",
      content:
        "Meet the blockchain that can offer true internet-scale performance.",
      docName: "welcome/welcome-to-elrond",
      icon: "💡",
    },
    {
      title: "Start Building",
      content: "Build your decentralized application in minutes.",
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
      content:
        "Follow our guide to integrate exchanges, wallets, and other platforms.",
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
      content:
        "Issue your own ESDT token, Elrond's improved equivalent of ERC-20.",
      docName: "developers/esdt-tokens",
      icon: "🔷",
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
