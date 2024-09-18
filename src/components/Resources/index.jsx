import React from "react";

import Section from "../Section";
import homepage from "../../../homepage";

const Resources = () => {
  const { resources } = homepage;

  return (
    <Section
      subtitle={resources.subtitle}
      links={resources.links}
      className="-mt-20"
    />
  );
};

export default Resources;
