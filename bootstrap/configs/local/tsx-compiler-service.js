/**
 * Configuration for TsxCompilerService instances.
 * Provides TSX/JSX compilation settings and options.
 */
class TsxCompilerServiceConfig {
  /**
   * Initializes a new TSX Compiler Service Config instance with the provided configuration.
   */
  constructor({
    presets = ['@babel/preset-react', '@babel/preset-typescript'],
    plugins = [],
    sourceMaps = true,
    minify = false,
    target = 'es2022',
    moduleResolution = 'node',
    allowJs = true,
    jsxFactory = 'React.createElement',
    jsxFragment = 'React.Fragment',
    strictMode = true,
  } = {}) {
    this.presets = presets;
    this.plugins = plugins;
    this.sourceMaps = sourceMaps;
    this.minify = minify;
    this.target = target;
    this.moduleResolution = moduleResolution;
    this.allowJs = allowJs;
    this.jsxFactory = jsxFactory;
    this.jsxFragment = jsxFragment;
    this.strictMode = strictMode;
  }
}

module.exports = TsxCompilerServiceConfig;
