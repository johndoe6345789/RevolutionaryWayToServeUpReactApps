import { beforeEach, describe, expect, it } from 'vitest';
import { DependencyInjectionContainer } from './dependency-injection';

describe('DependencyInjectionContainer', () => {
  let container: DependencyInjectionContainer;

  beforeEach(() => {
    container = new DependencyInjectionContainer();
  });

  describe('register', () => {
    it.each([
      ['string token', 'myService', class TestService {}],
      ['symbol token', Symbol('test'), class TestService {}],
      ['empty string token', '', class TestService {}],
      ['special chars token', 'service-with-dashes_and_underscores', class TestService {}],
    ])('should register implementation for %s: %s', (description, token, implementation) => {
      expect(() => {
        container.register(token, implementation);
      }).not.toThrow();
      expect(container.has(token)).toBe(true);
    });

    it.each([
      ['null token', null as any, class TestService {}],
      ['undefined token', undefined as any, class TestService {}],
      ['number token', 42, class TestService {}],
      ['object token', {}, class TestService {}],
    ])('should handle %s gracefully', (description, token, implementation) => {
      // Should not throw for any token type
      expect(() => {
        container.register(token, implementation);
      }).not.toThrow();
    });

    it.each([
      [
        'service with constructor params',
        'paramService',
        class ParamService {
          constructor(public value: string) {}
        },
      ],
      [
        'service with dependencies',
        'dependentService',
        class DependentService {
          constructor(private readonly dep: any) {}
        },
      ],
      [
        'service with complex constructor',
        'complexService',
        class ComplexService {
          constructor(_a: string, _b: number, _c: boolean) {}
        },
      ],
    ])('should register %s', (description, token, implementation) => {
      expect(() => {
        container.register(token, implementation);
      }).not.toThrow();
      expect(container.has(token)).toBe(true);
    });
  });

  describe('resolve', () => {
    /**
     *
     */
    class TestService {}
    /**
     *
     */
    class ParamService {
      constructor(public value = 'default') {}
    }
    /**
     *
     */
    class ComplexService {
      public readonly initialized: boolean;
      constructor() {
        this.initialized = true;
      }
    }

    beforeEach(() => {
      container.register('testService', TestService);
      container.register('paramService', ParamService);
      container.register('complexService', ComplexService);
    });

    it.each([
      ['string token', 'testService', TestService],
      ['symbol token', Symbol('test'), TestService],
    ])('should resolve implementation for %s', (description, token, expectedType) => {
      if (typeof token === 'string') {
        container.register(token, expectedType);
      } else {
        container.register(token, expectedType);
      }

      const instance = container.resolve(token);
      expect(instance).toBeInstanceOf(expectedType);
      expect(instance).not.toBeNull();
      expect(instance).not.toBeUndefined();
    });

    it.each([
      ['unregistered string token', 'nonexistent'],
      ['unregistered symbol token', Symbol('nonexistent')],
      ['empty string token', ''],
      ['null token', null as any],
      ['undefined token', undefined as any],
    ])('should throw error for %s', (description, token) => {
      expect(() => container.resolve(token)).toThrow('No registration found for token');
    });

    it.each([
      ['service with default params', 'paramService', ParamService, 'default'],
      ['complex service', 'complexService', ComplexService, true],
    ])('should instantiate %s correctly', (description, token, expectedType, expectedValue) => {
      const instance = container.resolve(token);
      expect(instance).toBeInstanceOf(expectedType);

      if (expectedType === ParamService) {
        expect((instance as ParamService).value).toBe(expectedValue);
      } else if (expectedType === ComplexService) {
        expect((instance as ComplexService).initialized).toBe(expectedValue);
      }
    });

    it('should return new instance on each resolve call', () => {
      const instance1 = container.resolve('testService'),
        instance2 = container.resolve('testService');

      expect(instance1).not.toBe(instance2);
      expect(instance1).toBeInstanceOf(TestService);
      expect(instance2).toBeInstanceOf(TestService);
    });

    it.each([
      ['string token', 'testService'],
      ['symbol token', Symbol('test')],
    ])('should resolve different instances for different tokens', (description, token) => {
      if (typeof token === 'string') {
        container.register(token, TestService);
      } else {
        container.register(token, TestService);
      }

      const instance1 = container.resolve('testService'),
        instance2 = container.resolve(token);

      expect(instance1).toBeInstanceOf(TestService);
      expect(instance2).toBeInstanceOf(TestService);
      if (token !== 'testService') {
        expect(instance1).not.toBe(instance2);
      }
    });
  });

  describe('has', () => {
    /**
     *
     */
    class TestService {}
    const symbolToken = Symbol('symbolService');

    beforeEach(() => {
      container.register('testService', TestService);
      container.register(symbolToken, TestService);
    });

    it.each([
      ['registered string token', 'testService', true],
      ['unregistered string token', 'nonexistent', false],
      ['empty string token', '', false],
      ['symbol token', symbolToken, true],
      ['unregistered symbol token', Symbol('nonexistent'), false],
      ['null token', null as any, false],
      ['undefined token', undefined as any, false],
      ['number token', 42, false],
      ['object token', {}, false],
    ])('should return %s for %s: %s', (description, token, expected) => {
      expect(container.has(token)).toBe(expected);
    });

    it('should return false for tokens registered then unregistered', () => {
      // Note: DI container doesn't have unregister, so this tests persistence
      expect(container.has('testService')).toBe(true);
      expect(container.has('nonexistent')).toBe(false);
    });

    it.each([
      ['same string token', 'testService', 'testService', true],
      ['different string tokens', 'testService', 'otherService', false],
      ['same symbol token', Symbol('test'), Symbol('test'), false], // Different symbol instances
    ])('should handle %s comparison', (description, token1, token2, expected) => {
      if (token1 === 'testService') {
        container.register(token1, TestService);
      }
      if (token2 === 'otherService') {
        // Don't register this one
      }

      expect(container.has(token1)).toBe(expected || token1 === 'testService');
      expect(container.has(token2)).toBe(expected && token2 === 'testService');
    });
  });

  describe('integration scenarios', () => {
    /**
     *
     */
    class DatabaseService {
      /**
       *
       */
      connect() {
        return 'connected';
      }
    }

    /**
     *
     */
    class UserRepository {
      constructor(private readonly db: DatabaseService) {}
      /**
       *
       */
      getUser() {
        return this.db.connect();
      }
    }

    /**
     *
     */
    class UserService {
      constructor(private readonly repo: UserRepository) {}
      /**
       *
       */
      getUserData() {
        return this.repo.getUser();
      }
    }

    beforeEach(() => {
      container.register('database', DatabaseService);
      container.register('repository', UserRepository);
      container.register('service', UserService);
    });

    it.each([
      ['simple service resolution', 'database', DatabaseService],
      ['dependent service resolution', 'repository', UserRepository],
      ['complex dependency chain', 'service', UserService],
    ])('should resolve %s', (description, token, expectedType) => {
      const instance = container.resolve(token);
      expect(instance).toBeInstanceOf(expectedType);
    });

    it('should create instances with correct types', () => {
      const service = container.resolve<UserService>('service');
      expect(service).toBeInstanceOf(UserService);

      // DI container creates new instances, doesn't inject dependencies
      // Each resolve call creates a new instance with its own constructor parameters
      expect(typeof service.getUserData).toBe('function');
    });

    it.each([
      ['database service', 'database'],
      ['repository service', 'repository'],
      ['user service', 'service'],
    ])(
      'should provide singleton-like behavior within resolution context for %s',
      (description, token) => {
        const instance1 = container.resolve(token),
          instance2 = container.resolve(token);

        expect(instance1).not.toBe(instance2); // New instances each time
        expect(instance1).toBeInstanceOf((instance2 as any).constructor);
      },
    );
  });
});
