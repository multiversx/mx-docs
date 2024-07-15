import React from "react";
import {
  faDiscord,
  faTelegram,
  faStackOverflow,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const TITLE = "Engage the developer community";
const SUBTITLE =
  "Discover all places where the community gathers and the live community session happening.";
const CARDS = [
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
];

const CommunityCard = ({ title, text, link, icon }) => {
  return (
    <a
      href={link}
      className={clsx(
        "group relative cursor-pointer overflow-clip rounded-3xl from-primary/30 via-transparent to-transparent"
      )}
      target="_blank"
      rel="noreferrer nofollow noopener"
    >
      <div className="">
        <FontAwesomeIcon icon={icon} />
        <dt>{title}</dt>
        <dd className="mb-0 text-sm">{text}</dd>
      </div>
    </a>
  );
};

const Community = () => {
  return (
    <section className="">
      <div className="">
        <h2>{TITLE}</h2>
        <p>{SUBTITLE}</p>
      </div>

      <dl>
        {CARDS.map((card) => (
          <CommunityCard {...card} key={card.title} />
        ))}
      </dl>
    </section>
  );
};

export default Community;
