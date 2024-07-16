import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TAG = "Sovereign Chains";
const TITLE = "Build and deploy custom L2s or Appchains";
const SUBTITLE =
  "Enable new types of use cases made possible by scalable, efficient, secure and dedicated blockchains - powered by the Sovereign Chain SDK.";

const Promo = () => {
  return (
    <div className="h-[706px] py-32 bg-black rounded-[40px] flex-col justify-center items-center gap-32 inline-flex overflow-hidden">
      <video
        id="promo-video"
        //style='background-image:url("videos/sov-animation-loop-header-poster-00001.jpg")'
        loop
        playsInline
        autoPlay
        muted
        className="absolute z-0 rounded-[48px]"
      >
        <source src="videos/sov-animation-loop-header-transcode.mp4" />
        <source src="videos/sov-animation-loop-header-transcode.webm" />
      </video>
      <div className="absolute z-1 h-[326px] flex-col justify-start items-center gap-14 inline-flex">
        <div className="flex-col justify-start items-center gap-4 flex">
          <div className="h-7 px-[7px] bg-teal-400/10 rounded-[48px] border border-solid border-green-600/70 backdrop-blur-[36px] justify-center items-center inline-flex">
            <div className="self-stretch px-1.5 justify-center items-center gap-2 flex">
              <div className="opacity-60 text-center text-teal-200 text-base font-normal leading-none">
                {TAG}
              </div>
            </div>
          </div>
          <div className="w-[686px] text-center text-neutral-200 text-[56px] font-medium leading-[56px]">
            {TITLE}
          </div>
          <div className="w-[700px] text-center text-neutral-500 text-[21px] font-normal leading-relaxed">
            {SUBTITLE}
          </div>
        </div>
        <div className="h-[222px] bg-zinc-950 rounded-[879px] blur-[76px]" />
        <div className="justify-center items-start gap-2 inline-flex">
          <Link
            to="/sovereign"
            className={clsx(
              "bg-teal-400 rounded-xl justify-center items-center flex hover:no-underline"
            )}
          >
            <div className="w-3 h-12 relative" />
            <div className="px-4 py-3 rounded-lg justify-center items-center gap-2 flex">
              <div className="text-center text-gray-950 text-lg font-semibold leading-normal">
                Sovereign Chains Documentation
              </div>
            </div>
            <Link
              to="/sovereign"
              className={clsx("p-[9px] justify-center items-center flex")}
            >
              <div className="w-[30px] h-[30px] justify-center items-center flex">
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="w-6 text-center text-gray-950 text-2xl font-black"
                />
              </div>
            </Link>
            <div className="w-3 h-12 relative" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Promo;
