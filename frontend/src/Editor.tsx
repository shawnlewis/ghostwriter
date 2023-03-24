import React, { useLayoutEffect, useEffect } from "react";
import { useRef, useMemo } from "react";

import { useEditorReducer } from "./editorState";
import * as Lib from "./lib";
import {ServerInterfaceType} from "./ServerInterface";

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

export const Editor: React.FC<{serverInterface: ServerInterfaceType}> = ({serverInterface}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const { state, setInput, handleTab } = useEditorReducer(serverInterface);
  const { input, ghostText, ghostIndex } = state;

  const [tabComplete, remainder] = useMemo(
    () => Lib.nextTabComplete(ghostText.slice(0, ghostIndex)),
    [ghostText, ghostIndex]
  );

  // Scroll to bottom when ghost types, if we're near the bottom.
  useLayoutEffect(() => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - 30
    ) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [state.ghostIndex]);

  useEffect(() => {
    if (textAreaRef.current != null) {
      textAreaRef.current.focus();
    }
  }, []);

  const height =
    backdropRef.current != null ? backdropRef.current.clientHeight + 100 : 100;

  return (
    <div className="editor" style={{ height }}>
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
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
