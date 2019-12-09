import {
  Reducer,
  useMemo,
  Dispatch,
  useState,
  useReducer as useReducerReact,
  useEffect,
  useContext,
  ReducerState,
  ReducerAction
} from "react";
import { Action } from "redux";
import { StateInspectorContext, EnhancedStore } from "./context";

export function useHookedReducer<S, A extends Action<any>>(
  reducer: Reducer<S, A>,
  initialState: S,
  store: EnhancedStore,
  reducerId: string | number
): [S, Dispatch<A>] {
  const initialReducerState = useMemo(() => {
    const initialStateInStore = store.getState()[reducerId];
    return initialStateInStore === undefined
      ? initialState
      : initialStateInStore;
    // eslint-disable-next-line
  }, []);

  const [localState, setState] = useState<S>(initialReducerState);

  const dispatch = useMemo<Dispatch<A>>(() => {
    const dispatch = (action: A) =>
      store.dispatch({
        type: action.type ? `${reducerId}/${action.type}` : reducerId,
        payload: action
      });

    return dispatch;
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const teardown = store.registerHookedReducer<S, A>(
      reducer as any,
      initialReducerState,
      reducerId
    );

    let lastReducerState = localState;
    const unsubscribe = store.subscribe(() => {
      const storeState: any = store.getState();
      const reducerState = storeState[reducerId];

      if (lastReducerState !== reducerState) {
        setState(reducerState);
      }

      lastReducerState = reducerState;
    });

    return () => {
      unsubscribe();
      teardown();
    };
    // eslint-disable-next-line
  }, []);

  return [localState, dispatch];
}

export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initialState: I,
  initializer: (arg: I) => ReducerState<R>,
  id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initialState: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>,
  id?: string | number
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: any,
  initialState: any,
  ...args: any
) {
  let id: string | number | undefined;
  let initializer:
    | ((arg: I | (I & ReducerState<R>)) => ReducerState<R>)
    | undefined;

  if (args.length === 2) {
    initializer = args[0];
    id = args[1];
  } else if (typeof args[0] === "string" || typeof args[0] === "number") {
    id = args[0];
  } else {
    initializer = args[0];
  }

  const store = useContext(StateInspectorContext);

  const initializedState = initializer
    ? initializer(initialState)
    : initialState;

  if (store != null) {
    // eslint-disable-next-line
    return useHookedReducer(reducer, initializedState, store, id as any);
  } else {
    // eslint-disable-next-line
    return useReducerReact(reducer, initializedState)
  }
}
