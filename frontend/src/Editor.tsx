import React from "react";
import { useRef } from "react";

import { useEditorReducer } from "./editorState";
import * as Lib from "./lib";

const renderNewLines = (text: string) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

export const Editor: React.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const { state, setInput, handleTab } = useEditorReducer();
  const { input, ghostText, ghostIndex } = state;

  const [tabComplete, remainder] = Lib.nextTabComplete(
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Tab") {
              // Tab complete
              e.stopPropagation();
              e.preventDefault();
              handleTab();
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
