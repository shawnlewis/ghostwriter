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

export const Editor: React.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const [ghostIndex, setGhostIndex] = useState(0);
  const response = Api.useGenerate(input);

  useEffect(() => {
    setGhostIndex(0);
    const incTimer =
      response !== ""
        ? setInterval(() => {
            setGhostIndex(gi => gi + 1);
          }, 100)
        : null;
    return () => {
      if (incTimer != null) {
        clearInterval(incTimer);
      }
    };
  }, [response]);

  const [tabComplete, remainder] = nextTabComplete(
    response.slice(0, ghostIndex)
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
          setGhostIndex(0);
          setInput(e.target.value);
        }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            // tab
            e.stopPropagation();
            e.preventDefault();
            setInput(input + tabComplete);
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
