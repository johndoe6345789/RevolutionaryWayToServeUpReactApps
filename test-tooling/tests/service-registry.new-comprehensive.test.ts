import ServiceRegistry from '../../bootstrap/registries/service-registry.js';

describe('ServiceRegistry', () => {
  let serviceRegistry;

  beforeEach(() => {
    serviceRegistry = new ServiceRegistry();
  });

  describe('constructor', () => {
    it('should initialize with an empty services map', () => {
      expect(serviceRegistry._services).toBeInstanceOf(Map);
      expect(serviceRegistry._services.size).toBe(0);
    });
  });

  describe('register method', () => {
    it('should register a service with name, service instance, metadata, and required services', () => {
      const mockService = { name: 'testService' };
      const metadata = { version: '1.0.0' };
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.isRegistered('testService')).toBe(true);
      expect(serviceRegistry.getService('testService')).toBe(mockService);
      expect(serviceRegistry.getMetadata('testService')).toEqual(metadata);
    });

    it('should throw an error if no name is provided', () => {
      expect(() => {
        serviceRegistry.register();
      }).toThrow('Service name is required');
    });

    it('should throw an error if service is already registered', () => {
      const mockService1 = { name: 'testService' };
      const mockService2 = { name: 'testService' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('testService', mockService1, metadata, requiredServices);

      expect(() => {
        serviceRegistry.register('testService', mockService2, metadata, requiredServices);
      }).toThrow('Service already registered: testService');
    });

    it('should throw an error if not exactly 4 parameters are provided', () => {
      const mockService = { name: 'testService' };
      const metadata = {};

      // Test with 1 parameter
      expect(() => {
        serviceRegistry.register('testService');
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');

      // Test with 2 parameters
      expect(() => {
        serviceRegistry.register('testService', mockService);
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');

      // Test with 3 parameters
      expect(() => {
        serviceRegistry.register('testService', mockService, metadata);
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');

      // Test with 5 parameters
      expect(() => {
        serviceRegistry.register('testService', mockService, metadata, [], 'extra');
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');
    });

    it('should use empty metadata object if null is provided', () => {
      const mockService = { name: 'testService' };
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, null, requiredServices);

      expect(serviceRegistry.getMetadata('testService')).toEqual({});
    });

    it('should use empty metadata object if undefined is provided', () => {
      const mockService = { name: 'testService' };
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, undefined, requiredServices);

      expect(serviceRegistry.getMetadata('testService')).toEqual({});
    });

    it('should validate required services exist in registry', () => {
      const mockService = { name: 'testService' };
      const metadata = {};
      const requiredServices = ['missingService'];

      expect(() => {
        serviceRegistry.register('testService', mockService, metadata, requiredServices);
      }).toThrow('Required services are not registered: missingService');
    });

    it('should allow registration when required services exist in registry', () => {
      const dependencyService = { name: 'dependency' };
      const mockService = { name: 'testService' };
      const metadata = {};
      const requiredServices = ['dependency'];

      serviceRegistry.register('dependency', dependencyService, metadata, []);
      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.isRegistered('testService')).toBe(true);
    });

    it('should allow registration when required services array is empty', () => {
      const mockService = { name: 'testService' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.isRegistered('testService')).toBe(true);
    });

    it('should allow registration when required services array is not provided', () => {
      // Actually, the function requires 4 parameters, so we test with empty array
      const mockService = { name: 'testService' };
      const metadata = {};

      serviceRegistry.register('testService', mockService, metadata, []);

      expect(serviceRegistry.isRegistered('testService')).toBe(true);
    });
  });

  describe('getService method', () => {
    it('should return the registered service', () => {
      const mockService = { name: 'testService' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.getService('testService')).toBe(mockService);
    });

    it('should return undefined for unregistered service', () => {
      expect(serviceRegistry.getService('nonExistentService')).toBeUndefined();
    });
  });

  describe('listServices method', () => {
    it('should return empty array when no services are registered', () => {
      expect(serviceRegistry.listServices()).toEqual([]);
    });

    it('should return array of registered service names', () => {
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('service1', service1, metadata, requiredServices);
      serviceRegistry.register('service2', service2, metadata, requiredServices);

      const serviceList = serviceRegistry.listServices();
      expect(serviceList).toContain('service1');
      expect(serviceList).toContain('service2');
      expect(serviceList.length).toBe(2);
    });

    it('should maintain registration order', () => {
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      const service3 = { name: 'service3' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('service2', service2, metadata, requiredServices);
      serviceRegistry.register('service3', service3, metadata, requiredServices);
      serviceRegistry.register('service1', service1, metadata, requiredServices);

      const serviceList = serviceRegistry.listServices();
      // The order in the array should follow the insertion order of Map
      expect(serviceList[0]).toBe('service2');
      expect(serviceList[1]).toBe('service3');
      expect(serviceList[2]).toBe('service1');
    });
  });

  describe('getMetadata method', () => {
    it('should return the metadata for a registered service', () => {
      const mockService = { name: 'testService' };
      const metadata = { version: '1.0.0', type: 'test' };
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.getMetadata('testService')).toEqual(metadata);
    });

    it('should return undefined for unregistered service', () => {
      expect(serviceRegistry.getMetadata('nonExistentService')).toBeUndefined();
    });

    it('should return empty object when service was registered without metadata', () => {
      const mockService = { name: 'testService' };
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, undefined, requiredServices);

      expect(serviceRegistry.getMetadata('testService')).toEqual({});
    });
  });

  describe('isRegistered method', () => {
    it('should return true for registered service', () => {
      const mockService = { name: 'testService' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('testService', mockService, metadata, requiredServices);

      expect(serviceRegistry.isRegistered('testService')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(serviceRegistry.isRegistered('nonExistentService')).toBe(false);
    });
  });

  describe('reset method', () => {
    it('should clear all registered services', () => {
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('service1', service1, metadata, requiredServices);
      serviceRegistry.register('service2', service2, metadata, requiredServices);

      expect(serviceRegistry.listServices().length).toBe(2);

      serviceRegistry.reset();

      expect(serviceRegistry.listServices().length).toBe(0);
      expect(serviceRegistry.isRegistered('service1')).toBe(false);
      expect(serviceRegistry.isRegistered('service2')).toBe(false);
    });

    it('should allow re-registration after reset', () => {
      const mockService1 = { name: 'testService' };
      const mockService2 = { name: 'testService' };
      const metadata = {};
      const requiredServices = [];

      serviceRegistry.register('testService', mockService1, metadata, requiredServices);
      expect(serviceRegistry.isRegistered('testService')).toBe(true);

      serviceRegistry.reset();
      expect(serviceRegistry.isRegistered('testService')).toBe(false);

      serviceRegistry.register('testService', mockService2, metadata, requiredServices);
      expect(serviceRegistry.isRegistered('testService')).toBe(true);
    });
  });

  describe('integration', () => {
    it('should register and retrieve multiple services with different metadata', () => {
      const service1 = { id: 1, name: 'UserService' };
      const service2 = { id: 2, name: 'OrderService' };
      const service3 = { id: 3, name: 'PaymentService' };

      serviceRegistry.register('user', service1, { scope: 'auth' }, []);
      serviceRegistry.register('order', service2, { scope: 'commerce' }, []);
      serviceRegistry.register('payment', service3, { scope: 'finance' }, []);

      expect(serviceRegistry.getService('user')).toBe(service1);
      expect(serviceRegistry.getService('order')).toBe(service2);
      expect(serviceRegistry.getService('payment')).toBe(service3);

      expect(serviceRegistry.getMetadata('user')).toEqual({ scope: 'auth' });
      expect(serviceRegistry.getMetadata('order')).toEqual({ scope: 'commerce' });
      expect(serviceRegistry.getMetadata('payment')).toEqual({ scope: 'finance' });

      const allServices = serviceRegistry.listServices();
      expect(allServices).toContain('user');
      expect(allServices).toContain('order');
      expect(allServices).toContain('payment');
      expect(allServices.length).toBe(3);
    });

    it('should handle complex dependencies between services', () => {
      const dbService = { type: 'database' };
      const cacheService = { type: 'cache' };
      const apiService = { type: 'api' };

      // Register base services first
      serviceRegistry.register('database', dbService, { layer: 'data' }, []);
      serviceRegistry.register('cache', cacheService, { layer: 'intermediate' }, []);

      // Register service that depends on the previous ones
      serviceRegistry.register('api', apiService, { layer: 'presentation' }, ['database', 'cache']);

      expect(serviceRegistry.isRegistered('database')).toBe(true);
      expect(serviceRegistry.isRegistered('cache')).toBe(true);
      expect(serviceRegistry.isRegistered('api')).toBe(true);

      expect(serviceRegistry.getService('api')).toBe(apiService);
    });
  });
});