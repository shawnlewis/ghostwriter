import {useCallback} from "react";

import * as Api from "./api";
import * as Lib from "./lib";

const BACKEND = Lib.isDev()
  ? "http://localhost:9911"
  : "http://34.83.36.112:5000";

// Create a random id for the user to use as a session id
const sessionId = Math.random().toString(36).substring(2, 15);

export type ServerInterfaceType = {
    getPrediction: (inputText: string, onResult: (resp: string) => void) => void;
}

export const useServerInterface = (modelId: string, username: string): ServerInterfaceType => {
    const getPrediction = useCallback((inputText: string, onResult: (resp: string) => void) => {
        Api.postData(`${BACKEND}/generate`, {
            text: inputText,
            modelId,
            username,
            sessionId
        }).then((result) => {
            const response = result.result;
            onResult(response);
        });
    }, [modelId, username])

    return {
        getPrediction
    }
}