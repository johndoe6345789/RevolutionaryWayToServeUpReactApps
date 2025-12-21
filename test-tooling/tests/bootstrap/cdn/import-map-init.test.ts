describe("bootstrap/cdn/import-map-init.js", () => {
  const modulePath = '../../../../bootstrap/cdn/import-map-init.js';
  const expectedType = 'object';
  const expectArray = false;
  const expectEsModule = false;

  it('loads without throwing', () => {
    expect(require(modulePath)).toBeDefined();
  });

  it('exports the expected shape', () => {
    const moduleExports = require(modulePath);
    expect(typeof moduleExports).toBe(expectedType);
    expect(Array.isArray(moduleExports)).toBe(expectArray);
    expect(Boolean(moduleExports && moduleExports.__esModule)).toBe(expectEsModule);
  });
});
