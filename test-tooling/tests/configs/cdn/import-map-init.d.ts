export = ImportMapInitConfig;

declare class ImportMapInitConfig {
  constructor(options?: { window?: Window; fetch?: typeof fetch });
  window?: Window;
  fetch?: typeof fetch;
}
