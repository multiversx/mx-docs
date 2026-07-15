import React from "react";
import DifficultyDots from "@site/src/components/cookbook/DifficultyDots";
import VerifiedBadge from "@site/src/components/cookbook/VerifiedBadge";
import MetaChip from "@site/src/components/cookbook/MetaChip";
import styles from "./styles.module.css";

// The metadata strip rendered above every recipe title by the DocItem/Content
// swizzle. Every item maps to a real frontmatter field — difficulty,
// est_minutes, sdk_versions, last_validated, stale — so the strip reflects the
// product (CI-verified recipes), never decoration. Each field renders only when
// present, so partial frontmatter degrades gracefully.
export default function RecipeMeta({ frontMatter = {} }) {
  const {
    difficulty,
    est_minutes: estMinutes,
    last_validated: lastValidated,
    stale,
    sdk_versions: sdkVersions,
  } = frontMatter;

  const versions =
    sdkVersions && typeof sdkVersions === "object"
      ? Object.entries(sdkVersions).filter(([, range]) => Boolean(range))
      : [];

  return (
    <div className={styles.strip}>
      {difficulty && <DifficultyDots difficulty={difficulty} />}

      {typeof estMinutes === "number" && (
        <MetaChip
          label="Est"
          value={`${estMinutes} min`}
          mono
          title={`Estimated reading time: ${estMinutes} minutes`}
        />
      )}

      {versions.map(([name, range]) => (
        <MetaChip key={name} label={name} value={range} mono />
      ))}

      {(lastValidated || stale) && (
        <span className={styles.trailing}>
          <VerifiedBadge date={lastValidated} stale={Boolean(stale)} />
        </span>
      )}
    </div>
  );
}
