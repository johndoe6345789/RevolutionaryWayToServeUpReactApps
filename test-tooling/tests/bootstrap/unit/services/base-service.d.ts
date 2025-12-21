import ServiceRegistry = require("./service-registry.js");

export = BaseService;

declare class BaseService {
  constructor(config?: Record<string, unknown>);
  protected config: Record<string, unknown>;
  protected initialized: boolean;
  protected _ensureNotInitialized(): void;
  protected _markInitialized(): void;
  protected _ensureInitialized(): void;
  protected _requireServiceRegistry(): ServiceRegistry;
  protected _resolveNamespace(): Record<string, unknown>;
  initialize(): this;
}
