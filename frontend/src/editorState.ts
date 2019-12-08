import { useReducer } from "react";

interface EditorState {
  input: string;
}

interface SetUserInputAction {
  type: "setUserInput";
  input: string;
}

type EditorAction = SetUserInputAction;

export function reducer(state: EditorState, action: EditorAction) {
  switch (action.type) {
    case "setUserInput":
      return { ...state, input: action.input };
    default:
      throw new Error();
  }
}

export function useEditorReducer() {
  return useReducer(reducer, { input: "" });
}
