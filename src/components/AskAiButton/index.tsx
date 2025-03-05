import React from "react";
import { useState } from "react";
import Modal from "react-modal";
import ChatWindow from "./ChatWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";

const AskAiButton = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    document.body.classList.add("no-scroll");
    setModalIsOpen(true);
  };

  const closeModal = () => {
    document.body.classList.remove("no-scroll");

    setModalIsOpen(false);
  };

  return (
    <div>
      {/* <button className="" onClick={openModal}>
        <img width="15" src={assistantAvatar} />{" "}
        <span className="leading-[20px]">Ask AI</span>
      </button> */}

      <button
        className="rounded-lg bg-black  dark:bg-teal-400 px-2.5 py-1.5 text-sm font-semibold text-teal-300 dark:text-black shadow-sm hover:bg-neutral-800 dark:hover:bg-teal-500 outline-none border-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 inline-flex items-center justify-center"
        onClick={openModal}
        style={{ position: "relative", marginRight: "auto" }}
      >
        <FontAwesomeIcon
          icon={faRobot}
          className="text-center text-primary text-sm dark:text-black text-teal-300"
          width="16px"
          height="16px"
        />
        <span className="pl-2">Ask AI</span>
        <div className="absolute -top-2 right-full lg:left-full lg:right-auto -mr-3 lg:-ml-5 lg:mr-0 h-5 px-1 bg-gradient-to-tr from-[#bc82f3] via-[#FFAC73] to-[#c686ff] rounded-lg justify-center items-center inline-flex pointer-events-none">
          <div className="p-0.5 rounded-lg justify-center items-center flex">
            <span className="text-center text-black text-xs font-bold leading-none">
              BETA
            </span>
          </div>
        </div>
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Popup"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 200 },
          content: {
            position: "fixes",
            zIndex: "10000",
            backgroundColor: "rgba(0,0,0,0.15)",
            height: "100vh",
            padding: "0px",
            background: "none",
            border: "none",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <ChatWindow onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default AskAiButton;
