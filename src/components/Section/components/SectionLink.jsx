import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import ExternalIcon from "./external.svg";

export const SectionLink = ({ text = "", link, className }) => {
  return (
    <Link
      to={link}
      className={clsx(
        "link text-primary hover:text-teal-500 dark:hover:text-teal-200 text-lg font-semibold leading-normal gap-2 inline-flex justify-center items-center hover:no-underline",
        className
      )}
    >
      {text}
      <ExternalIcon className="w-4" />
    </Link>
  );
};
