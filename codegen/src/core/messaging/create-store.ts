import type { Action } from '../types/messaging';
import type { Reducer } from '../types/reducer';
import type { Store } from '../types/store';
import type { Middleware } from '../types/middleware';
import { MessagingStore } from './messaging-store';

/**
 * Factory function to create a messaging store
 */
export function createStore<S, A extends Action>(
  reducer: Reducer<S, A>,
  initialState: S,
  middleware: Middleware<S, A>[] = []
): Store<S, A> {
  return new MessagingStore(reducer, initialState, middleware);
}
