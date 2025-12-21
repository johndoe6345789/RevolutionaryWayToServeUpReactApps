export = GlobalRootHandler;

declare class GlobalRootHandler {
  constructor(root?: any);
  root: any;
  namespace: Record<string, any>;
  helpers: Record<string, any>;
  getNamespace(): Record<string, any>;
  getDocument(): Document | undefined;
  hasWindow(): boolean;
  hasDocument(): boolean;
}
