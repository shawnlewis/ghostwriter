import React from "react";
import { useEffect, useRef, useState } from "react";

import * as Api from "./api";

const nextTabComplete = (text: string) => {
  const result = text.match(/([^\w]*[\w]+)/);
  if (result == null) {
    return ["", text];
  }
  const tabComplete = result[1];
  return [tabComplete, text.slice(tabComplete.length)];
};

const maxContext = 400;
const maxGhostText = 400;

export const Editor: React.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [ghostText, setGhostText] = useState("");

  const [ghostIndex, setGhostIndex] = useState(0);
  const fullContext = input + ghostText;
  const context = fullContext.slice(fullContext.length - maxContext);
  const response = Api.useGenerate(context);

  useEffect(() => {
    const nextGhostText = ghostText + response;
    if (nextGhostText.length < maxGhostText) {
      setGhostText(nextGhostText.slice(0, maxGhostText));
    }
  }, [response]);

  useEffect(() => {
    const incTimer =
      ghostText !== ""
        ? setInterval(() => {
            setGhostIndex(gi => gi + 1);
          }, 100)
        : null;
    return () => {
      if (incTimer != null) {
        clearInterval(incTimer);
      }
    };
  }, [ghostText]);

  const [tabComplete, remainder] = nextTabComplete(
    ghostText.slice(0, ghostIndex)
  );

  return (
    <div className="editor">
      <div ref={backdropRef} className="backdrop">
        <div className="highlights">
          <span className="user-input">{input}</span>
          <span className="suggestion">{tabComplete}</span>
          <span className="ghost-input">{remainder}</span>
        </div>
      </div>
      <textarea
        ref={textAreaRef}
        value={input}
        onChange={e => {
          const fullText = input + ghostText;
          const newInput = e.target.value;
          setInput(newInput);
          if (
            newInput.length < input.length ||
            !fullText.startsWith(newInput)
          ) {
            setGhostIndex(0);
            setGhostText("");
          } else {
            setGhostText(ghostText.slice(newInput.length - input.length));
          }
        }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            // tab
            e.stopPropagation();
            e.preventDefault();
            setInput(input + tabComplete);
            setGhostText(remainder);
          }
        }}
        onScroll={() => {
          if (textAreaRef.current != null && backdropRef.current != null) {
            backdropRef.current.scrollTop = textAreaRef.current.scrollTop;
          }
        }}
      ></textarea>
    </div>
  );
};
