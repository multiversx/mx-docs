import React from "react";
import Link from "@docusaurus/Link";
import DifficultyDots from "@site/src/components/cookbook/DifficultyDots";
import VerifiedBadge from "@site/src/components/cookbook/VerifiedBadge";
import styles from "./styles.module.css";

// One recipe as a card in the browsable index. Props map to the same recipe
// frontmatter fields the swizzle reads, so a card and its page always agree.
export default function RecipeCard({ recipe = {} }) {
  const {
    title,
    description,
    href = "#",
    difficulty,
    lastValidated,
    stale,
    tags = [],
    sdkVersions,
  } = recipe;

  const primaryVersion =
    sdkVersions && typeof sdkVersions === "object"
      ? Object.entries(sdkVersions).find(([, range]) => Boolean(range))
      : null;

  return (
    <Link className={styles.card} to={href}>
      <div className={styles.head}>
        {difficulty && <DifficultyDots difficulty={difficulty} />}
        <VerifiedBadge date={lastValidated} stale={Boolean(stale)} compact />
      </div>

      <div className={styles.title}>{title}</div>
      {description && <p className={styles.desc}>{description}</p>}

      <div className={styles.foot}>
        {tags.slice(0, 3).map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
        {primaryVersion && (
          <span className={styles.version}>
            {primaryVersion[0]} {primaryVersion[1]}
          </span>
        )}
      </div>
    </Link>
  );
}
