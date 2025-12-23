import type {
  Action,
  Reducer,
  Store,
  Dispatch,
  Middleware,
  MiddlewareAPI,
} from '../types/messaging';

/**
 * Redux-like store implementation for internal messaging
 * Provides loose coupling between components through actions and state
 */
export class MessagingStore<S, A extends Action> implements Store<S, A> {
  private state: S;
  private reducer: Reducer<S, A>;
  private listeners: Set<() => void> = new Set();
  private middleware: Middleware<S, A>[] = [];
  private isDispatching = false;

  constructor(reducer: Reducer<S, A>, initialState: S, middleware: Middleware<S, A>[] = []) {
    this.reducer = reducer;
    this.state = initialState;
    this.middleware = middleware;
  }

  getState(): Readonly<S> {
    return this.state;
  }

  dispatch(action: Readonly<A>): void {
    if (this.isDispatching) {
      throw new Error('Messaging store: Reducers may not dispatch actions.');
    }

    try {
      this.isDispatching = true;
      this.state = this.applyMiddleware(action);
    } finally {
      this.isDispatching = false;
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private applyMiddleware(action: Readonly<A>): S {
    if (this.middleware.length === 0) {
      return this.reducer(this.state, action);
    }

    // Build middleware chain
    const api: MiddlewareAPI<S, A> = {
      getState: () => this.state,
      dispatch: (action: Readonly<A>) => this.dispatch(action),
    };

    // Compose middleware from right to left
    let dispatch: (action: Readonly<A>) => S = (action: Readonly<A>) => this.reducer(this.state, action);

    for (let i = this.middleware.length - 1; i >= 0; i--) {
      const middleware = this.middleware[i];
      dispatch = middleware(api)(dispatch);
    }

    return dispatch(action);
  }
}

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
