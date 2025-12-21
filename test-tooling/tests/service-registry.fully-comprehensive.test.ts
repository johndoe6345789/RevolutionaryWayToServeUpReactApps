import ServiceRegistry from '../../bootstrap/registries/service-registry.js';

describe('ServiceRegistry', () => {
  describe('constructor', () => {
    it('should initialize with an empty services map', () => {
      const registry = new ServiceRegistry();

      expect(registry._services).toBeInstanceOf(Map);
      expect(registry._services.size).toBe(0);
    });
  });

  describe('register method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
    });

    it('should register a service with name, service instance, metadata, and required services', () => {
      const service = { name: 'testService' };
      const metadata = { folder: 'test', domain: 'test' };
      const requiredServices = ['dependency'];

      registry.register('testService', service, metadata, requiredServices);

      const stored = registry._services.get('testService');
      expect(stored.service).toBe(service);
      expect(stored.metadata).toEqual(metadata);
    });

    it('should throw an error if no name is provided', () => {
      expect(() => {
        registry.register();
      }).toThrow('Service name is required');
    });

    it('should throw an error if service is already registered', () => {
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      
      registry.register('testService', service1, {}, []);
      
      expect(() => {
        registry.register('testService', service2, {}, []);
      }).toThrow('Service already registered: testService');
    });

    it('should throw an error if not exactly 4 parameters are provided', () => {
      expect(() => {
        registry.register('testService', { name: 'service' }, {});
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');
      
      expect(() => {
        registry.register('testService', { name: 'service' });
      }).toThrow('ServiceRegistry.register requires exactly 4 parameters: (name, service, metadata, requiredServices)');
    });

    it('should use empty metadata object if null is provided', () => {
      const service = { name: 'testService' };
      
      registry.register('testService', service, null, []);

      const stored = registry._services.get('testService');
      expect(stored.metadata).toEqual({});
    });

    it('should use empty metadata object if undefined is provided', () => {
      const service = { name: 'testService' };
      
      registry.register('testService', service, undefined, []);

      const stored = registry._services.get('testService');
      expect(stored.metadata).toEqual({});
    });

    it('should validate required services exist in registry', () => {
      const service = { name: 'testService' };
      
      expect(() => {
        registry.register('testService', service, {}, ['missingService']);
      }).toThrow('Required services are not registered: missingService');
    });

    it('should allow registration when required services exist in registry', () => {
      const dependencyService = { name: 'dependency' };
      const service = { name: 'testService' };
      
      registry.register('dependency', dependencyService, {}, []);
      registry.register('testService', service, {}, ['dependency']);

      expect(registry.getService('testService')).toBe(service);
    });

    it('should allow registration when required services array is empty', () => {
      const service = { name: 'testService' };
      
      registry.register('testService', service, {}, []);

      expect(registry.getService('testService')).toBe(service);
    });

    it('should allow registration when required services array is not provided', () => {
      const service = { name: 'testService' };
      
      registry.register('testService', service, {});
      // This should not throw because the fourth parameter is still required, so we'll test with []
      expect(() => registry.register('testService2', service, {}, [])).not.toThrow();
    });
  });

  describe('getService method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
      registry.register('testService', { name: 'service' }, {}, []);
    });

    it('should return the registered service', () => {
      const service = registry.getService('testService');
      
      expect(service).toEqual({ name: 'service' });
    });

    it('should return undefined for unregistered service', () => {
      const service = registry.getService('unregistered');
      
      expect(service).toBeUndefined();
    });
  });

  describe('listServices method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
    });

    it('should return empty array when no services are registered', () => {
      const services = registry.listServices();
      
      expect(services).toEqual([]);
    });

    it('should return array of registered service names', () => {
      registry.register('service1', { name: 'service1' }, {}, []);
      registry.register('service2', { name: 'service2' }, {}, []);
      
      const services = registry.listServices();
      
      expect(services).toEqual(['service1', 'service2']);
    });

    it('should maintain registration order', () => {
      registry.register('first', { name: 'first' }, {}, []);
      registry.register('second', { name: 'second' }, {}, []);
      registry.register('third', { name: 'third' }, {}, []);
      
      const services = registry.listServices();
      
      expect(services).toEqual(['first', 'second', 'third']);
    });
  });

  describe('getMetadata method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
      registry.register('testService', { name: 'service' }, { folder: 'test' }, []);
    });

    it('should return the metadata for a registered service', () => {
      const metadata = registry.getMetadata('testService');
      
      expect(metadata).toEqual({ folder: 'test' });
    });

    it('should return undefined for unregistered service', () => {
      const metadata = registry.getMetadata('unregistered');
      
      expect(metadata).toBeUndefined();
    });

    it('should return empty object when service was registered without metadata', () => {
      const registry2 = new ServiceRegistry();
      registry2.register('testService', { name: 'service' }, {}, []);
      
      const metadata = registry2.getMetadata('testService');
      
      expect(metadata).toEqual({});
    });
  });

  describe('isRegistered method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
      registry.register('testService', { name: 'service' }, {}, []);
    });

    it('should return true for registered service', () => {
      const isRegistered = registry.isRegistered('testService');
      
      expect(isRegistered).toBe(true);
    });

    it('should return false for unregistered service', () => {
      const isRegistered = registry.isRegistered('unregistered');
      
      expect(isRegistered).toBe(false);
    });
  });

  describe('reset method', () => {
    let registry;

    beforeEach(() => {
      registry = new ServiceRegistry();
      registry.register('testService', { name: 'service' }, {}, []);
    });

    it('should clear all registered services', () => {
      expect(registry._services.size).toBe(1);
      
      registry.reset();
      
      expect(registry._services.size).toBe(0);
    });

    it('should allow re-registration after reset', () => {
      registry.reset();
      
      const service = { name: 'newService' };
      registry.register('newService', service, {}, []);
      
      expect(registry.getService('newService')).toBe(service);
    });
  });

  describe('integration', () => {
    it('should register and retrieve multiple services with different metadata', () => {
      const registry = new ServiceRegistry();
      
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      const service3 = { name: 'service3' };
      
      registry.register('service1', service1, { folder: 'folder1', domain: 'domain1' }, []);
      registry.register('service2', service2, { folder: 'folder2', domain: 'domain2' }, []);
      registry.register('service3', service3, {}, []);
      
      expect(registry.getService('service1')).toBe(service1);
      expect(registry.getService('service2')).toBe(service2);
      expect(registry.getService('service3')).toBe(service3);
      
      expect(registry.getMetadata('service1')).toEqual({ folder: 'folder1', domain: 'domain1' });
      expect(registry.getMetadata('service2')).toEqual({ folder: 'folder2', domain: 'domain2' });
      expect(registry.getMetadata('service3')).toEqual({});
      
      expect(registry.listServices()).toEqual(['service1', 'service2', 'service3']);
    });

    it('should handle complex dependencies between services', () => {
      const registry = new ServiceRegistry();
      
      const depService = { name: 'depService' };
      const mainService = { name: 'mainService' };
      
      registry.register('depService', depService, {}, []);
      registry.register('mainService', mainService, {}, ['depService']);
      
      expect(registry.getService('depService')).toBe(depService);
      expect(registry.getService('mainService')).toBe(mainService);
    });
  });
});