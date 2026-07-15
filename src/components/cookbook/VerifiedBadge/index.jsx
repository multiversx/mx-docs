import React from "react";
import styles from "./styles.module.css";

// The single load-bearing teal element in the whole design layer: it signals
// that a recipe compiles green / is CI-verified. When the nightly recheck marks
// a recipe stale, it degrades to a neutral-warning state instead of teal, so the
// teal only ever means "trustworthy right now".
export default function VerifiedBadge({ date, stale = false, compact = false }) {
  if (stale) {
    return (
      <span
        className={`${styles.badge} ${styles.stale}`}
        title="This recipe failed its last CI recheck"
      >
        <span className={styles.bang} aria-hidden="true">
          !
        </span>
        <span>{compact ? "Stale" : "Needs recheck"}</span>
      </span>
    );
  }

  return (
    <span
      className={`${styles.badge} ${styles.ok}`}
      title={date ? `Verified ${date}` : "Verified"}
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
      <span>{compact || !date ? "Verified" : `Verified ${date}`}</span>
    </span>
  );
}
