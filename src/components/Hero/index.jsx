import React from "react";

import Section from "../Section";
import homepage from "../../../homepage";

const Hero = () => {
  const { hero } = homepage;

  return (
    <>
      <section className="flex-col justify-start items-start gap-32 inline-flex">
        <div className="self-stretch flex-col justify-center items-start gap-4 flex">
          <h1 className="title-shadow text-neutral-1000 dark:text-neutral-50 mb-0 text-[42px] sm:text-[56px] font-medium leading-[42px] sm:leading-[56px]">
            {hero.title}
          </h1>
          <p className="text-neutral-500 text-[21px] font-normal leading-relaxed">
            {hero.subtitle}
          </p>
        </div>
      </section>
      <Section cards={hero.cards} cardsClassname="hero-card" />
    </>
  );
};

export default Hero;
