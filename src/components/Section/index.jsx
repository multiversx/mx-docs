import React from "react";
import Link from "@docusaurus/Link";
import {
  faArrowRight,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

import ExternalIcon from "./external.svg";

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
          "section-small-card section-small-shadow w-auto h-[196px] p-10 rounded-2xl border border-solid border-white/5 backdrop-blur-[52px] justify-between items-end inline-flex hover:no-underline hover:bg-neutral-200 dark:hover:bg-neutral-900/80",
          className
        )}
      >
        <div className="grow shrink basis-0 self-stretch rounded-2xl flex-col justify-between items-start inline-flex">
          <div className="self-stretch flex-col justify-start items-start gap-3 flex">
            <div className="justify-start items-center gap-1 inline-flex">
              <dt className="text-primary text-lg font-semibold leading-normal">
                {title}
              </dt>
              <div className="w-4 h-4 justify-center items-center flex">
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-center text-primary text-sm"
                />
              </div>
            </div>
          </div>
          <dd className="ms-0 self-stretch text-neutral-500 text-sm leading-tight font-roobert">
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
        "section-card section-shadow grow shrink basis-0 h-[236px] p-10 rounded-3xl backdrop-blur-[50px] justify-between items-end flex hover:no-underline bg-white hover:bg-neutral-200 dark:bg-neutral-900/80 dark:hover:bg-neutral-800/80",
        className
      )}
    >
      <div className="grow shrink basis-0 self-stretch rounded-2xl flex-col justify-between items-start inline-flex">
        <div className="self-stretch h-[65px] flex-col justify-start items-start gap-3 flex">
          {icon && (
            <div className="justify-center items-center inline-flex">
              <FontAwesomeIcon
                icon={icon}
                className="card-icon text-center text-primary text-[32px] font-black"
              />
            </div>
          )}
          <div className="self-stretch justify-start items-center gap-1 inline-flex">
            <dt className="text-primary text-[21px] font-semibold leading-[21px]">
              {title}
            </dt>
            <div className="w-4 h-4 justify-center items-center flex">
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-center text-primary text-sm"
              />
            </div>
          </div>
        </div>
        <dd className="ms-0 text-neutral-500 leading-snug font-roobert">
          {text}
        </dd>
      </div>
    </Link>
  );
};

const SectionLink = ({ text = "", link, className }) => {
  return (
    <Link
      to={link}
      className={clsx(
        "link text-primary hover:text-teal-200 text-lg font-semibold leading-normal gap-2 inline-flex justify-center items-center hover:no-underline",
        className
      )}
    >
      {text}
      <ExternalIcon className="w-4" />
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
