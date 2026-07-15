import React from "react";
import RecipeCard from "@site/src/components/cookbook/RecipeCard";
import styles from "./styles.module.css";

// Responsive grid of RecipeCards. Usable directly in MDX:
//   <RecipeGrid recipes={[{ title, description, href, difficulty, ... }]} />
export default function RecipeGrid({ recipes = [] }) {
  return (
    <div className={styles.grid}>
      {recipes.map((r) => (
        <RecipeCard key={r.href || r.title} recipe={r} />
      ))}
    </div>
  );
}
