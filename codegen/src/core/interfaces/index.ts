/**
 * Interfaces index - exports all AGENTS.md compliant interfaces
 * One interface per file for clean separation and maintainability
 * Now organized into domain-specific subdirectories
 */

// Codegen interfaces
export type { IBaseCodegenOptions } from './codegen/ibase-codegen-options';
export type { ICodegenExecutionResults } from './codegen/icodegen-execution-results';
export type { ILanguageGenerator } from './codegen/ilanguage-generator';
export type { CodeGenerationContext } from './codegen/code-generation-context';
export type { GeneratedCode } from './codegen/generated-code';

// Common interfaces
export type { IAdapter } from './common/iadapter';
export type { IComponent } from './common/icomponent';
export type { IDependencyInjectionContainer } from './common/idependency-injection-container';
export type { ILifecycleManager } from './common/ilifecycle-manager';
export type { LifecycleState } from './common/lifecycle-state';
export type { IStandardLifecycle } from './common/istandard-lifecycle';
export { LifecycleStatus } from './common/lifecycle-status';

// Plugin interfaces
export type { IPlugin } from './plugins/iplugin';
export type { IPluginConfig } from './plugins/iplugin-config';
export type { IPluginExecutionResult } from './plugins/iplugin-execution-result';
export type { IPluginInfo } from './plugins/iplugin-info';
export type { IPluginRegistryManager } from './plugins/iplugin-registry-manager';

// Registry interfaces
export type { IRegistry } from './registry/iregistry';
export type { IRegistryManager } from './registry/iregistry-manager';

// Search interfaces
export type { ISearchMetadata } from './search/isearch-metadata';
export type { ISearchMetadataForValidation } from './search/isearch-metadata-for-validation';

// Spec interfaces
export type { ISpec } from './specs/ispec';
export type { ISpecForValidation } from './specs/ispec-for-validation';
export type { ISpecValidatorOptions } from './specs/ispec-validator-options';

// System interfaces
export type { ISystemStatus } from './system/isystem-status';
export type { IValidationResult } from './system/ivalidation-result';
