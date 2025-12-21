describe("bootstrap/services/base-service.js", () => {
  const modulePath = '../../../../bootstrap/services/base-service.js';
  const moduleName = 'base-service.js';

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
