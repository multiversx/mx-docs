import React, { useEffect, useRef } from "react";
import clsx from "clsx";

import Community from "../Community";
import Features from "../Features";
import Hero from "../Hero";
import Promo from "../Promo";
import Resources from "../Resources";

import "./homepage.css";
import { debounce, handleScroll, throttle } from "./helpers";

export default function Homepage() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current !== null) {
      if (window.scrollY > 100) {
        document.documentElement.style.setProperty("--navbar-transparency", 0.75);
        document.documentElement.style.setProperty("--navbar-blur", 0.375);
      }

      window.addEventListener(
        "scroll",
        throttle(debounce(() => handleScroll(ref)))
      );
      return () =>
        window.removeEventListener(
          "scroll",
          throttle(debounce(() => handleScroll(ref)))
        );
    }
  }, []);

  return (
    <div
      className={clsx("container font-medium flex-col inline-flex")}
      ref={ref}
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
          <stop offset="0%" stopColor="#00FFC2"></stop>
          <stop offset="100%" stopColor="#28CAE0"></stop>
        </linearGradient>
      </svg>
      <div
        className={clsx("py-4 gap-24 sm:py-24 sm:gap-24 flex-col inline-flex")}
      >
        <Hero />
        <Features />
        <Promo />
        <Community />
        <Resources />
      </div>
    </div>
  );
}
