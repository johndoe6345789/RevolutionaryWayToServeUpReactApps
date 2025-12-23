// Internal Messaging Service Types
// Redux-like store pattern for inter-class communication

export type Action<T extends string = string, P = unknown> = Readonly<{
  type: T;
  payload?: P;
  meta?: Record<string, unknown>;
}>;

export type Reducer<S, A extends Action> = (state: Readonly<S>, action: Readonly<A>) => S;

export type Unsubscribe = () => void;

export type Store<S, A extends Action> = Readonly<{
  getState: () => Readonly<S>;
  dispatch: (action: Readonly<A>) => void;
  subscribe: (listener: () => void) => Unsubscribe;
}>;

export type Dispatch<A extends Action> = (action: Readonly<A>) => void;

export type MiddlewareAPI<S, A extends Action> = Readonly<{
  getState: () => Readonly<S>;
  dispatch: Dispatch<A>;
}>;

export type Middleware<S, A extends Action> = (
  api: MiddlewareAPI<S, A>,
) => (next: Dispatch<A>) => (action: Readonly<A>) => void;
