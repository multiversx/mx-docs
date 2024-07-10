// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "MultiversX Docs",
  titleDelimiter: "•",
  tagline:
    "A highly scalable, fast and secure blockchain platform for distributed apps, enterprise use cases and the new internet economy.",
  favicon: "img/favicons/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.multiversx.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "multiversx", // Usually your GitHub org/user name.
  projectName: "mx-docs", // Usually your repo name.

  onBrokenLinks: "log",
  onBrokenMarkdownLinks: "log",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // mermaid support
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

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

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root
          sidebarPath: "./sidebars.js",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/multiversx/mx-docs/edit/development",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        gtag: {
          trackingID: "G-TW3LCJ0LS7",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },

      // Replace with your project's social card
      image: "img/share.jpg",
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
            href: "https://discord.gg/multiversxbuilders",
            position: "right",
            className: "header-discord-link",
            "aria-label": "Discord",
          },
          {
            href: "https://t.me/MultiversX",
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
      footer: {
        style: "light",
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} MultiversX. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.vsDark,
        darkTheme: prismThemes.oceanicNext,
        additionalLanguages: ["rust", "tsx", "toml", "bash", "diff", "json"],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: `${process.env.REACT_APP_ALGOLIA_APP_ID}`,
        // Public API key: it is safe to commit it
        apiKey: `${process.env.REACT_APP_ALGOLIA_SEARCH_KEY}`,
        indexName: "elrond",
        contextualSearch: false,
      },
      slugPreprocessor: (slugBase) =>
        slugBase.replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, ""),
    }),

  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/technology/glossary",
            to: "/welcome/terminology",
          },
          {
            from: "/technology/architecture-overview",
            to: "/learn/architecture-overview",
          },
          {
            from: "/technology/secure-proof-of-stake",
            to: "/learn/consensus",
          },
          {
            from: "/technology/chronology",
            to: "/learn/chronology",
          },
          {
            from: "/technology/entities",
            to: "/learn/entities",
          },
          {
            from: "/technology/adaptive-state-sharding",
            to: "/learn/sharding",
          },
          {
            from: "/technology/cross-shard-transactions",
            to: "/learn/transactions",
          },
          {
            from: "/economics",
            to: "/learn/economics",
          },
          {
            from: "/tokens/esdt-tokens",
            to: "/tokens/fungible-tokens",
          },
          {
            from: "/tokens/overview",
            to: "/tokens/intro",
          },
          {
            from: "/validators/staking/convert-existing-validator-into-staking-pool",
            to: "/validators/staking/convert-existing-validator-into-staking-provider",
          },
          {
            from: "/sdk-and-tools/rest-api/api-com/",
            to: "/sdk-and-tools/rest-api/multiversx-api/",
          },
          {
            from: "/validators/elrond-go-scripts/config-scripts",
            to: "/validators/nodes-scripts/config-scripts",
          },
          {
            from: "/validators/elrond-go-scripts/install-update",
            to: "/validators/nodes-scripts/install-update",
          },
          {
            from: "/sdk-and-tools/dapp-core",
            to: "/sdk-and-tools/sdk-dapp",
          },
          {
            from: "/validators/staking-providers-apr",
            to: "/economics/staking-providers-apr",
          },
          {
            from: "/sdk-and-tools/rest-api/rest-api",
            to: "/sdk-and-tools/rest-api",
          },
          {
            from: "/developers/developer-reference/wasm-annotations",
            to: "/developers/developer-reference/sc-annotations",
          },
          {
            from: "/developers/developer-reference/wasm-modules",
            to: "/developers/developer-reference/sc-modules",
          },
          {
            from: "/developers/developer-reference/wasm-contract-calls",
            to: "/developers/transactions/tx-legacy-calls",
          },
          {
            from: "/developers/developer-reference/wasm-api-functions",
            to: "/developers/developer-reference/sc-api-functions",
          },
          {
            from: "/developers/developer-reference/rust-smart-contract-debugging",
            to: "/developers/testing/sc-debugging",
          },
          {
            from: "/developers/developer-reference/sc-debugging",
            to: "/developers/testing/sc-debugging",
          },
          {
            from: "/developers/developer-reference/rust-testing-framework",
            to: "/developers/testing/rust/whitebox-legacy",
          },
          {
            from: "/developers/developer-reference/rust-testing-framework-functions-reference",
            to: "/developers/testing/rust/whitebox-legacy-functions-reference",
          },
          {
            from: "/developers/developer-reference/smart-contract-build-reference",
            to: "/developers/meta/sc-build-reference",
          },
          {
            from: "/developers/developer-reference/sc-build-reference",
            to: "/developers/meta/sc-build-reference",
          },
          {
            from: "/developers/developer-reference/serialization-format",
            to: "/developers/data/serialization-overview",
          },
          {
            from: "/developers/developer-reference/random-numbers-in-smart-contracts",
            to: "/developers/developer-reference/sc-random-numbers",
          },
          {
            from: "/developers/developer-reference/sc-meta",
            to: "/developers/meta/sc-meta",
          },
          {
            from: "/developers/developer-reference/code-metadata",
            to: "/developers/data/code-metadata",
          },
          {
            from: "/developers/best-practices/multi-values",
            to: "/developers/data/multi-values",
          },
          {
            from: "/developers/scenario-reference/overview",
            to: "/developers/testing/scenario/concept",
          },
          {
            from: "/developers/scenario-reference/structure",
            to: "/developers/testing/scenario/structure-json",
          },
          {
            from: "/developers/scenario-reference/values-simple",
            to: "/developers/testing/scenario/values-simple",
          },
          {
            from: "/developers/scenario-reference/values-complex",
            to: "/developers/testing/scenario/values-complex",
          },
          {
            from: "/developers/scenario-reference/embed",
            to: "/developers/testing/testing-in-go",
          },
          {
            from: "/developers/mandos-reference/overview",
            to: "/developers/testing/scenario/concept",
          },
          {
            from: "/developers/mandos-reference/structure",
            to: "/developers/testing/scenario/structure-json",
          },
          {
            from: "/developers/mandos-reference/values-simple",
            to: "/developers/testing/scenario/values-simple",
          },
          {
            from: "/developers/mandos-reference/values-complex",
            to: "/developers/testing/scenario/values-complex",
          },
          {
            from: "/developers/mandos-reference/embed",
            to: "/developers/testing/testing-in-go",
          },
          {
            from: "/sdk-and-tools/erdjs",
            to: "/sdk-and-tools/sdk-js",
          },
          {
            from: "/sdk-and-tools/erdjava",
            to: "/sdk-and-tools/mxjava",
          },
          {
            from: "/sdk-and-tools/erdgo",
            to: "/sdk-and-tools/sdk-go",
          },
          {
            from: "/sdk-and-tools/erdjs/erdjs-cookbook",
            to: "/sdk-and-tools/sdk-js/sdk-js-cookbook-versions",
          },
          {
            from: "/sdk-and-tools/sdk-js/sdk-js-cookbook",
            to: "/sdk-and-tools/sdk-js/sdk-js-cookbook-v13",
          },
          {
            from: "/sdk-and-tools/erdjs/writing-and-testing-erdjs-interactions",
            to: "/sdk-and-tools/sdk-js/writing-and-testing-sdk-js-interactions",
          },
          {
            from: "/sdk-and-tools/erdjs/erdjs-migration-guides",
            to: "/sdk-and-tools/sdk-js/sdk-js-migration-guides",
          },
          {
            from: "/sdk-and-tools/erdjs/erdjs-signing-providers",
            to: "/sdk-and-tools/sdk-js/sdk-js-signing-providers",
          },
          {
            from: "/sdk-and-tools/erdpy",
            to: "/sdk-and-tools/sdk-py",
          },
          {
            from: "/sdk-and-tools/erdpy/erdpy",
            to: "/sdk-and-tools/sdk-py",
          },
          {
            from: "/sdk-and-tools/erdpy/erdpy-cookbook",
            to: "/sdk-and-tools/sdk-py/sdk-py-cookbook",
          },
          {
            from: "/sdk-and-tools/erdpy/installing-erdpy",
            to: "/sdk-and-tools/sdk-py/installing-mxpy",
          },
          {
            from: "/sdk-and-tools/erdpy/configuring-erdpy",
            to: "/sdk-and-tools/sdk-py/configuring-mxpy",
          },
          {
            from: "/sdk-and-tools/erdpy/erdpy-cli",
            to: "/sdk-and-tools/sdk-py/mxpy-cli",
          },
          {
            from: "/sdk-and-tools/erdpy/deriving-the-wallet-pem-file",
            to: "/sdk-and-tools/sdk-py/deriving-the-wallet-pem-file",
          },
          {
            from: "/sdk-and-tools/erdpy/smart-contract-interactions",
            to: "/sdk-and-tools/sdk-py/smart-contract-interactions",
          },
          {
            from: "/sdk-and-tools/erdpy/sending-bulk-transactions",
            to: "/sdk-and-tools/sdk-py/sdk-py-cookbook",
          },
          {
            from: "/sdk-and-tools/erdpy/writing-and-running-mxpy-scripts",
            to: "/sdk-and-tools/sdk-py/sdk-py-cookbook",
          },
          {
            from: "/developers/log-events/esdt-events",
            to: "/developers/event-logs/esdt-events",
          },
          {
            from: "/developers/log-events/execution-events",
            to: "/developers/event-logs/execution-events",
          },
          {
            from: "/developers/log-events/contract-call-events",
            to: "/developers/event-logs/contract-call-events",
          },
          {
            from: "/developers/log-events/contract-deploy-events",
            to: "/developers/event-logs/contract-deploy-events",
          },
          {
            from: "/developers/log-events/system-delegation-events",
            to: "/developers/event-logs/system-delegation-events",
          },
        ],
        createRedirects(existingPath) {
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ],
    async function myPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],
};

export default config;
