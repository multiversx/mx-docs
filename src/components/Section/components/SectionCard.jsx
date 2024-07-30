import React from "react";
import Link from "@docusaurus/Link";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

export const SectionCard = ({
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
          "section-small-card section-small-shadow w-auto h-[196px] p-10 rounded-2xl border border-solid border-white/5 backdrop-blur-[52px] justify-between items-end inline-flex hover:no-underline bg-white hover:bg-teal-50 dark:bg-transparent dark:hover:bg-neutral-900/80",
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
          <dd className="ms-0 self-stretch text-neutral-500 text-sm leading-tight">
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
        "section-card section-shadow grow shrink basis-0 h-[236px] p-10 rounded-3xl backdrop-blur-[50px] justify-between items-end flex hover:no-underline bg-white hover:bg-teal-50 dark:bg-neutral-900/80 dark:hover:bg-neutral-800/80",
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
        <dd className="ms-0 text-neutral-500 leading-snug">{text}</dd>
      </div>
    </Link>
  );
};
