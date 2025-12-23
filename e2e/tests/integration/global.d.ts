/**
 * Global type declarations for integration tests
 */

declare global {
  interface Window {
    __RWTRA_BOOTSTRAP_LOADED__?: boolean;
    __RWTRA_DETECTED_LANGUAGES__?: string[];
    __RWTRA_LANGUAGE_CONTEXT__?: {
      language: string;
      timestamp: string;
      projectPath?: string;
      config?: any;
    };
    __RWTRA_PLUGIN_SYSTEM__?: {
      setLanguageContext(context: any): Promise<void>;
      getLanguageContext(): any;
      getCrossLanguageBuildTargets(context: any): Promise<any[]>;
    };
    __RWTRA_SERVICE_REGISTRY__?: {
      [key: string]: any;
    };
    __RWTRA_BUILD_PIPELINE__?: {
      execute(options: any): Promise<any>;
    };
    __RWTRA_ERROR_HANDLER__?: {
      handleError(error: Error, context?: any): Promise<any>;
    };
    __RWTRA_HOT_RELOAD__?: {
      reloadPlugin(pluginName: string): Promise<any>;
    };
    __RWTRA_LOADED_PLUGINS__?: {
      [key: string]: any;
    };
    __RWTRA_BUILD_VALIDATOR__?: {
      getCrossLanguageTargets(
        sourceLang: string,
        targetLang: string,
      ): Promise<any[]>;
    };
    __RWTRA_CONFIG_MANAGER__?: {
      loadConfig(): Promise<any>;
      getConfig(): Promise<any>;
      updateConfig(config: any): Promise<void>;
    };
    __RWTRA_LOGGER__?: {
      debug(message: string, context?: any): Promise<void>;
      info(message: string, context?: any): Promise<void>;
      warn(message: string, context?: any): Promise<void>;
      error(message: string, context?: any): Promise<void>;
      getLogs(): Promise<any[]>;
    };
  }
}

export {};
