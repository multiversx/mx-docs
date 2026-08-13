import React, { useEffect, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  COOKBOOK_PATH,
  getLegacyCookbookTarget,
} from "./legacyCookbookRedirects.mjs";

function addBaseUrl(path, baseUrl) {
  const prefix = baseUrl === "/" ? "" : baseUrl.replace(/\/$/, "");
  return `${prefix}${path}`;
}

export default function LegacyCookbookRedirect() {
  const baseUrl = useBaseUrl("/");
  const fallbackUrl = addBaseUrl(COOKBOOK_PATH, baseUrl);
  const [destination, setDestination] = useState(fallbackUrl);

  useEffect(() => {
    const target = addBaseUrl(
      getLegacyCookbookTarget(window.location.hash),
      baseUrl,
    );

    setDestination(target);
    window.location.replace(target);
  }, [baseUrl]);

  return (
    <p>
      This cookbook page has moved. If you are not redirected automatically, {" "}
      <Link to={destination}>continue to the current recipe</Link>.
    </p>
  );
}
