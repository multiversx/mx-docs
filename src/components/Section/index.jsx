import React from "react";
import clsx from "clsx";

import { SectionCard, SectionLink } from "./components";

const Section = ({
  title,
  subtitle,
  className = "",
  cards = [],
  cardsClassname = "",
  hasSmallCards = false,
  links = [],
  linksClassname = "",
}) => {
  return (
    <section className={clsx("section", className)}>
      <div className={clsx("section-header")}>
        {title && (
          <h2 className="mb-0 text-neutral-1000 dark:text-neutral-50 text-[32px] font-medium leading-snug">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mb-0 text-neutral-500 leading-snug">{subtitle}</p>
        )}
      </div>
      {cards.length > 0 && (
        <dl
          className={clsx(
            "cards grid gap-1 mt-3xl",
            {
              "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4":
                hasSmallCards,
            },
            { "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": !hasSmallCards }
          )}
        >
          {cards.map((card) => (
            <SectionCard
              {...card}
              key={card.title}
              className={cardsClassname}
              isSmallCard={hasSmallCards}
            />
          ))}
        </dl>
      )}
      {links.length > 0 && (
        <ul
          className={clsx(
            "links justify-start items-center gap-x-6 gap-y-2 inline-flex flex-wrap pl-0 mb-0"
          )}
        >
          {links.map((link) => (
            <li key={link.link} className="inline-flex">
              <SectionLink {...link} className={linksClassname} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Section;
