import { IGlobalHandler } from "../interfaces/IGlobalHandler";

export = GlobalRootHandler;

declare class GlobalRootHandler implements IGlobalHandler {
  constructor(root?: unknown);
  readonly root: unknown;
  getNamespace(): Record<string, unknown>;
  get helpers(): Record<string, unknown>;
  getDocument(): Document | undefined;
  getFetch(): ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined;
  getLogger(tag?: string): (msg: string, data?: unknown) => void;
  hasWindow(): boolean;
  hasDocument(): boolean;
}
