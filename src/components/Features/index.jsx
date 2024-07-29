import React from "react";

import Section from "../Section";
import homepage from "../../../homepage";

const Features = () => {
  const { features } = homepage;

  return (
    <Section
      title={features.title}
      cards={features.cards}
      cardsClassname="feature-card"
      hasSmallCards={true}
    />
  );
};

export default Features;
