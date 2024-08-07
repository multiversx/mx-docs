import React from "react";

import Section from "../Section";
import homepage from "../../../homepage";

const Community = () => {
  const { community } = homepage;

  return (
    <Section
      title={community.title}
      subtitle={community.subtitle}
      cards={community.cards}
      cardsClassname="community-card has-icon-gradient"
    />
  );
};

export default Community;
