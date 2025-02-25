import React, { useState } from "react";
import { useLocation } from "@docusaurus/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-regular-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const CopyMarkdownButton = () => {
  const [ isCopied, setIsCopied ] = useState(false);
  const location = useLocation();

  if(location.pathname === '/'){
    return;
  }

  const url = `https://raw.githubusercontent.com/multiversx/mx-docs/refs/heads/main/docs${location.pathname}.md`;

  const copyMarkdownToClipboard = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Markdown file not found!");
      }

      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (error) {
      console.error("Error copying markdown: ", error);
    }  
};

  return (
   <FontAwesomeIcon 
   className={`copy-as-markdown-button ${isCopied ? 'check' : ''}`}
   onClick={copyMarkdownToClipboard}
   icon={!isCopied ? faClone : faCheck}
   />
  );
};

export default CopyMarkdownButton;