import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

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

const FeatureCard = ({ title, text, link, icon }) => {
  return (
    <Link
      to={link}
      className={clsx(
        "group relative cursor-pointer overflow-clip rounded-3xl from-primary/30 via-transparent to-transparent"
      )}
    >
      <div className="">
        <dt>{title}</dt>
        <dd className="mb-0 text-sm">{text}</dd>
      </div>
    </Link>
  );
};

const Features = () => {
  return (
    <section className="">
      <h2>{TITLE}</h2>
      <dl>
        {CARDS.map((card) => (
          <FeatureCard {...card} key={card.title} />
        ))}
      </dl>
    </section>
  );
};

export default Features;
