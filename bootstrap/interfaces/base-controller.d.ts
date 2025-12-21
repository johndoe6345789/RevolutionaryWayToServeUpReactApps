export = BaseController;

declare class BaseController {
  constructor(config?: Record<string, unknown>);
  protected config: Record<string, unknown>;
  protected initialized: boolean;
  protected _ensureNotInitialized(): void;
  protected _markInitialized(): void;
  protected _ensureInitialized(): void;
  initialize(): this;
}
