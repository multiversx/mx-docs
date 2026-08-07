import React from "react";
import DifficultyDots from "@site/src/components/cookbook/DifficultyDots";
import ArtifactBadge from "@site/src/components/cookbook/ArtifactBadge";
import MetaChip from "@site/src/components/cookbook/MetaChip";
import styles from "./styles.module.css";

// The metadata strip rendered above every recipe title by the DocItem/Content
// swizzle. Every item maps to a real frontmatter field — difficulty,
// est_minutes, sdk_versions, and artifact — so the strip distinguishes complete
// projects from focused reference pages. CI validates that the artifact label
// agrees with the files the page contains.
export default function RecipeMeta({ frontMatter = {} }) {
  const {
    difficulty,
    est_minutes: estMinutes,
    artifact,
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

      {artifact && (
        <span className={styles.trailing}>
          <ArtifactBadge artifact={artifact} />
        </span>
      )}
    </div>
  );
}
