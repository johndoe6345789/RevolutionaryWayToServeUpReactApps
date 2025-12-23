// Core domain exports organized by functionality
export { Aggregate } from './aggregation/aggregate';
export { BaseAggregator } from './aggregation/base-aggregator';
export { BaseCodegen } from './codegen/base-codegen';
export { BaseComponent } from './codegen/base-component';
export { BasePlugin } from './plugins/base-plugin';
export { Plugin } from './plugins/plugin';
export { Registry } from './registry/registry';
export { SpecValidator } from './validation/spec-validator';
export { DependencyInjection } from './di/dependency-injection';

// Plugin system exports
export { PluginSpecLoader } from './plugins/plugin-spec-loader';
export { PluginMessageLoader } from './plugins/plugin-message-loader';
export { PluginDependencyLinter } from './plugins/plugin-dependency-linter';

// Aggregators
export { CodegenAggregator } from './aggregators/codegen-aggregator';
export { ExecutionAggregator } from './aggregators/execution-aggregator';
export { PluginAggregator } from './aggregators/plugin-aggregator';

// Infrastructure - NEW: Functional error handling and logging
export { logger, log } from './logging/logger';
export type { Result } from './types/result';
export type { ResultAsync } from './types/result-async';
export { ok } from './types/ok';
export { err } from './types/err';
export { isOk } from './types/is-ok';
export { isErr } from './types/is-err';
export { map } from './types/map';
export { andThen } from './types/and-then';
export { collect } from './types/collect';

// Re-export interfaces
export type * from './interfaces/index';
