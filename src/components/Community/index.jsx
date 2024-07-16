import React from "react";
import {
  faDiscord,
  faTelegram,
  faStackOverflow,
} from "@fortawesome/free-brands-svg-icons";

import Section from "../Section";

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

const Community = () => {
  return (
    <Section
      title={TITLE}
      subtitle={SUBTITLE}
      cards={CARDS}
      cardsClassname="community-card"
    />
  );
};

export default Community;
