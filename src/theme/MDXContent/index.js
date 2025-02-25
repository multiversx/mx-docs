import React from "react";
import MDXContent from "@theme-original/MDXContent";
import CopyMarkdownButton from "@site/src/components/CopyMarkdownButton";

const MDXContentWrapper = (props) => (
  <div className="relative">
    <CopyMarkdownButton />
    <MDXContent {...props} />
  </div>
);

export default MDXContentWrapper;
