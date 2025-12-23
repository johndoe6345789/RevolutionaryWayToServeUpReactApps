import type { Action } from '../types/messaging';
import type { Reducer } from '../types/reducer';

/**
 * Combine multiple reducers into a single reducer
 */
export function combineReducers<S, A extends Action>(
  reducers: Record<string, Reducer<any, A>>
): Reducer<S, A> {
  return (state: S, action: A) => {
    const nextState = { ...state };

    for (const [key, reducer] of Object.entries(reducers)) {
      (nextState as any)[key] = reducer((state as any)[key], action);
    }

    return nextState;
  };
}
