const FrameworkRenderer = require("../../../../../bootstrap/services/local/framework-renderer.js");

describe("bootstrap/services/local/framework-renderer.js", () => {
  describe("FrameworkRendererConfig", () => {
    it("stores the provided document reference", () => {
      const doc = { name: "doc" };
      const config = new FrameworkRenderer.Config({ document: doc });
      expect(config.document).toBe(doc);
    });

    it("leaves document undefined when omitted", () => {
      const config = new FrameworkRenderer.Config();
      expect(config.document).toBeUndefined();
    });
  });

  describe("initialize", () => {
    it("throws when no document is supplied", () => {
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config());
      expect(() => renderer.initialize()).toThrow("Document required for FrameworkRenderer");
    });

    it("sets the document and marks the instance initialized", () => {
      const doc = { getElementById: () => null };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      const result = renderer.initialize();
      expect(result).toBe(renderer);
      expect(renderer.document).toBe(doc);
      expect(renderer.initialized).toBe(true);
    });
  });

  describe("_getModuleExport", () => {
    it("returns null when the module is missing", () => {
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: {} }));
      expect(renderer._getModuleExport(null, "createRoot")).toBeNull();
    });

    it("returns a named export when present", () => {
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: {} }));
      const createRoot = () => "root";
      expect(renderer._getModuleExport({ createRoot }, "createRoot")).toBe(createRoot);
    });

    it("returns a default export when named export is absent", () => {
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: {} }));
      const createRoot = () => "root";
      expect(renderer._getModuleExport({ default: { createRoot } }, "createRoot")).toBe(createRoot);
    });

    it("returns null when the named export cannot be found", () => {
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: {} }));
      expect(renderer._getModuleExport({ default: {} }, "createRoot")).toBeNull();
    });
  });

  describe("render", () => {
    const App = () => null;

    const buildRegistry = ({ createRoot, createElement }) => ({
      reactDom: { createRoot },
      react: { createElement },
    });

    it("throws before initialization", () => {
      const doc = { getElementById: () => ({}) };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      expect(() =>
        renderer.render({ render: {} }, buildRegistry({}), App)
      ).toThrow("FrameworkRenderer not initialized");
    });

    it("renders using configured modules and root element", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const rendered = [];
      const createRoot = (el) => ({
        render: (node) => rendered.push({ el, node }),
      });
      const createElement = (Component) => ({ Component });
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      renderer.render(
        {
          render: {
            rootId: "root",
            domModule: "reactDom",
            reactModule: "react",
            createRoot: "createRoot",
          },
        },
        buildRegistry({ createRoot, createElement }),
        App
      );

      expect(rendered).toHaveLength(1);
      expect(rendered[0].el).toBe(rootEl);
      expect(rendered[0].node).toEqual({ Component: App });
    });

    it("honors a custom render method name", () => {
      const rootEl = { id: "custom-root" };
      const doc = { getElementById: () => rootEl };
      const rendered = [];
      const createRoot = (el) => ({
        hydrate: (node) => rendered.push({ el, node }),
      });
      const createElement = (Component) => ({ Component, mode: "hydrate" });
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      renderer.render(
        {
          render: {
            rootId: "custom-root",
            domModule: "reactDom",
            reactModule: "react",
            createRoot: "createRoot",
            renderMethod: "hydrate",
          },
        },
        buildRegistry({ createRoot, createElement }),
        App
      );

      expect(rendered).toHaveLength(1);
      expect(rendered[0].node).toEqual({ Component: App, mode: "hydrate" });
    });

    it("throws when the root element is missing", () => {
      const doc = { getElementById: () => null };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      expect(() =>
        renderer.render(
          { render: { rootId: "missing", domModule: "reactDom", reactModule: "react", createRoot: "createRoot" } },
          buildRegistry({ createRoot: () => ({ render: () => {} }), createElement: () => ({}) }),
          App
        )
      ).toThrow("Root element not found: #missing");
    });

    it("throws when the DOM module is missing", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      expect(() =>
        renderer.render(
          { render: { domModule: "reactDom", reactModule: "react", createRoot: "createRoot" } },
          { react: { createElement: () => ({}) } },
          App
        )
      ).toThrow("DOM render module missing: reactDom");
    });

    it("throws when the React module is missing", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      expect(() =>
        renderer.render(
          { render: { domModule: "reactDom", reactModule: "react", createRoot: "createRoot" } },
          { reactDom: { createRoot: () => ({ render: () => {} }) } },
          App
        )
      ).toThrow("React module missing: react");
    });

    it("throws when createRoot cannot be resolved", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      expect(() =>
        renderer.render(
          { render: { domModule: "reactDom", reactModule: "react", createRoot: "missingRoot" } },
          buildRegistry({ createRoot: () => ({ render: () => {} }), createElement: () => ({}) }),
          App
        )
      ).toThrow("createRoot not found: missingRoot");
    });

    it("throws when the render method is unavailable", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      const createRoot = () => ({});
      const createElement = () => ({});

      expect(() =>
        renderer.render(
          {
            render: {
              domModule: "reactDom",
              reactModule: "react",
              createRoot: "createRoot",
              renderMethod: "paint",
            },
          },
          buildRegistry({ createRoot, createElement }),
          App
        )
      ).toThrow("Render method not found: paint");
    });

    it("throws when createElement is missing from the React module", () => {
      const rootEl = { id: "root" };
      const doc = { getElementById: () => rootEl };
      const renderer = new FrameworkRenderer(new FrameworkRenderer.Config({ document: doc }));
      renderer.initialize();

      const createRoot = () => ({ render: () => {} });
      const registry = { reactDom: { createRoot }, react: {} };

      expect(() =>
        renderer.render(
          { render: { domModule: "reactDom", reactModule: "react", createRoot: "createRoot" } },
          registry,
          App
        )
      ).toThrow("createElement not found on React module");
    });
  });
});
