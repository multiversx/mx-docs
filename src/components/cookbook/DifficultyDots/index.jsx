import React from "react";
import styles from "./styles.module.css";

// Difficulty is drawn as filled dots (1 = beginner, 3 = advanced). Deliberately
// neutral-toned — structure, not accent — so it never competes with the teal
// "verified" signal.
const LEVELS = { beginner: 1, intermediate: 2, advanced: 3 };

export default function DifficultyDots({ difficulty }) {
  const level = LEVELS[difficulty] ?? 0;
  const label = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "Unknown";

  return (
    <span
      className={styles.wrap}
      title={`Difficulty: ${label}`}
      aria-label={`Difficulty: ${label}`}
    >
      <span className={styles.dots} aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= level ? styles.dotOn : styles.dotOff} />
        ))}
      </span>
      <span className={styles.label}>{label}</span>
    </span>
  );
}
