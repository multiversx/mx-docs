import React from "react";
import Link from "@docusaurus/Link";
import { faBook, faHammer, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const TAG = "Sovereign Chains";
const TITLE = "Build and deploy custom L2s or Appchains";
const SUBTITLE =
  "Enable new types of use cases made possible by scalable, efficient, secure and dedicated blockchains - powered by the Sovereign Chain SDK.";

const Promo = () => {
  return (
    <section className="">
      <div className="">
        <p>{TAG}</p>
        <h1>{TITLE}</h1>
        <p>{SUBTITLE}</p>
        <div className="">
          <video
            id="promo-video"
            //style='background-image:url("videos/sov-animation-loop-header-poster-00001.jpg")'
            loop
            playsInline
            autoPlay
            muted
          >
            <source src="videos/sov-animation-loop-header-transcode.mp4" />
            <source src="videos/sov-animation-loop-header-transcode.webm" />
          </video>
        </div>
      </div>
    </section>
  );
};

export default Promo;
