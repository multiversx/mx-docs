// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const math = require("remark-math");
const katex = require("rehype-katex");

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "MultiversX Docs",
  tagline: "The Internet Scale Blockchain",
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
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "MultiversX Docs",
          src: "img/logo.svg",
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
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://t.me/ElrondNetwork",
            label: "Chat",
            position: "right",
          },
        ],
      },
      image: "img/share.png",
      footer: {
        style: "dark",
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} MultiversX. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["rust", "tsx", "jsonp"],
      },
    }),
};

module.exports = config;
