import React from "react";
import clsx from "clsx";

const TITLE = "";
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

const ResourceCard = ({ text, link }) => {
  return (
    <a
      href={link}
      className={clsx("relative")}
      target="_blank"
      rel="noreferrer nofollow noopener"
    >
      {text}
    </a>
  );
};

const Resources = () => {
  return (
    <section className="">
      {(TITLE || SUBTITLE) && (
        <div className="">
          <h2>{TITLE}</h2>
          <p>{SUBTITLE}</p>
        </div>
      )}
      <dl>
        {LINKS.map((card) => (
          <ResourceCard {...card} key={card.title} />
        ))}
      </dl>
    </section>
  );
};

export default Resources;
