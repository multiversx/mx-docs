import React from "react";

import Section from "../Section";

const TITLE = "Do more with MultiversX";
const CARDS = [
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
    link: "/integrators/overview",
  },
  {
    title: "Discover SpaceVM",
    text: "A fast and secure virtual machine to power growth.",
    link: "/integrators/overview",
  },
  {
    title: "Get EGLD",
    text: "You need EGLD or xEGLD in order to be able to interact with the MultiversX Network.",
    link: "/integrators/overview",
  },
  {
    title: "Tools & Resources",
    text: "You can access the best set of tools that you may need for running your project.",
    link: "/integrators/overview",
  },
  {
    title: "Tutorials",
    text: "A great start for anyone looking to learn.",
    link: "/integrators/overview",
  },
];

const Features = () => {
  return (
    <Section
      title={TITLE}
      cards={CARDS}
      cardsClassname="feature-card"
      hasSmallCards={true}
    />
  );
};

export default Features;
