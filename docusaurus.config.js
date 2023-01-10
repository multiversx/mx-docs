// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require("dotenv").config();
const math = require("remark-math");
const katex = require("rehype-katex");

const lightCodeTheme = require("prism-react-renderer/themes/vsDark");
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "MultiversX Docs",
  titleDelimiter: "•",
  tagline:
    "A highly scalable, fast and secure blockchain platform for distributed apps, enterprise use cases and the new internet economy.",
  url: "https://docs.multiversx.com",
  baseUrl: "/",
  onBrokenLinks: "log",
  onBrokenMarkdownLinks: "log",
  favicon: "img/favicons/favicon.ico",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "multiversx", // Usually your GitHub org/user name.
  projectName: "mx-docs", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root
          sidebarPath: require.resolve("./sidebars.js"),
          /* other docs plugin options */
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: false, // Optional: disable the blog plugin
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleAnalytics: {
          trackingID: "UA-143242606-1",
        },
      }),
    ],
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
    {
      href: "https://fonts.googleapis.com/css?family=Montserrat:400,500,600&display=swap",
      type: "text/css",
      crossorigin: "anonymous",
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        logo: {
          alt: "MultiversX Docs",
          src: "img/logo_dark.svg",
          srcDark: "img/logo.svg",
        },
        items: [
          {
            href: "/developers/overview",
            label: "Develop",
            position: "left",
          },
          {
            href: "/validators/overview",
            label: "Validate",
            position: "left",
          },
          {
            href: "/integrators/overview",
            label: "Integrate",
            position: "left",
          },
          {
            href: "/technology/architecture-overview",
            label: "Learn",
            position: "left",
          },
          {
            href: "https://github.com/multiversx",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub",
          },
          {
            href: "https://t.me/ElrondNetwork",
            position: "right",
            className: "header-telegram-link",
            "aria-label": "Chat",
          },
          {
            type: "dropdown",
            position: "right",
            className: "header-app-change",
            "aria-label": "Websites",
            items: [
              {
                label: "Main Site",
                href: "https://multiversx.com",
                target: "_blank",
              },
              {
                label: "Wallet",
                href: "https://wallet.multiversx.com",
                target: "_blank",
              },
              {
                label: "Explorer",
                href: "https://explorer.multiversx.com",
                target: "_blank",
              },
              {
                label: "Bridge",
                href: "https://ad-astra.multiversx.com",
                target: "_blank",
              },
              {
                label: "xExchange",
                href: "https://xexchange.com",
                target: "_blank",
              },
              {
                label: "xLaunchpad",
                href: "https://xlaunchpad.com",
                target: "_blank",
              },
            ],
          },
        ],
      },
      image: "img/share.png",
      footer: {
        style: "light",
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} MultiversX. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["rust", "tsx", "jsonp"],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: `${process.env.REACT_APP_ALGOLIA_APP_ID}`,
        // Public API key: it is safe to commit it
        apiKey: `${process.env.REACT_APP_ALGOLIA_SEARCH_KEY}`,
        indexName: "multiversx",
        contextualSearch: true,
      },
      slugPreprocessor: (slugBase) =>
        slugBase.replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, ""),
    }),
};

module.exports = config;
