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
        "container font-medium py-24 flex-col gap-24 inline-flex"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        role="img"
        width="0"
        height="0"
      >
        <linearGradient id="icon-gradient">
          <stop offset="0%" stop-color="#00FFC2"></stop>
          <stop offset="100%" stop-color="#28CAE0"></stop>
        </linearGradient>
      </svg>
      <Hero />
      <Features />
      <Promo />
      <Community />
      <Resources />
    </div>
  );
}
