import Community from "../Community";
import Features from "../Features";
import Hero from "../Hero";
import Promo from "../Promo";
import Resources from "../Resources";

import clsx from "clsx";

export default function Homepage() {
  return (
    <div
      className={clsx(
        "container font-roobert-medium py-24 flex-col gap-24 inline-flex"
      )}
    >
      <Hero />
      <Features />
      <Promo />
      <Community />
      <Resources />
    </div>
  );
}
