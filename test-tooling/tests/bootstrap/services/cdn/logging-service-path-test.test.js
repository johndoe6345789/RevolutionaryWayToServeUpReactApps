describe("LoggingService import test", () => {
  const modulePath = '../../../../../bootstrap/services/cdn/logging-service.js';

  it('should load logging service using same path as original test', () => {
    expect(require(modulePath)).toBeDefined();
  });
});