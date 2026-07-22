import React from "react";
import styles from "./styles.module.css";

// This labels the artifact a page contains; it is not a hand-maintained CI
// status. Project pages are reconstructed, installed, and built by CI on the
// documented minimum Node version. Reference pages intentionally make no
// runnable-project or end-to-end verification claim.
export default function ArtifactBadge({ artifact = "reference", compact = false }) {
  if (artifact !== "project") {
    return (
      <span
        className={`${styles.badge} ${styles.reference}`}
        title="Focused reference material; this page is not a standalone runnable project"
      >
        <span className={styles.referenceIcon} aria-hidden="true">
          §
        </span>
        <span>Reference</span>
      </span>
    );
  }

  return (
    <span
      className={`${styles.badge} ${styles.project}`}
      title="CI reconstructs, installs, and builds this standalone project on Node 20.19.0"
    >
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        width="12"
        height="12"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M6.4 10.6 3.8 8l-1 1 3.6 3.6 7-7-1-1z" />
      </svg>
      <span>{compact ? "Build checked" : "Project build checked"}</span>
    </span>
  );
}
