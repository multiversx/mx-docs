import React from "react";
import Link from "@docusaurus/Link";
import { faBook, faHammer, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const TITLE = "MultiversX Developer Docs";
const SUBTITLE = "Choose your path, you must.";
const CARDS = [
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
];

const HeroCard = ({ title, text, link, icon }) => {
  return (
    <Link
      to={link}
      className={clsx(
        "group relative cursor-pointer overflow-clip rounded-3xl from-primary/30 via-transparent to-transparent"
      )}
    >
      <div className="">
        <FontAwesomeIcon icon={icon} />
        <dt>{title}</dt>
        <dd className="mb-0 text-sm">{text}</dd>
      </div>
    </Link>
  );
};

const Hero = () => {
  return (
    <>
      <section className="">
        <div className="">
          <h1>{TITLE}</h1>
          <p>{SUBTITLE}</p>
        </div>
      </section>
      <section className="">
        <dl>
          {CARDS.map((card) => (
            <HeroCard {...card} key={card.title} />
          ))}
        </dl>
      </section>
    </>
  );
};

export default Hero;
