describe("bootstrap/initializers/loaders/local-module-loader.js", () => {
  const modulePath = '../../../../../bootstrap/initializers/loaders/local-module-loader.js';
  const moduleName = 'local-module-loader.js';

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
