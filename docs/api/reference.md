# API Reference Snapshot

This file lists every detected module along with its exported globals and functions.

## Modules

### `bootstrap.d.ts`

#### Globals
- _None_

#### Functions
- `bootstrap.d.ts:RequireFn`
- `bootstrap.d.ts:bootstrap`
- `bootstrap.d.ts:collectDynamicModuleImports`
- `bootstrap.d.ts:collectModuleSpecifiers`
- `bootstrap.d.ts:compileSCSS`
- `bootstrap.d.ts:compileTSX`
- `bootstrap.d.ts:createRequire`
- `bootstrap.d.ts:frameworkRender`
- `bootstrap.d.ts:injectCSS`
- `bootstrap.d.ts:loadConfig`
- `bootstrap.d.ts:loadDynamicModule`
- `bootstrap.d.ts:loadModules`
- `bootstrap.d.ts:loadScript`
- `bootstrap.d.ts:loadTools`
- `bootstrap.d.ts:normalizeProviderBase`
- `bootstrap.d.ts:preloadDynamicModulesFromSource`
- `bootstrap.d.ts:preloadModulesFromSource`
- `bootstrap.d.ts:probeUrl`
- `bootstrap.d.ts:resolveModuleUrl`

### `bootstrap.js`

#### Globals
- `bootstrap.js:bootstrapExports`
- `bootstrap.js:bootstrapNamespace`
- `bootstrap.js:globalRoot`
- `bootstrap.js:helpersNamespace`
- `bootstrap.js:isBrowser`
- `bootstrap.js:isCommonJs`
- `bootstrap.js:logging`
- `bootstrap.js:moduleLoader`
- `bootstrap.js:network`

#### Functions
- `bootstrap.js:bootstrap`
- `bootstrap.js:loadConfig`

### `bootstrap/cdn/dynamic-modules.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/dynamic-modules.js:addBase`
- `bootstrap/cdn/dynamic-modules.js:addProvidersInOrder`
- `bootstrap/cdn/dynamic-modules.js:createNamespace`
- `bootstrap/cdn/dynamic-modules.js:getDefaultProviderBase`
- `bootstrap/cdn/dynamic-modules.js:getFallbackProviders`
- `bootstrap/cdn/dynamic-modules.js:loadDynamicModule`
- `bootstrap/cdn/dynamic-modules.js:loadScript`
- `bootstrap/cdn/dynamic-modules.js:logClient`
- `bootstrap/cdn/dynamic-modules.js:makeNamespace`
- `bootstrap/cdn/dynamic-modules.js:normalizeProviderBase`
- `bootstrap/cdn/dynamic-modules.js:probeUrl`

### `bootstrap/cdn/import-map-init.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/import-map-init.js:resolveModuleUrl`
- `bootstrap/cdn/import-map-init.js:setDefaultProviderBase`
- `bootstrap/cdn/import-map-init.js:setFallbackProviders`
- `bootstrap/cdn/import-map-init.js:setProviderAliases`

### `bootstrap/cdn/logging.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/logging.js:detectCiLogging`
- `bootstrap/cdn/logging.js:isCiLoggingEnabled`
- `bootstrap/cdn/logging.js:logClient`
- `bootstrap/cdn/logging.js:serializeForLog`
- `bootstrap/cdn/logging.js:setCiLoggingEnabled`
- `bootstrap/cdn/logging.js:wait`

### `bootstrap/cdn/network.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/network.js:DEFAULT_PROVIDER_ALIASES`
- `bootstrap/cdn/network.js:addBase`
- `bootstrap/cdn/network.js:collectBases`
- `bootstrap/cdn/network.js:createAliasMap`
- `bootstrap/cdn/network.js:getDefaultProviderBase`
- `bootstrap/cdn/network.js:getFallbackProviders`
- `bootstrap/cdn/network.js:getProxyMode`
- `bootstrap/cdn/network.js:isCiLikeHost`
- `bootstrap/cdn/network.js:loadScript`
- `bootstrap/cdn/network.js:logClient`
- `bootstrap/cdn/network.js:normalizeProviderBase`
- `bootstrap/cdn/network.js:normalizeProviderBaseRaw`
- `bootstrap/cdn/network.js:normalizeProxyMode`
- `bootstrap/cdn/network.js:onerror`
- `bootstrap/cdn/network.js:onload`
- `bootstrap/cdn/network.js:probeUrl`
- `bootstrap/cdn/network.js:resolveModuleUrl`
- `bootstrap/cdn/network.js:resolveProvider`
- `bootstrap/cdn/network.js:setDefaultProviderBase`
- `bootstrap/cdn/network.js:setFallbackProviders`
- `bootstrap/cdn/network.js:setProviderAliases`
- `bootstrap/cdn/network.js:shouldRetryStatus`
- `bootstrap/cdn/network.js:wait`

### `bootstrap/cdn/source-utils.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/source-utils.js:collectDynamicModuleImports`
- `bootstrap/cdn/source-utils.js:collectModuleSpecifiers`
- `bootstrap/cdn/source-utils.js:maybeAdd`
- `bootstrap/cdn/source-utils.js:preloadDynamicModulesFromSource`
- `bootstrap/cdn/source-utils.js:preloadModulesFromSource`

### `bootstrap/cdn/tools.js`

#### Globals
- _None_

#### Functions
- `bootstrap/cdn/tools.js:createNamespace`
- `bootstrap/cdn/tools.js:ensureGlobalFromNamespace`
- `bootstrap/cdn/tools.js:loadModules`
- `bootstrap/cdn/tools.js:loadScript`
- `bootstrap/cdn/tools.js:loadTools`
- `bootstrap/cdn/tools.js:logClient`
- `bootstrap/cdn/tools.js:makeNamespace`
- `bootstrap/cdn/tools.js:resolveModuleUrl`

### `bootstrap/env.js`

#### Globals
- _None_

#### Functions
- _None_

### `bootstrap/local/local-loader.js`

#### Globals
- _None_

#### Functions
- `bootstrap/local/local-loader.js:createRequire`
- `bootstrap/local/local-loader.js:frameworkRender`
- `bootstrap/local/local-loader.js:getModuleExport`
- `bootstrap/local/local-loader.js:loadDynamicModule`
- `bootstrap/local/local-loader.js:logClient`
- `bootstrap/local/local-loader.js:require`
- `bootstrap/local/local-loader.js:requireAsync`

### `bootstrap/local/local-module-loader.js`

#### Globals
- _None_

#### Functions
- `bootstrap/local/local-module-loader.js:createLocalModuleLoader`
- `bootstrap/local/local-module-loader.js:executeModuleSource`
- `bootstrap/local/local-module-loader.js:fetchLocalModuleSource`
- `bootstrap/local/local-module-loader.js:getCandidateLocalPaths`
- `bootstrap/local/local-module-loader.js:getModuleDir`
- `bootstrap/local/local-module-loader.js:loadDynamicModule`
- `bootstrap/local/local-module-loader.js:loadLocalModule`
- `bootstrap/local/local-module-loader.js:loadPromise`
- `bootstrap/local/local-module-loader.js:logClient`
- `bootstrap/local/local-module-loader.js:makeAliasKey`
- `bootstrap/local/local-module-loader.js:normalizeDir`
- `bootstrap/local/local-module-loader.js:preloadModulesFromSource`
- `bootstrap/local/local-module-loader.js:resolveLocalModuleBase`
- `bootstrap/local/local-module-loader.js:transformSource`

### `bootstrap/local/local-paths.d.ts`

#### Globals
- _None_

#### Functions
- `bootstrap/local/local-paths.d.ts:getCandidateLocalPaths`
- `bootstrap/local/local-paths.d.ts:getModuleDir`
- `bootstrap/local/local-paths.d.ts:hasKnownExtension`
- `bootstrap/local/local-paths.d.ts:isLocalModule`
- `bootstrap/local/local-paths.d.ts:makeAliasKey`
- `bootstrap/local/local-paths.d.ts:normalizeDir`
- `bootstrap/local/local-paths.d.ts:resolveLocalModuleBase`

### `bootstrap/local/local-paths.js`

#### Globals
- _None_

#### Functions
- `bootstrap/local/local-paths.js:add`
- `bootstrap/local/local-paths.js:getCandidateLocalPaths`
- `bootstrap/local/local-paths.js:getModuleDir`
- `bootstrap/local/local-paths.js:hasKnownExtension`
- `bootstrap/local/local-paths.js:isLocalModule`
- `bootstrap/local/local-paths.js:makeAliasKey`
- `bootstrap/local/local-paths.js:normalizeDir`
- `bootstrap/local/local-paths.js:resolveLocalModuleBase`

### `bootstrap/local/sass-compiler.js`

#### Globals
- _None_

#### Functions
- `bootstrap/local/sass-compiler.js:compileSCSS`
- `bootstrap/local/sass-compiler.js:injectCSS`

### `bootstrap/local/tsx-compiler.js`

#### Globals
- _None_

#### Functions
- `bootstrap/local/tsx-compiler.js:compileTSX`
- `bootstrap/local/tsx-compiler.js:executeModuleSource`
- `bootstrap/local/tsx-compiler.js:logClient`
- `bootstrap/local/tsx-compiler.js:preloadModulesFromSource`
- `bootstrap/local/tsx-compiler.js:transformSource`

### `bootstrap/module-loader.js`

#### Globals
- _None_

#### Functions
- _None_

### `bootstrap/script-list-loader.js`

#### Globals
- _None_

#### Functions
- `bootstrap/script-list-loader.js:loadFromManifest`
- `bootstrap/script-list-loader.js:loadScript`
- `bootstrap/script-list-loader.js:log`
- `bootstrap/script-list-loader.js:onerror`
- `bootstrap/script-list-loader.js:onload`

### `e2e/playwright.config.ts`

#### Globals
- `e2e/playwright.config.ts:baseURL`
- `e2e/playwright.config.ts:config`
- `e2e/playwright.config.ts:configPath`
- `e2e/playwright.config.ts:host`
- `e2e/playwright.config.ts:parsedPort`
- `e2e/playwright.config.ts:port`
- `e2e/playwright.config.ts:rawConfig`
- `e2e/playwright.config.ts:serverConfig`

#### Functions
- _None_

### `e2e/run-e2e.js`

#### Globals
- `e2e/run-e2e.js:args`
- `e2e/run-e2e.js:baseUrl`
- `e2e/run-e2e.js:config`
- `e2e/run-e2e.js:host`
- `e2e/run-e2e.js:parsedPort`
- `e2e/run-e2e.js:port`
- `e2e/run-e2e.js:rawPort`
- `e2e/run-e2e.js:runner`
- `e2e/run-e2e.js:serverConfig`

#### Functions
- _None_

### `e2e/tests/page-load.spec.ts`

#### Globals
- _None_

#### Functions
- _None_

### `python/venv/lib/python3.12/site-packages/urllib3/contrib/emscripten/emscripten_fetch_worker.js`

#### Globals
- `python/venv/lib/python3.12/site-packages/urllib3/contrib/emscripten/emscripten_fetch_worker.js:Status`
- `python/venv/lib/python3.12/site-packages/urllib3/contrib/emscripten/emscripten_fetch_worker.js:connections`
- `python/venv/lib/python3.12/site-packages/urllib3/contrib/emscripten/emscripten_fetch_worker.js:encoder`
- `python/venv/lib/python3.12/site-packages/urllib3/contrib/emscripten/emscripten_fetch_worker.js:nextConnectionID`

#### Functions
- _None_

### `server/server.js`

#### Globals
- `server/server.js:app`
- `server/server.js:clientLogPath`
- `server/server.js:config`
- `server/server.js:envScriptPath`
- `server/server.js:esmProxy`
- `server/server.js:esmTarget`
- `server/server.js:express`
- `server/server.js:fs`
- `server/server.js:host`
- `server/server.js:http`
- `server/server.js:logPath`
- `server/server.js:logStream`
- `server/server.js:maxLogBodyLength`
- `server/server.js:parsedPort`
- `server/server.js:path`
- `server/server.js:port`
- `server/server.js:proxyMode`
- `server/server.js:proxyPath`
- `server/server.js:proxyRewrite`
- `server/server.js:proxyTarget`
- `server/server.js:rawPort`
- `server/server.js:rootDir`
- `server/server.js:server`

#### Functions
- `server/server.js:assertConfigValue`
- `server/server.js:formatBody`
- `server/server.js:logLine`
- `server/server.js:normalizeProxyMode`
- `server/server.js:shouldProxyEsm`

### `src/App.tsx`

#### Globals
- _None_

#### Functions
- `src/App.tsx:App`

### `src/components/FeaturedGames.tsx`

#### Globals
- _None_

#### Functions
- `src/components/FeaturedGames.tsx:FeaturedGames`

### `src/components/FooterStrip.tsx`

#### Globals
- _None_

#### Functions
- `src/components/FooterStrip.tsx:FooterStrip`

### `src/components/HeroSection.tsx`

#### Globals
- _None_

#### Functions
- `src/components/HeroSection.tsx:HeroSection`

### `src/data.ts`

#### Globals
- _None_

#### Functions
- _None_

### `src/theme.ts`

#### Globals
- `src/theme.ts:theme`

#### Functions
- _None_

### `test-tooling/tests/App.test.tsx`

#### Globals
- _None_

#### Functions
- _None_

### `test-tooling/tests/bootstrap.cdn.test.ts`

#### Globals
- `test-tooling/tests/bootstrap.cdn.test.ts:createLocation`
- `test-tooling/tests/bootstrap.cdn.test.ts:resetGlobals`

#### Functions
- `test-tooling/tests/bootstrap.cdn.test.ts:createLocation`
- `test-tooling/tests/bootstrap.cdn.test.ts:getDefaultProviderBase`
- `test-tooling/tests/bootstrap.cdn.test.ts:getFallbackProviders`
- `test-tooling/tests/bootstrap.cdn.test.ts:loadDynamicModules`
- `test-tooling/tests/bootstrap.cdn.test.ts:loadLogging`
- `test-tooling/tests/bootstrap.cdn.test.ts:loadNetwork`
- `test-tooling/tests/bootstrap.cdn.test.ts:normalizeProviderBase`
- `test-tooling/tests/bootstrap.cdn.test.ts:resetGlobals`

### `test-tooling/tests/bootstrap.require-default.test.ts`

#### Globals
- _None_

#### Functions
- `test-tooling/tests/bootstrap.require-default.test.ts:__importDefault`
- `test-tooling/tests/bootstrap.require-default.test.ts:fakeComponent`

### `test-tooling/tests/bootstrap.test.ts`

#### Globals
- _None_

#### Functions
- `test-tooling/tests/bootstrap.test.ts:any`

### `test-tooling/tests/components.test.tsx`

#### Globals
- `test-tooling/tests/components.test.tsx:renderWithTheme`

#### Functions
- `test-tooling/tests/components.test.tsx:renderWithTheme`

### `test-tooling/tests/data.test.ts`

#### Globals
- _None_

#### Functions
- _None_

### `test-tooling/tests/global.d.ts`

#### Globals
- _None_

#### Functions
- _None_

### `test-tooling/tests/linkSrcNodeModules.js`

#### Globals
- `test-tooling/tests/linkSrcNodeModules.js:expectedTarget`
- `test-tooling/tests/linkSrcNodeModules.js:fs`
- `test-tooling/tests/linkSrcNodeModules.js:linkDir`
- `test-tooling/tests/linkSrcNodeModules.js:linkPointsToTarget`
- `test-tooling/tests/linkSrcNodeModules.js:linkTarget`
- `test-tooling/tests/linkSrcNodeModules.js:nodeModulesDir`
- `test-tooling/tests/linkSrcNodeModules.js:path`

#### Functions
- `test-tooling/tests/linkSrcNodeModules.js:linkPointsToTarget`

### `test-tooling/tests/local-paths.test.ts`

#### Globals
- _None_

#### Functions
- _None_

### `test-tooling/tests/proxy-mode.test.ts`

#### Globals
- _None_

#### Functions
- _None_

### `test-tooling/tests/setupBun.ts`

#### Globals
- `test-tooling/tests/setupBun.ts:dom`
- `test-tooling/tests/setupBun.ts:fetchImpl`

#### Functions
- _None_

### `test-tooling/tests/setupTests.ts`

#### Globals
- _None_

#### Functions
- _None_
