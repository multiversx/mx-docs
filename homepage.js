import {
  faDiscord,
  faTelegram,
  faStackOverflow,
} from "@fortawesome/free-brands-svg-icons";
import { faBook, faHammer, faServer } from "@fortawesome/free-solid-svg-icons";

const homepage = {
  hero: {
    title: "MultiversX Developer Docs",
    subtitle: "Choose your path, you must.",
    cards: [
      {
        title: "Learn about MultiversX",
        text: "Meet the blockchain that can offer true internet-scale performance.",
        link: "/welcome/welcome-to-multiversx",
        icon: faBook,
      },
      {
        title: "Start Building",
        text: "Build your decentralized application in minutes.",
        link: "/developers/overview",
        icon: faHammer,
      },
      {
        title: "Run a validator node",
        text: "Validate transactions, secure the network, and earn rewards.",
        link: "/validators/overview",
        icon: faServer,
      },
    ],
  },
  features: {
    title: "Do more with MultiversX",
    cards: [
      {
        title: "Create a Token",
        text: "Issue your own ESDT token, MultiversX's improved equivalent of ERC-20.",
        link: "/tokens/intro",
      },
      {
        title: "Manage a Wallet",
        text: "Create a wallet to send, receive and store MultiversX tokens.",
        link: "/wallet/overview",
      },
      {
        title: "Integrate MultiversX",
        text: "Follow our guide to integrate exchanges, wallets, and other platforms.",
        link: "/integrators/overview",
      },
      {
        title: "Get the Architecture Overview",
        text: "Explore MultiversX innovations.",
        link: "/technology/architecture-overview",
      },
      {
        title: "Discover SpaceVM",
        text: "A fast and secure virtual machine to power growth.",
        link: "/learn/space-vm",
      },
      {
        title: "Get EGLD",
        text: "You need EGLD or xEGLD in order to be able to interact with the MultiversX Network.",
        link: "/learn/EGLD#getting-egld",
      },
      {
        title: "Tools & Resources",
        text: "You can access the best set of tools that you may need for running your project.",
        link: "https://multiversx.com/builders/builder-tools-resources",
      },
      {
        title: "Tutorials",
        text: "A great start for anyone looking to learn.",
        link: "https://multiversx.com/builders/build-your-first-multiversx-dapp-in-30-minutes",
      },
    ],
  },
  promo: {
    title: "Build and deploy custom L2s or Appchains",
    tag: "Sovereign Chains",
    subtitle:
      "Enable new types of use cases made possible by scalable, efficient, secure and dedicated blockchains - powered by the Sovereign Chain SDK.",
    link: "sovereign/overview",
    button: "Sovereign Chains Documentation",
  },
  community: {
    title: "Engage the developer community",
    subtitle:
      "Discover all places where the community gathers and the live community session happening.",
    cards: [
      {
        title: "Developer Discord",
        text: "Connect with other developers building on MultiversX",
        link: "https://discord.com/invite/multiversxbuilders",
        icon: faDiscord,
      },
      {
        title: "Developer Telegram",
        text: "Connect with other MultiversX Builders and developers",
        link: "https://t.me/MultiversX",
        icon: faTelegram,
      },
      {
        title: "Stack Overflow",
        text: "Get answers to technical questions from the community",
        link: "https://stackoverflow.com/questions/tagged/multiversx",
        icon: faStackOverflow,
      },
    ],
  },
  resources: {
    subtitle: "More resources:",
    links: [
      {
        text: "Developer Podcasts",
        link: "https://open.spotify.com/show/4I6Xr5Mmd10ywvb2aj7e6Z",
      },
      {
        text: "Stack Overflow",
        link: "https://stackoverflow.com/questions/tagged/multiversx",
      },
      {
        text: "Tech Talks from xDay 2023",
        link: "https://www.youtube.com/watch?v=WoIa4sQuNDo",
      },
      {
        text: "@multiversx on X",
        link: "https://twitter.com/MultiversX",
      },
    ],
  },
};

export default homepage;
