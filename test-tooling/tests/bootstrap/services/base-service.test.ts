describe("bootstrap/services/base-service.js", () => {
  const modulePath = '../../../../bootstrap/services/base-service.js';
  const BaseService = require(modulePath);

  it('throws when initialize is not implemented', () => {
    const service = new BaseService();

    expect(() => service.initialize()).toThrow("BaseService must implement initialize()");
  });

  it('enforces initialization lifecycle guards', () => {
    const service = new BaseService();

    expect(() => service._ensureInitialized()).toThrow("BaseService not initialized");
    service._markInitialized();
    expect(() => service._ensureNotInitialized()).toThrow("BaseService already initialized");
  });

  it('requires a service registry and namespace when accessed', () => {
    const service = new BaseService();

    expect(() => service._requireServiceRegistry())
      .toThrow("ServiceRegistry required for BaseService");
    expect(() => service._resolveNamespace())
      .toThrow("Namespace required for BaseService");
  });
});
