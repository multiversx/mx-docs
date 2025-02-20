import React from "react";
import { useState } from "react";
import Modal from "react-modal";
import ChatWindow from "./ChatWindow";
import assistantAvatar from "@site/static/img/favicons/android-chrome-192x192.png";

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
      <button className="" onClick={openModal}>
        <img width="15" src={assistantAvatar} />{" "}
        <span className="leading-[20px]">Ask AI</span>
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
