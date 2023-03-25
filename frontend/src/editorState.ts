import { useEffect, useCallback, useRef } from "react";
import { useReducer } from "./reinspect/useReducer";

import * as Lib from "./lib";
import {ServerInterfaceType} from "./ServerInterface";

const MAX_CONTEXT = 800;

interface EditorState {
  input: string;
  ghostText: string;
  ghostIndex: number;
  reqID: number;
  predID: string;
  acceptedText: string;
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
  response: {
    result: string;
    predictionId: string;
  };
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
          ghostIndex: 0,
          acceptedText: "",
        };
      } else {
        // The user typed exactly what's in the ghost text, so
        // keep it.
        const acceptedLength = action.input.length - state.input.length;
        const acceptedText = state.ghostText.slice(0, acceptedLength);
        const remainder = state.ghostText.slice(acceptedLength);
        return {
          ...state,
          input: action.input,
          ghostText: remainder,
          acceptedText: state.acceptedText + acceptedText,
        };
      }
    case "handleTab":
      const [tabComplete, remainder] = Lib.nextTabComplete(
        state.ghostText.slice(0, state.ghostIndex)
      );
      return {
        ...state,
        input: state.input + tabComplete,
        ghostText: remainder,
        ghostIndex: state.ghostIndex - tabComplete.length,
        acceptedText: state.acceptedText + tabComplete,
      };
    case "handleGenerateRequestStarted":
      return { ...state, reqID: action.reqID };
    case "handleGenerateResponse":
      if (action.reqID !== state.reqID) {
        return state;
      }
      console.log("RESPONSE", action.response);
      const ghostText = state.ghostText + action.response.result;
      return { ...state, ghostText: ghostText, predID: action.response.predictionId, acceptedText:""};
    case "handleTick":
      return {
        ...state,
        ghostIndex:
          state.ghostIndex < state.ghostText.length
            ? state.ghostIndex + 1
            : state.ghostIndex,
      };
    default:
      throw new Error();
  }
}

export function useEditorReducer(serverInterface: ServerInterfaceType) {
  const [state, dispatch] = useReducer(
    reducer,
    {
      input: "",
      ghostText: "",
      ghostIndex: 0,
      reqID: 0,
      predID: "",
      acceptedText: "",
    },
    (state) => state,
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
    // if (state.predID !== "" && state.acceptedText !== "") {
    //   serverInterface.recordAcceptance(state.predID, state.acceptedText)
    // }
    serverInterface.getPrediction(reqContext, (response) => {
      dispatch({ type: "handleGenerateResponse", reqID, response });
    });
  }, [state.ghostText, state.input, state.reqID, serverInterface]); //, state.predID, state.acceptedText]);

  const makeGenerateRequestDebounced = useCallback(() => {
    if (reqDebounceTimer.current != null) {
      clearTimeout(reqDebounceTimer.current);
    }
    reqDebounceTimer.current = setTimeout(makeGenerateRequest, 500);
  }, [makeGenerateRequest]);

  useEffect(() => {
    if (state.ghostIndex == 0 && state.input.length > 0) {
      makeGenerateRequestDebounced();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [state.input, state.ghostIndex]);

  const setInput = useCallback((input: string) => {
    const fullText = state.input + state.ghostText;
    if (
      input.length < state.input.length ||
      !fullText.startsWith(input)
    ) {
      if (state.predID !== "" && state.acceptedText !== "") {
        serverInterface.recordAcceptance(state.predID, state.acceptedText)
      }
    }
    dispatch({ type: "setUserInput", input });
  }, [state.input, state.ghostText, state.predID, state.acceptedText]);

  const handleTab = useCallback(() => dispatch({ type: "handleTab" }), []);

  return { state, setInput, handleTab };
}
