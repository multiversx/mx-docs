import React from "react";

import Section from "../Section";

const SUBTITLE = "More resources:";
const LINKS = [
  {
    text: "Developer Podcasts",
    link: "https://open.spotify.com/show/4I6Xr5Mmd10ywvb2aj7e6Z",
  },
  {
    text: "Stack Overflow",
    link: "https://stackoverflow.com/questions/tagged/multiversx",
  },
  {
    text: "Tech Talks from xDay 2023",
    link: "https://www.youtube.com/watch?v=WoIa4sQuNDo",
  },
  {
    text: "@multiversx on X",
    link: "https://twitter.com/MultiversX",
  },
];

const Resources = () => {
  return <Section subtitle={SUBTITLE} links={LINKS} />;
};

export default Resources;
