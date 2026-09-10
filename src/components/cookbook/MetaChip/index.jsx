import React from "react";
import styles from "./styles.module.css";

// A hairline pill for one piece of recipe metadata (est-time, an SDK version,
// etc.). `mono` renders the value in JetBrains Mono with tabular figures, the
// house treatment for anything version- or number-like.
export default function MetaChip({ label, value, mono = false, title }) {
  return (
    <span
      className={styles.chip}
      title={title || (label ? `${label}: ${value}` : String(value))}
    >
      {label && <span className={styles.label}>{label}</span>}
      <span className={mono ? styles.valueMono : styles.value}>{value}</span>
    </span>
  );
}
