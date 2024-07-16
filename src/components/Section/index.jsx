import React from "react";
import Link from "@docusaurus/Link";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import clsx from "clsx";

const SectionCard = ({
  title = "",
  text = "",
  link,
  icon,
  isSmallCard = false,
  className,
}) => {
  if (isSmallCard) {
    return (
      <Link
        to={link}
        className={clsx(
          "section-small-card w-auto h-[196px] p-10 rounded-2xl border border-solid border-white/5 backdrop-blur-[52px] justify-between items-end inline-flex hover:no-underline",
          className
        )}
      >
        <div className="grow shrink basis-0 self-stretch rounded-2xl flex-col justify-between items-start inline-flex">
          <div className="self-stretch h-[65px] flex-col justify-start items-start gap-3 flex">
            <div className="justify-start items-center gap-1 inline-flex">
              <dt className="text-teal-200 text-lg font-semibold leading-normal">
                {title}
              </dt>
              <div className="w-4 h-4 justify-center items-center flex">
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="w-3.5 h-[13.50px] text-center text-teal-200 text-sm font-normal]"
                />
              </div>
            </div>
          </div>
          <dd className="ms-0 self-stretch text-neutral-500 text-sm font-normal leading-tight">
            {text}
          </dd>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={link}
      className={clsx(
        "section-card grow shrink basis-0 h-[236px] p-10 bg-neutral-900/80 rounded-3xl backdrop-blur-[50px] justify-between items-end flex hover:no-underline",
        className
      )}
    >
      <div className="grow shrink basis-0 self-stretch rounded-2xl flex-col justify-between items-start inline-flex">
        <div className="self-stretch h-[65px] flex-col justify-start items-start gap-3 flex">
          {icon && (
            <div className="h-8 justify-center items-center inline-flex">
              <FontAwesomeIcon
                icon={icon}
                className="text-center text-teal-200 text-[32px] font-black"
              />
            </div>
          )}
          <div className="self-stretch justify-start items-center gap-1 inline-flex">
            <dt className="text-teal-200 text-[21px] font-semibold leading-[21px]">
              {title}
            </dt>
            <div className="w-4 h-4 justify-center items-center flex">
              <FontAwesomeIcon
                icon={faArrowRight}
                className="w-3.5 text-center text-teal-200 text-sm font-normal"
              />
            </div>
          </div>
        </div>
        <dd className="ms-0 text-neutral-500 text-base font-normal leading-snug">
          {text}
        </dd>
      </div>
    </Link>
  );
};

const SectionLink = ({ text = "", link, className }) => {
  return (
    <Link to={link} className={clsx("link", className)}>
      {text}
    </Link>
  );
};

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
          <h2 className="mb-0 text-neutral-50 text-[32px] font-medium leading-loose">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mb-0 text-neutral-500 text-base font-normal leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      {cards.length > 0 && (
        <dl
          className={clsx(
            "cards grid gap-1",
            { "grid-cols-4": hasSmallCards },
            { "grid-cols-3": !hasSmallCards }
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
        <ul className={clsx("links")}>
          {links.map((link) => (
            <li key={link.title}>
              <SectionLink {...link} className={linksClassname} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Section;
