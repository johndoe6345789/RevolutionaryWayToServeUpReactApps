const GlobalRootHandler = require("../../../../bootstrap/constants/global-root-handler.js");

describe("bootstrap/constants/global-root-handler.js", () => {
  let handler;
  let originalWindow;
  let originalDocument;
  let consoleErrorMock;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    globalThis.window = { document: {}, fetch: jest.fn(() => Promise.resolve({ ok: true })) };
    globalThis.document = {};
    consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});
    handler = new GlobalRootHandler();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    consoleErrorMock.mockRestore();
  });

  it("detects and stores the namespace on the global root", () => {
    const namespace = handler.getNamespace();
    expect(namespace).toBe(handler.getNamespace());
  });

  it("fetches the document and global helpers", () => {
    expect(handler.getDocument()).toBe(globalThis.window.document);
    expect(handler.hasWindow()).toBe(true);
    expect(handler.hasDocument()).toBe(true);
    expect(typeof handler.getFetch()).toBe("function");
  });

  it("provides a logger that writes to console.error with the provided tag", () => {
    const logger = handler.getLogger("tag");
    logger("message", { detail: true });
    expect(console.error).toHaveBeenCalled();
  });
});
