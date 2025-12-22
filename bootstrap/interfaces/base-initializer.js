const { getStringService } = require('../services/string-service');

/**
 * Base skeleton class for initializer classes.
 * Provides common implementation of IInitializer interface methods.
 */
class BaseInitializer {
  /**
   * Creates a new BaseInitializer instance for a service.
   * @param service - The service to be initialized
   */
  constructor(service) {
    const strings = getStringService();
    
    if (!service) {
      throw new Error(strings.getError('service_required'));
    }
    
    this.service = service;
    this.config = service.config || {};
    this._errors = [];
    this._initialized = false;
  }

  /**
   * Validates that required dependencies are available before initialization.
   * @throws Error if validation fails
   */
  validateDependencies() {
    const strings = getStringService();
    // Base implementation - can be overridden by subclasses
    if (!this.service) {
      throw new Error(strings.getError('service_required_initialization'));
    }
  }

  /**
   * Performs any cleanup or finalization steps after initialization.
   */
  finalize() {
    // Base implementation - can be overridden by subclasses
    this._errors = [];
  }

  /**
   * Gets the initialization status.
   * @returns True if initialization is complete, false otherwise
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Gets any errors that occurred during initialization.
   * @returns Array of error messages or empty array if no errors
   */
  getErrors() {
    return [...this._errors];
  }

  /**
   * Executes the initialization lifecycle for the service.
   * Template method that should be called by subclasses.
   */
  run() {
    this._errors = [];
    this._initialized = false;
    
    try {
      this._logStart();
      
      // Execute initialization steps
      this.validateDependencies();
      this._initializeService();
      this._registerService();
      this._finalizeInitialization();
      
      this._initialized = true;
      this._logSuccess();
      
    } catch (error) {
      this._errors.push(error.message);
      this._logError(error);
      throw error;
    }
  }

  /**
   * Template method for service-specific initialization logic.
   * Should be overridden by subclasses.
   * @protected
   */
  _initializeService() {
    const strings = getStringService();
    // Base implementation - override in subclasses
    this._log(strings.getMessage('initializing_service'));
  }

  /**
   * Template method for service registration logic.
   * Should be overridden by subclasses.
   * @protected
   */
  _registerService() {
    const strings = getStringService();
    // Base implementation - override in subclasses
    this._log(strings.getMessage('registering_service'));
  }

  /**
   * Template method for finalization steps.
   * @protected
   */
  _finalizeInitialization() {
    const strings = getStringService();
    // Base implementation - override in subclasses
    this._log(strings.getMessage('finalizing_initialization'));
  }

  /**
   * Logs start of initialization.
   * @protected
   */
  _logStart() {
    const strings = getStringService();
    this._log(strings.getMessage('starting_initialization'));
  }

  /**
   * Logs successful initialization.
   * @protected
   */
  _logSuccess() {
    const strings = getStringService();
    this._log(strings.getMessage('initialization_completed'));
  }

  /**
   * Logs initialization errors.
   * @param error - The error to log
   * @protected
   */
  _logError(error) {
    this._log(`Initialization failed: ${error.message}`, error);
  }

  /**
   * General logging method.
   * @param message - The message to log
   * @param data - Optional additional data to log
   * @protected
   */
  _log(message, data) {
    if (this.service && this.service.getLogger) {
      this.service.getLogger()(message, data);
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(message, data || '');
    }
  }

  /**
   * Adds an error to the error collection.
   * @param error - The error to add
   * @protected
   */
  _addError(error) {
    if (typeof error === 'string') {
      this._errors.push(error);
    } else if (error && error.message) {
      this._errors.push(error.message);
    } else {
      this._errors.push(String(error));
    }
  }

  /**
   * Clears all errors.
   * @protected
   */
  _clearErrors() {
    this._errors = [];
  }

  /**
   * Resets the initializer to its initial state.
   */
  reset() {
    this._initialized = false;
    this._clearErrors();
  }

  /**
   * Gets initialization progress information.
   * @returns Object with initialization progress details
   */
  getProgress() {
    return {
      initialized: this._initialized,
      errorCount: this._errors.length,
      errors: this.getErrors(),
      serviceName: this.service?.constructor?.name || 'Unknown'
    };
  }

  /**
   * Checks if the initializer can be retried.
   * @returns True if initialization can be retried
   */
  canRetry() {
    return !this._initialized && this._errors.length > 0;
  }

  /**
   * Gets the service being initialized.
   * @returns The service instance
   */
  getService() {
    return this.service;
  }

  /**
   * Gets the configuration for the service.
   * @returns The configuration object
   */
  getConfig() {
    return this.config;
  }
}

module.exports = BaseInitializer;
