describe("bootstrap/services/cdn/import-map-init-service.js", () => {
  const modulePath = '../../../../../bootstrap/services/cdn/import-map-init-service.js';
  const moduleName = 'import-map-init-service.js';

  it('loads without throwing', () => {
    expect(require(modulePath)).toBeDefined();
  });

  it('registers the module in require.cache', () => {
    const moduleExports = require(modulePath);
    const resolved = require.resolve(modulePath);
    const cacheEntry = require.cache[resolved];
    expect(cacheEntry).toBeDefined();
    expect(cacheEntry.filename.endsWith(moduleName)).toBe(true);
    expect(moduleExports).toBe(require(resolved));
  });
});
