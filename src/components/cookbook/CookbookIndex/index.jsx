import React from "react";
import RecipeCard from "@site/src/components/cookbook/RecipeCard";
import styles from "./styles.module.css";

// The browsable front door for the cookbook. Given the build-time manifest
// (src/data/cookbook-manifest.json, generated from each recipe's real
// frontmatter), it renders a jump-nav plus one recipe-card grid per section. Nothing
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
          <div className={styles.grid}>
            {s.recipes.map((recipe) => (
              <RecipeCard key={recipe.href || recipe.title} recipe={recipe} />
            ))}
          </div>
        </section>
      ))}

      <p className={styles.footNote}>
        {total} recipes across {sections.length} sections: 61 standalone projects
        reconstructed and built in CI, plus 11 focused reference pages. Card badges
        state which artifact the page contains.
      </p>
    </div>
  );
}
