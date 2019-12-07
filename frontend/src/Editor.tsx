import React from "react";
import { useEffect, useRef, useState } from "react";

import * as Api from "./api";

export const Editor: React.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const [ghostIndex, setGhostIndex] = useState(0);
  const response = Api.useGenerate(input);

  useEffect(() => {
    setGhostIndex(0);
    const incTimer = setInterval(() => {
      setGhostIndex(gi => gi + 1);
    }, 100);
    return () => clearInterval(incTimer);
  }, [response]);

  return (
    <div className="editor">
      <div ref={backdropRef} className="backdrop">
        <div className="highlights">
          <span className="user-input">{input}</span>
          <span className="ghost-input">{response.slice(0, ghostIndex)}</span>
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
            if (response.length > 0) {
              let space = response.indexOf(" ");
              if (space === -1) {
                space = response.length;
              }
              setInput(input + " " + response.slice(0, space));
            }
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
