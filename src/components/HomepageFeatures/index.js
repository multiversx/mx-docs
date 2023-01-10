import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Discover MultiversX",
    content:
      "Meet the blockchain that can offer true internet-scale performance.",
    docName: "welcome/welcome-to-multiversx",
    icon: "💡",
  },
  {
    title: "Start Building",
    content: "Build your decentralized application in minutes.",
    docName: "developers/overview",
    icon: "🛠️",
  },
  {
    title: "Run a Validator Node",
    content: "Validate transactions, secure the network, and earn rewards.",
    docName: "validators/overview",
    icon: "🖥",
  },
  {
    title: "Integrate a Platform",
    content:
      "Follow our guide to integrate exchanges, wallets, and other platforms.",
    docName: "integrators/overview",
    icon: "🏛",
  },
  {
    title: "Manage a Wallet",
    content: "Create a wallet to send, receive and store MultiversX tokens.",
    docName: "wallet/overview",
    icon: "📱",
  },
  {
    title: "Create a Token",
    content:
      "Issue your own ESDT token, MultiversX's improved equivalent of ERC-20.",
    docName: "tokens/overview",
    icon: "🔷",
  },
  {
    title: "Learn How MultiversX Works",
    content:
      "Explore Adaptive state sharding, Secure Proof of Stake, and the MultiversX WASM VM.",
    docName: "technology/architecture-overview",
    icon: "🔬",
  },
];

function Feature({ docName, title, content, icon }) {
  return (
    <div className={clsx("col col--4 margin-bottom--lg")}>
      <Link className={clsx("card", styles.card)} to={docName}>
        <h3>
          <span className={clsx("margin-right--sm", styles.icon)}>{icon}</span>
          {title}
        </h3>
        <p>{content}</p>
      </Link>
    </div>
  );
}

function HomepageHeader() {
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <h1 className={clsx("hero__title")}>
          Welcome to the MultiversX (Elrond) docs!
        </h1>
        <p className={clsx("hero__subtitle")}>Choose your path you must.</p>
      </div>
    </header>
  );
}

export default function HomepageFeatures() {
  return (
    <div>
      <HomepageHeader />
      <section className={styles.features}>
        <div className={clsx("container", styles.container)}>
          <div className={clsx("row", styles.row)}>
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
