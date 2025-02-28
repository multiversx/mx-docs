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
        className="rounded-lg bg-black dark:bg-teal-400 px-2.5 py-1.5 text-sm font-semibold text-teal-300 dark:text-black shadow-sm hover:bg-neutral-800 dark:hover:bg-teal-500 outline-none border-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 inline-flex items-center justify-center"
        onClick={openModal}
        style={{ position: "relative", marginRight: "auto" }}
      >
        <FontAwesomeIcon
          icon={faRobot}
          className="text-center text-primary text-sm dark:text-black text-teal-300"
        />
        <span className="pl-2">Ask AI</span>
        <div
          className="betaBadge-wrapper rainbow"
          style={{
            position: "absolute",
            color: "var(--body-color)",
            left: "100%",
            bottom: "100%",
            transform: "translate(-50%, 50%)",
          }}
        >
          <div className="betaBadge">Beta</div>
        </div>
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Popup"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.5)" },
          content: {
            maxWidth: "min(1200px, calc(100% - 32px))",
            position: "fixes",
            margin: "auto",
            marginTop: "70px",
            minHeight: "80vh",
            maxHeight: "80vh",
            zIndex: "10000",
            padding: "0px",
            background: "none",
            border: "none",
            overflow: "hidden",
          },
        }}
      >
        <ChatWindow onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default AskAiButton;
