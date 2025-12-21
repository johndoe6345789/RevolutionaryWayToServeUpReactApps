/**
 * Ensures the import map is populated via the import map initializer helper.
 */
const BaseEntryPoint = require("../interfaces/base-entrypoint.js");
const ImportMapInitializer = require("../services/cdn/import-map-init-service.js");
const ImportMapInitConfig = require("../configs/cdn/import-map-init.js");

const entrypoint = new BaseEntryPoint({
  ServiceClass: ImportMapInitializer,
  ConfigClass: ImportMapInitConfig,
});
entrypoint.run();
