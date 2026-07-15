import React from "react";
import Content from "@theme-original/DocItem/Content";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import RecipeMeta from "@site/src/components/cookbook/RecipeMeta";

/**
 * Wraps the original DocItem/Content.
 *
 * On cookbook recipe pages — identified by the presence of the recipe-specific
 * frontmatter fields (`difficulty` + `sdk_versions`) — it renders the metadata
 * strip above the title and scopes the recipe design layer via the
 * `.cookbook-recipe` class. Every other doc page is returned untouched (same
 * element, same props, no wrapper), so this swizzle cannot change the
 * appearance of anything outside the cookbook.
 */
export default function ContentWrapper(props) {
  const { frontMatter } = useDoc();
  const isRecipe = Boolean(
    frontMatter && frontMatter.difficulty && frontMatter.sdk_versions
  );

  if (!isRecipe) {
    return <Content {...props} />;
  }

  return (
    <div className="cookbook-recipe">
      <RecipeMeta frontMatter={frontMatter} />
      <Content {...props} />
    </div>
  );
}
