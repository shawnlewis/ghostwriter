import { useEffect, useCallback, useRef } from "react";
import { useReducer } from "./reinspect/useReducer";

import * as Api from "./api";
import * as Lib from "./lib";

const MAX_CONTEXT = 800;
const MAX_GHOST_TEXT = 400;

interface EditorState {
  input: string;
  ghostText: string;
  ghostIndex: number;
  reqID: number;
}

interface SetUserInputAction {
  type: "setUserInput";
  input: string;
}

interface HandleGenerateRequestStarted {
  type: "handleGenerateRequestStarted";
  reqID: number;
}

interface HandleGenerateResponse {
  type: "handleGenerateResponse";
  response: string;
  reqID: number;
}

interface HandleTick {
  type: "handleTick";
}

interface HandleTab {
  type: "handleTab";
}

type EditorAction =
  | SetUserInputAction
  | HandleTab
  | HandleGenerateRequestStarted
  | HandleGenerateResponse
  | HandleTick;

export function reducer(state: EditorState, action: EditorAction) {
  switch (action.type) {
    case "setUserInput":
      const fullText = state.input + state.ghostText;
      if (
        action.input.length < state.input.length ||
        !fullText.startsWith(action.input)
      ) {
        // The user typed something new
        return {
          ...state,
          input: action.input,
          reqID: state.reqID + 1,
          ghostText: "",
          ghostIndex: 0
        };
      } else {
        // The user typed exactly what's in the ghost text, so
        // keep it.
        return {
          ...state,
          input: action.input,
          ghostText: state.ghostText.slice(
            action.input.length - state.input.length
          )
        };
      }
    case "handleTab":
      const [tabComplete, remainder] = Lib.nextTabComplete(state.ghostText);
      return {
        ...state,
        input: state.input + tabComplete,
        ghostText: remainder
      };
    case "handleGenerateRequestStarted":
      return { ...state, reqID: action.reqID };
    case "handleGenerateResponse":
      if (action.reqID !== state.reqID) {
        return state;
      }
      const ghostText = (state.ghostText + action.response).slice(
        0,
        MAX_GHOST_TEXT
      );
      return { ...state, ghostText: ghostText };
    case "handleTick":
      return {
        ...state,
        ghostIndex:
          state.ghostIndex < state.ghostText.length
            ? state.ghostIndex + 1
            : state.ghostIndex
      };
    default:
      throw new Error();
  }
}

export function useEditorReducer() {
  const [state, dispatch] = useReducer(
    reducer,
    {
      input: "",
      ghostText: "",
      ghostIndex: 0,
      reqID: 0
    },
    state => state,
    "Editor"
  );

  useEffect(() => {
    const tickTimer = setInterval(() => {
      dispatch({ type: "handleTick" });
    }, 100);
    return () => {
      clearInterval(tickTimer);
    };
  }, []);

  const reqDebounceTimer = useRef<NodeJS.Timeout>();

  const makeGenerateRequest = useCallback(() => {
    const reqID = state.reqID + 1;
    const fullContext = state.input + state.ghostText;
    const reqContext = fullContext.slice(fullContext.length - MAX_CONTEXT);
    dispatch({ type: "handleGenerateRequestStarted", reqID });
    Api.postData("http://localhost:5000/generate", {
      text: reqContext
    }).then(result => {
      const response = result.result[0];
      dispatch({ type: "handleGenerateResponse", reqID, response });
    });
  }, [state.ghostText, state.input, state.reqID]);

  const makeGenerateRequestDebounced = useCallback(() => {
    if (reqDebounceTimer.current != null) {
      clearTimeout(reqDebounceTimer.current);
    }
    reqDebounceTimer.current = setTimeout(makeGenerateRequest, 500);
  }, [makeGenerateRequest]);

  useEffect(() => {
    makeGenerateRequestDebounced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.input]);

  const setInput = useCallback((input: string) => {
    dispatch({ type: "setUserInput", input });
  }, []);

  const handleTab = useCallback(() => dispatch({ type: "handleTab" }), []);

  return { state, setInput, handleTab };
}
