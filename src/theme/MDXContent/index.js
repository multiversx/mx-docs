import React from "react";
import MDXContent from "@theme-original/MDXContent";
import CopyMarkdownButton from "@site/src/components/CopyMarkdownButton";

export default function MDXContentWrapper(props) {
  return (
    <div className="relative">
      <CopyMarkdownButton />
      <MDXContent {...props} />
    </div>
  );
}
