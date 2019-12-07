import React from "react";
import { useEffect, useRef, useState } from "react";

import * as Api from "./api";

const maxContext = 400;
const maxGhostText = 400;

const nextTabComplete = (text: string) => {
  const result = text.match(/([^\w]*[\w]+)/);
  if (result == null) {
    return ["", text];
  }
  const tabComplete = result[1];
  return [tabComplete, text.slice(tabComplete.length)];
};

const renderNewLines = (text: string) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <>
          {line}
          {i !== lines.length - 1 && <br />}
        </>
      ))}
    </>
  );
};

export const Editor: React.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [ghostText, setGhostText] = useState("");
  const [ghostIndex, setGhostIndex] = useState(0);

  // Get suggestions beyond our current user input + the ghost
  // text we already have.
  const fullContext = input + ghostText;
  const context = fullContext.slice(fullContext.length - maxContext);
  const response = Api.useGenerate(context);

  // Increase ghost text if we don't have enough.
  useEffect(() => {
    const nextGhostText = ghostText + response;
    if (nextGhostText.length < maxGhostText) {
      setGhostText(nextGhostText.slice(0, maxGhostText));
    }
  }, [response, ghostText]);

  // Ghost text typing interval, active when we have some ghost
  // text
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
          <span className="user-input">{renderNewLines(input)}</span>
          <span className="suggestion">{renderNewLines(tabComplete)}</span>
          <span className="ghost-input">{renderNewLines(remainder)}</span>
        </div>
      </div>
      <div className="textarea">
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
              // The user typed something new
              setGhostIndex(0);
              setGhostText("");
            } else {
              // The user typed exactly what's in the ghost text, so
              // keep it.
              setGhostText(ghostText.slice(newInput.length - input.length));
            }
          }}
          onKeyDown={e => {
            if (e.key === "Tab") {
              // Tab complete
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
    </div>
  );
};
