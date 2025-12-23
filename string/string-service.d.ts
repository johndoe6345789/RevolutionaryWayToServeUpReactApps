export interface StringServiceConfig {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  loader?: StringLoaderConfig;
  cache?: StringCacheConfig;
  validator?: StringValidatorConfig;
}

export interface StringLoaderConfig {
  filePath?: string;
}

export interface StringCacheConfig {
  maxSize?: number;
  ttl?: number;
}

export interface StringValidatorConfig {
  // Future validator configuration options
}

export interface InterpolationResult {
  isValid: boolean;
  missingParams: string[];
  unusedParams: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StringValidationResult {
  isValid: boolean;
  missing: string[];
  language: string;
}

export declare class StringLoader {
  constructor(config?: StringLoaderConfig);
  load(): Promise<any>;
  isValidStructure(data: any): boolean;
  exists(): boolean;
}

export declare class StringCache {
  constructor(config?: StringCacheConfig);
  get(key: string): any;
  set(key: string, data: any): void;
  isExpired(entry: any): boolean;
  evictOldest(): void;
  clear(): void;
  size(): number;
}

export declare class StringValidator {
  constructor(config?: StringValidatorConfig);
  isValidKey(key: string): boolean;
  validateInterpolation(template: string, params?: object): InterpolationResult;
  validateLanguageData(languageData: any): ValidationResult;
  isValidSection(section: string): boolean;
  isValidSectionData(data: any): boolean;
  validateStringData(data: any): ValidationResult;
}

export declare class StringService {
  constructor(config?: StringServiceConfig);
  initialize(): Promise<StringService>;
  ensureInitialized(): Promise<void>;
  loadData(): Promise<void>;
  get(key: string, params?: object, language?: string | null): Promise<string>;
  getError(key: string, params?: object): Promise<string>;
  getMessage(key: string, params?: object): Promise<string>;
  getLabel(key: string, params?: object): Promise<string>;
  getConsole(key: string, params?: object): Promise<string>;
  getSystem(key: string): Promise<string>;
  getConfig(key: string): any;
  getConstant(key: string): any;
  getTemplate(template: string): any;
  getMetadata(key: string): any;
  getGameData(type: string): any;
  setLanguage(language: string): void;
  getCurrentLanguage(): string;
  getAvailableLanguages(): string[];
  interpolate(template: string, params?: object): string;
  getNestedValue(obj: any, path: string): any;
  reload(): Promise<void>;
  validateStrings(keys: string[]): StringValidationResult;
}

export declare class StringFactory {
  constructor(baseConfig?: StringServiceConfig);
  create(): StringService;
  createWithConfig(config: StringServiceConfig): StringService;
  createForLanguage(language: string): StringService;
  createWithCache(maxSize: number, ttl: number): StringService;
  createWithLoader(filePath: string): StringService;
  mergeConfig(config: StringServiceConfig): StringServiceConfig;
  createFullService(): StringService;
}

export declare const stringFactory: StringFactory;
