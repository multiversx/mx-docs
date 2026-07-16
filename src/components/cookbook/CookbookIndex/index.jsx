import React from "react";
import RecipeGrid from "@site/src/components/cookbook/RecipeGrid";
import styles from "./styles.module.css";

// The browsable front door for the cookbook. Given the build-time manifest
// (src/data/cookbook-manifest.json, generated from each recipe's real
// frontmatter), it renders a jump-nav plus one RecipeGrid per section. Nothing
// here is hand-maintained: sections and their order come straight from the
// manifest, which mirrors the curated sidebar order.
export default function CookbookIndex({ sections = [] }) {
  const total = sections.reduce((n, s) => n + s.recipes.length, 0);

  return (
    <div className={styles.index}>
      <nav className={styles.jump} aria-label="Cookbook sections">
        {sections.map((s) => (
          <a key={s.id} className={styles.jumpLink} href={`#${s.id}`}>
            {s.label}
            <span className={styles.jumpCount}>{s.recipes.length}</span>
          </a>
        ))}
      </nav>

      {sections.map((s) => (
        <section key={s.id} className={styles.section}>
          <h2 id={s.id} className={styles.heading}>
            {s.label}
            <span className={styles.count}>
              {s.recipes.length} {s.recipes.length === 1 ? "recipe" : "recipes"}
            </span>
          </h2>
          <RecipeGrid recipes={s.recipes} />
        </section>
      ))}

      <p className={styles.footNote}>
        {total} recipes across {sections.length} sections. Every card links to a
        page whose code is extracted and type-checked in CI; the teal badge means
        that check is currently green.
      </p>
    </div>
  );
}
