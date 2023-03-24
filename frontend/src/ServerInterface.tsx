import {useCallback, useMemo} from "react";

import * as Api from "./api";
import * as Lib from "./lib";

const BACKEND = Lib.isDev()
    ? "http://localhost:9911"
    : "https://api.ghostwrite.ai";

// Create a random id for the user to use as a session id
const sessionId = Math.random().toString(36).substring(2, 15);

export type ServerInterfaceType = {
    getPrediction: (inputText: string, onResult: (resp: string) => void) => void;
    getModels: (onResult: (models: {[id: string]: {name: string}}) => void) => void;
}

export const useServerInterface = (modelId: string, username: string): ServerInterfaceType => {
    const getPrediction = useCallback((inputText: string, onResult: (resp: string) => void) => {
        Api.postData(`${BACKEND}/generate`, {
            text: inputText,
            modelId,
            username,
            sessionId
        }).then((result) => {
            onResult(result.result);
        });
    }, [modelId, username])

    const getModels = useCallback((onResult: (models: {[id: string]: {name: string}}) => void) => {
        Api.postData(`${BACKEND}/models`).then((result) => {
            onResult(result);
        })
    }, [])
    

    return useMemo(() => ({
        getPrediction,
        getModels
    }), [getPrediction, getModels])
}