describe("bootstrap/entrypoints/script-list-loader.js", () => {
  const modulePath = '../../../../bootstrap/entrypoints/script-list-loader.js';
  const moduleName = 'script-list-loader.js';

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
