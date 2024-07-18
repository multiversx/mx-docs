import React from "react";
import { faBook, faHammer, faServer } from "@fortawesome/free-solid-svg-icons";

import Section from "../Section";

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

const Hero = () => {
  return (
    <>
      <section className="flex-col justify-start items-start gap-32 inline-flex">
        <div className="self-stretch flex-col justify-center items-start gap-4 flex">
          <h1 className="text-neutral-1000 dark:text-neutral-50 mb-0 text-[56px] font-medium leading-[56px]">
            {TITLE}
          </h1>
          <p className="text-neutral-500 text-[21px] font-normal leading-relaxed">
            {SUBTITLE}
          </p>
        </div>
      </section>
      <Section cards={CARDS} cardsClassname="hero-card" />
    </>
  );
};

export default Hero;
