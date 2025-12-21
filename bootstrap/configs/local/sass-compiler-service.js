/**
 * Configuration for SassCompilerService instances.
 * Provides SASS compilation settings and options.
 */
class SassCompilerServiceConfig {
  /**
   * Initializes a new Sass Compiler Service Config instance with the provided configuration.
   */
  constructor({
    outputStyle = 'expanded', // nested, expanded, compact, compressed
    sourceComments = false,
    includePaths = [],
    indentType = 'space', // space, tab
    indentWidth = 2,
    lineFeed = '\n',
    precision = 10,
  } = {}) {
    this.outputStyle = outputStyle;
    this.sourceComments = sourceComments;
    this.includePaths = includePaths;
    this.indentType = indentType;
    this.indentWidth = indentWidth;
    this.lineFeed = lineFeed;
    this.precision = precision;
  }
}

module.exports = SassCompilerServiceConfig;
