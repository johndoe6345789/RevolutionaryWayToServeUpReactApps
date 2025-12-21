const ScriptListLoader = require("../services/core/script-list-loader-service.js");

const scriptListLoader = new ScriptListLoader();
scriptListLoader.initialize();
scriptListLoader.load();
