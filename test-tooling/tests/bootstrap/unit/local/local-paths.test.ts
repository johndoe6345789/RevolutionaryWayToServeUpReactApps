import {
  getCandidateLocalPaths,
  getModuleDir,
  hasKnownExtension,
  isLocalModule,
  makeAliasKey,
  normalizeDir,
  resolveLocalModuleBase
} from "../../../bootstrap/initializers/path-utils/local-paths.js";

describe("local path helpers", () => {
  it("classifies relative and absolute modules", () => {
    expect(isLocalModule("./foo")).toBe(true);
    expect(isLocalModule("/bar")).toBe(true);
    expect(isLocalModule("library")).toBe(false);
  });

  it("normalizes directories and builds alias keys", () => {
    expect(normalizeDir("/base//")).toBe("base");
    expect(normalizeDir("")).toBe("");
    expect(makeAliasKey("entry", "/base/")).toBe("base|entry");
  });

  it("resolves paths using a provided href when needed", () => {
    const resolved = resolveLocalModuleBase(
      "./entry",
      "",
      "https://example.com/deeper/page.html"
    );
    expect(resolved).toBe("deeper/entry");
  });

  it("extracts module directories and checks extensions", () => {
    expect(getModuleDir("nested/block/component.tsx")).toBe("nested/block");
    expect(getModuleDir("main.ts")).toBe("");
    expect(hasKnownExtension("component.tsx")).toBe(true);
    expect(hasKnownExtension("component.style")).toBe(false);
  });

  it("builds candidate locals for extension-less and indexed paths", () => {
    const candidates = getCandidateLocalPaths("path/to/module");
    expect(candidates).toContain("path/to/module");
    expect(candidates).toContain("path/to/module.tsx");
    expect(candidates).toContain("path/to/module/index.js");
    expect(candidates.filter((candidate) => candidate.endsWith("index.js")).length).toBe(1);

    const explicit = getCandidateLocalPaths("path/to/component.jsx");
    expect(explicit).toEqual(["path/to/component.jsx"]);
  });
});
